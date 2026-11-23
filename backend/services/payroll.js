const { Types } = require("mongoose");
const { PartnerItem } = require("../models/FinanceLedger");
const { PayrollRate, PayrollRun } = require("../models/FacultyPayroll");
const { FinanceError, readText, readReference, readAmount, objectId } = require("./ledger");

function approvedHours(value) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 100000) {
    throw new FinanceError(400, "Provide 0.01 to 1,000 approved hours in hundredths of an hour.");
  }
  return value;
}

function facultyDetails(body) {
  return {
    employeeRef: readReference(body?.employeeRef, "Employee reference"),
    period: readReference(body?.period, "Workload period"),
    approvedHoursHundredths: approvedHours(body?.approvedHoursHundredths)
  };
}

function unsignedMoney(value, field) {
  if (value === 0) return 0;
  if (!Number.isSafeInteger(value) || value < 0 || value > 1000000000) {
    throw new FinanceError(400, `${field} must be a non-negative whole number of centavos.`);
  }
  return value;
}

function totals(lines) {
  const result = { facultyCount: lines.length, baseMinor: 0, additionsMinor: 0, deductionsMinor: 0, grossMinor: 0, netMinor: 0 };
  for (const line of lines) {
    for (const key of ["baseMinor", "additionsMinor", "deductionsMinor", "grossMinor", "netMinor"]) {
      result[key] += line[key];
    }
  }
  return result;
}

function summary(run) {
  return {
    id: String(run._id), period: run.period, currency: "PHP", status: run.status,
    totals: totals(run.lines), createdAt: run.createdAt, finalizedAt: run.finalizedAt,
    settlement: run.settlement && {
      reference: run.settlement.reference, amountMinor: run.settlement.amountMinor,
      recordedAt: run.settlement.recordedAt
    }
  };
}

function ownerRun(run) {
  return { ...summary(run), revision: run.revision, lines: run.lines, createdBy: run.createdBy, finalizedBy: run.finalizedBy,
    settledBy: run.settlement?.recordedBy };
}

function disbursementRun(run) {
  return { ...summary(run), allocations: run.lines.map((line) => ({ employeeRef: line.employeeRef, netMinor: line.netMinor })) };
}

async function createRun(body, actor) {
  const period = readReference(body?.period, "Payroll period");
  try {
    const run = await PayrollRun.create({ period, createdBy: actor });
    return ownerRun(run.toObject());
  } catch (error) {
    if (error.code === 11000) throw new FinanceError(409, "A payroll run already exists for this period.");
    throw error;
  }
}

async function getRun(id, released = false) {
  const filter = { _id: objectId(id, "payroll run ID") };
  if (released) filter.status = { $in: ["finalized", "settled"] };
  const run = await PayrollRun.findOne(filter).lean();
  if (!run) throw new FinanceError(404, "Payroll run not found.");
  return run;
}

async function listRuns(query, released = false) {
  const filter = {};
  if (query.period !== undefined) filter.period = readReference(query.period, "Payroll period");
  if (released) filter.status = { $in: ["finalized", "settled"] };
  const page = Number(query.page ?? 1);
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) throw new FinanceError(400, "Invalid payroll page.");
  const runs = await PayrollRun.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * 20).limit(21).lean();
  return { rows: runs.slice(0, 20).map(summary), hasMore: runs.length > 20 };
}

async function workloadChoices(period) {
  const records = await PartnerItem.find({
    partner: "faculty", status: "reviewed", "details.period": period
  }).select("externalId details").sort({ "details.employeeRef": 1, updatedAt: -1 }).lean();
  const rates = await PayrollRate.find({ period }).lean();
  const rateByEmployee = new Map(rates.map((row) => [row.employeeRef, row]));
  return records.map((record) => {
    const rate = rateByEmployee.get(record.details.employeeRef);
    return {
      id: String(record._id), reference: record.externalId, ...record.details,
      personnelRate: rate && { displayName: rate.displayName, hourlyRateMinor: rate.hourlyRateMinor, approvalRef: rate.approvalRef }
    };
  });
}

async function importWorkload(period, body, actor) {
  const externalId = readReference(body?.reference, "Workload reference");
  const approvalRef = readReference(body?.approvalRef, "Workload approval reference");
  const details = facultyDetails({ ...body, period });
  try {
    await PartnerItem.create({
      partner: "faculty", externalId, details, status: "reviewed",
      decisions: [{ status: "reviewed", actor, at: new Date(), reference: approvalRef }]
    });
  } catch (error) {
    if (error.code === 11000) throw new FinanceError(409, "That faculty workload reference is already recorded.");
    throw error;
  }
}

function ensureDraft(run, revision) {
  if (run.status !== "draft") throw new FinanceError(409, "Only a draft payroll run can be edited.");
  if (!Number.isSafeInteger(revision) || revision !== run.revision) {
    throw new FinanceError(409, "This payroll run changed. Reload it and try again.");
  }
}

async function writeRun(run, changes) {
  const updated = await PayrollRun.findOneAndUpdate(
    { _id: run._id, revision: run.revision, status: run.status },
    { $set: changes, $inc: { revision: 1 } },
    { returnDocument: "after" }
  ).lean();
  if (!updated) throw new FinanceError(409, "This payroll run changed. Reload it and try again.");
  return updated;
}

async function saveLine(run, body, actor) {
  ensureDraft(run, body?.revision);
  const workloadId = objectId(body?.workloadId, "workload ID");
  const workload = await PartnerItem.findOne({
    _id: workloadId, partner: "faculty", status: "reviewed", "details.period": run.period
  }).lean();
  if (!workload) throw new FinanceError(409, "Choose a reviewed workload for this payroll period.");
  const { employeeRef, approvedHoursHundredths: hoursHundredths } = workload.details;
  const existing = run.lines.find((row) => row.employeeRef === employeeRef);
  if (existing ? String(existing._id) !== body?.lineId : body?.lineId !== undefined) {
    throw new FinanceError(409, existing ? "This faculty member already has a payroll line. Edit the existing line." : "The line no longer exists.");
  }
  const personnel = await PayrollRate.findOne({ employeeRef, period: run.period }).lean();
  const displayName = personnel?.displayName ?? readText(body?.displayName, "Faculty name", 140);
  const hourlyRateMinor = personnel?.hourlyRateMinor ?? readAmount(body?.hourlyRateMinor);
  const rateApprovalRef = personnel?.approvalRef ?? readReference(body?.rateApprovalRef, "Rate approval reference");
  const additionsMinor = unsignedMoney(body?.additionsMinor ?? 0, "Additions");
  const deductionsMinor = unsignedMoney(body?.deductionsMinor ?? 0, "Deductions");
  const additionNote = readText(body?.additionNote, "Addition reason", 200, additionsMinor > 0);
  const deductionNote = readText(body?.deductionNote, "Deduction reason", 200, deductionsMinor > 0);
  const baseMinor = Math.floor((hourlyRateMinor * approvedHours(hoursHundredths) + 50) / 100);
  const grossMinor = readAmount(baseMinor + additionsMinor);
  if (deductionsMinor > grossMinor) throw new FinanceError(400, "Deductions cannot exceed gross pay.");

  const line = {
    _id: existing?._id ?? new Types.ObjectId(), workloadId: workload._id, workloadRef: workload.externalId,
    employeeRef, displayName, hoursHundredths, hourlyRateMinor, rateSource: personnel ? "personnel" : "finance",
    rateApprovalRef, baseMinor, additionsMinor, additionNote, deductionsMinor, deductionNote, grossMinor,
    netMinor: grossMinor - deductionsMinor, preparedBy: actor, preparedAt: new Date()
  };
  const lines = existing
    ? run.lines.map((item) => String(item._id) === String(existing._id) ? line : item)
    : [...run.lines, line];
  return ownerRun(await writeRun(run, { lines }));
}

async function removeLine(run, id, revision) {
  ensureDraft(run, revision);
  objectId(id, "payroll line ID");
  const lines = run.lines.filter((line) => String(line._id) !== id);
  if (lines.length === run.lines.length) throw new FinanceError(404, "Payroll line not found.");
  return ownerRun(await writeRun(run, { lines }));
}

async function finalize(run, revision, actor) {
  ensureDraft(run, revision);
  if (run.lines.length === 0) throw new FinanceError(409, "Add at least one payroll line before finalizing.");
  return ownerRun(await writeRun(run, { status: "finalized", finalizedAt: new Date(), finalizedBy: actor }));
}

async function settle(run, body, actor) {
  const reference = readReference(body?.reference, "Settlement reference");
  const amountMinor = body?.amountMinor;
  if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) {
    throw new FinanceError(400, "Settlement amount must be a non-negative whole number of centavos.");
  }
  if (amountMinor !== totals(run.lines).netMinor) throw new FinanceError(409, "Settlement amount must match the finalized net pay.");
  if (run.status === "settled" && run.settlement.reference === reference) return run;
  if (run.status !== "finalized") throw new FinanceError(409, "Only a finalized, unsettled run can receive a settlement.");
  try {
    return await writeRun(run, {
      status: "settled", settlement: { reference, amountMinor, recordedAt: new Date(), recordedBy: actor }
    });
  } catch (error) {
    if (error.code === 11000) throw new FinanceError(409, "This settlement reference belongs to another payroll run.");
    if (error.status === 409) {
      const latest = await getRun(run._id);
      if (latest.status === "settled" && latest.settlement.reference === reference) return latest;
    }
    throw error;
  }
}

async function importRate(body) {
  const data = {
    externalId: readReference(body?.externalId, "Personnel reference"),
    employeeRef: readReference(body?.employeeRef, "Employee reference"),
    displayName: readText(body?.displayName, "Faculty name", 140),
    period: readReference(body?.period, "Payroll period"),
    hourlyRateMinor: readAmount(body?.hourlyRateMinor),
    approvalRef: readReference(body?.approvalRef, "Rate approval reference")
  };
  try {
    await PayrollRate.create(data);
    return { externalId: data.externalId, created: true };
  } catch (error) {
    if (error.code !== 11000) throw error;
    const existing = await PayrollRate.findOne({ externalId: data.externalId }).lean();
    if (existing && Object.entries(data).every(([key, value]) => existing[key] === value)) {
      return { externalId: data.externalId, created: false };
    }
    throw new FinanceError(409, "A different approved rate already exists for this reference or employee and period.");
  }
}

module.exports = {
  ownerRun, summary, disbursementRun, createRun, getRun, listRuns, workloadChoices,
  importWorkload, saveLine, removeLine, finalize, settle, importRate, facultyDetails
};
