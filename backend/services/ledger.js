const { createHash, randomUUID } = require("node:crypto");
const mongoose = require("mongoose");
const { Enrollment, Charge } = require("../models/FinanceLedger");

class FinanceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const methods = ["Cash", "Bank Transfer", "Online Payment", "Other"];
const identifierPattern = /^[\p{L}\p{N}][\p{L}\p{N} ._/-]*$/u;

function readText(value, field, limit = 100, required = true) {
  const result = typeof value === "string" ? value.trim() : "";
  if ((required && !result) || result.length > limit || /[\u0000-\u001f\u007f]/.test(result)) {
    throw new FinanceError(400, `${field} must contain ${required ? "1 to " : "at most "}${limit} characters.`);
  }
  return result;
}

function readReference(value, field) {
  const result = readText(value, field, 80);
  if (!identifierPattern.test(result)) throw new FinanceError(400, `Invalid ${field.toLowerCase()}.`);
  return result;
}

function readAmount(value) {
  if (!Number.isSafeInteger(value) || value <= 0 || value > 1000000000) {
    throw new FinanceError(400, "Amount must be a positive whole number of centavos, up to ₱10,000,000.");
  }
  return value;
}

function objectId(value, field = "ID") {
  if (!mongoose.isObjectIdOrHexString(value)) throw new FinanceError(400, `Invalid ${field}.`);
  return value;
}

function fingerprint(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function approvedReversal(payment) {
  return payment.reversals.find((item) => item.status === "approved");
}

function outstanding(charge) {
  return charge.amountMinor - charge.payments.reduce(
    (sum, payment) => sum + (approvedReversal(payment) ? 0 : payment.amountMinor), 0
  );
}

function publicPayment(payment) {
  const { key, fingerprint: storedFingerprint, postedActorId, ...rest } = payment;
  return { ...rest, receiptNumber: `FIN-${payment._id.toUpperCase()}`, status: approvedReversal(payment) ? "reversed" : "posted" };
}

function publicCharge(charge) {
  return {
    id: String(charge._id),
    enrollmentId: String(charge.enrollmentId),
    label: charge.label,
    amountMinor: charge.amountMinor,
    outstandingMinor: outstanding(charge),
    source: charge.source,
    reference: charge.reference,
    payments: charge.payments.map(publicPayment)
  };
}

async function createEnrollment(body, source = "finance") {
  const data = {
    studentId: readReference(body?.studentId, "Student ID"),
    term: readReference(body?.term, "Academic term"),
    name: readText(body?.name, "Student name", 140),
    program: readText(body?.program, "Program", 120),
    source
  };
  if (source === "registrar") data.externalId = readReference(body?.externalId, "Enrollment reference");
  try {
    const enrollment = await Enrollment.create(data);
    return { enrollment: enrollment.toObject(), created: true };
  } catch (error) {
    if (error.code !== 11000) throw error;
    const existing = data.externalId && await Enrollment.findOne({ source, externalId: data.externalId }).lean();
    if (existing && Object.entries(data).every(([key, value]) => existing[key] === value)) {
      return { enrollment: existing, created: false };
    }
    throw new FinanceError(409, "This enrollment or source reference already exists.");
  }
}

async function getEnrollment(id) {
  const enrollment = await Enrollment.findById(objectId(id, "enrollment ID")).lean();
  if (!enrollment) throw new FinanceError(404, "Enrollment not found.");
  return enrollment;
}

async function getAccount(enrollment) {
  const charges = await Charge.find({ enrollmentId: enrollment._id }).sort({ createdAt: -1 }).lean();
  return {
    enrollment,
    totalMinor: charges.reduce((total, row) => total + row.amountMinor, 0),
    outstandingMinor: charges.reduce((total, row) => total + outstanding(row), 0),
    charges: charges.map(publicCharge)
  };
}

async function createCharge(body, actor, source = "finance") {
  const enrollment = await getEnrollment(body?.enrollmentId);
  const reference = readReference(body?.reference, "Charge reference");
  const data = {
    enrollmentId: enrollment._id,
    label: readText(body?.label, "Charge description", 140),
    amountMinor: readAmount(body?.amountMinor),
    source, reference,
    createdBy: actor.email,
    key: source === "library" ? `library:${reference}` : `finance:${enrollment._id}:${reference}`
  };
  try {
    const charge = await Charge.create(data);
    return { charge: publicCharge(charge.toObject()), created: true };
  } catch (error) {
    if (error.code !== 11000) throw error;
    const existing = await Charge.findOne({ key: data.key }).lean();
    if (existing && String(existing.enrollmentId) === String(data.enrollmentId) &&
        existing.label === data.label && existing.amountMinor === data.amountMinor) {
      return { charge: publicCharge(existing), created: false };
    }
    throw new FinanceError(409, "This charge reference already exists with different details.");
  }
}

// Each charge owns its payments and receipts. Versioned document writes keep the
// balance and all related records consistent on standalone MongoDB.
async function changeCharge(filter, change) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const charge = await Charge.findOne(filter).lean();
    if (!charge) throw new FinanceError(404, "Charge or payment not found.");
    const result = await change(charge);
    const write = await Charge.updateOne(
      { _id: charge._id, revision: charge.revision },
      { $set: { payments: charge.payments }, $inc: { revision: 1 } }
    );
    if (write.modifiedCount === 1) return result;
  }
  throw new FinanceError(409, "The account changed while saving. Retry the same request.");
}

async function postPayment(body, actor, keyPrefix) {
  const chargeId = objectId(body?.chargeId, "charge ID");
  const amountMinor = readAmount(body?.amountMinor);
  const method = body?.method;
  if (!methods.includes(method)) throw new FinanceError(400, "Choose a supported payment method.");
  const reference = readText(body?.reference, "Payment reference", 120, method !== "Cash");
  const key = `${keyPrefix}:${readReference(body?.requestId, "Payment request ID")}`;
  const signature = fingerprint({ chargeId: String(chargeId), amountMinor, method, reference, actorId: actor.id });
  const paymentId = randomUUID();

  async function findReplay() {
    const existing = await Charge.findOne({ "payments.key": key }).lean();
    if (!existing) return null;
    const payment = existing.payments.find((entry) => entry.key === key);
    if (payment.fingerprint !== signature) {
      throw new FinanceError(409, "This payment reference was already used with different details.");
    }
    return { payment: publicPayment(payment), created: false };
  }

  const repeated = await findReplay();
  if (repeated) return repeated;
  try {
    return await changeCharge({ _id: chargeId }, async (charge) => {
      const duplicate = charge.payments.find((entry) => entry.key === key);
      if (duplicate) {
        if (duplicate.fingerprint !== signature) throw new FinanceError(409, "This payment reference has already been used.");
        return { payment: publicPayment(duplicate), created: false };
      }
      const balance = outstanding(charge);
      if (amountMinor > balance) throw new FinanceError(409, "Payment exceeds the charge’s outstanding balance.");
      const enrollment = await getEnrollment(charge.enrollmentId);
      const payment = {
        _id: paymentId, key, fingerprint: signature, amountMinor, method, reference,
        postedAt: new Date(), postedBy: actor.email, postedActorId: actor.id, studentName: enrollment.name,
        balanceAfterMinor: balance - amountMinor, reversals: []
      };
      charge.payments.push(payment);
      return { payment: publicPayment(payment), created: true };
    });
  } catch (error) {
    if (error.code === 11000) {
      const replay = await findReplay();
      if (replay) return replay;
    }
    throw error;
  }
}

async function changeReversal(paymentId, body, actor, decision) {
  return changeCharge({ "payments._id": readReference(paymentId, "Payment ID") }, (charge) => {
    const payment = charge.payments.find((item) => item._id === paymentId);
    const pending = payment.reversals.find((item) => item.status === "pending");
    if (decision) {
      if (!["approved", "rejected"].includes(body?.status)) throw new FinanceError(400, "Choose Approve or Reject.");
      if (!pending) throw new FinanceError(409, "There is no pending reversal to review.");
      const decisionNote = readText(body?.note, "Decision note", 300, body.status === "rejected");
      Object.assign(pending, { status: body.status, decisionNote, decidedAt: new Date(), decidedBy: actor.email });
    } else {
      const reason = readText(body?.reason, "Reversal reason", 300);
      if (pending || approvedReversal(payment)) throw new FinanceError(409, "A reversal already exists for this payment.");
      payment.reversals.push({ reason, status: "pending", requestedAt: new Date(), requestedBy: actor.email });
    }
    return publicPayment(payment);
  });
}

async function findReceipt(paymentId) {
  const charge = await Charge.findOne({ "payments._id": readReference(paymentId, "Payment ID") }).lean();
  if (!charge) throw new FinanceError(404, "Receipt not found.");
  const enrollment = await getEnrollment(charge.enrollmentId);
  return {
    ...publicPayment(charge.payments.find((item) => item._id === paymentId)),
    studentId: enrollment.studentId, term: enrollment.term, charge: charge.label
  };
}

async function dailyReport(date, account) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new FinanceError(400, "Choose a date in YYYY-MM-DD format.");
  }
  const midnightUtc = new Date(date + "T00:00:00Z");
  if (Number.isNaN(+midnightUtc) || midnightUtc.toISOString().slice(0, 10) !== date) {
    throw new FinanceError(400, "Choose a valid calendar date.");
  }
  const start = new Date(+midnightUtc - 8 * 60 * 60 * 1000);
  const end = new Date(+start + 24 * 60 * 60 * 1000);
  const window = { $gte: start, $lt: end };
  const charges = await Charge.find({
    $or: [{ "payments.postedAt": window }, { "payments.reversals.decidedAt": window }]
  }).lean();
  const rows = [];
  for (const charge of charges) {
    for (const payment of charge.payments) {
      if (account.role !== "owner" && payment.postedActorId !== account.id) continue;
      const row = {
        paymentId: payment._id, receiptNumber: `FIN-${payment._id.toUpperCase()}`,
        postedBy: payment.postedBy, method: payment.method, amountMinor: payment.amountMinor
      };
      if (payment.postedAt >= start && payment.postedAt < end) {
        rows.push({ ...row, type: "collection", at: payment.postedAt });
      }
      const reversal = approvedReversal(payment);
      if (reversal?.decidedAt >= start && reversal.decidedAt < end) {
        rows.push({ ...row, type: "reversal", at: reversal.decidedAt, decidedBy: reversal.decidedBy });
      }
    }
  }
  rows.sort((a, b) => b.at - a.at);
  const groups = new Map();
  const totals = { collectedMinor: 0, reversedMinor: 0, netMinor: 0 };
  for (const row of rows) {
    const key = JSON.stringify([row.postedBy, row.method]);
    const group = groups.get(key) ?? {
      postedBy: row.postedBy, method: row.method, collectedMinor: 0, reversedMinor: 0, netMinor: 0
    };
    const column = row.type === "collection" ? "collectedMinor" : "reversedMinor";
    group[column] += row.amountMinor;
    totals[column] += row.amountMinor;
    group.netMinor = group.collectedMinor - group.reversedMinor;
    groups.set(key, group);
  }
  totals.netMinor = totals.collectedMinor - totals.reversedMinor;
  return { date, timezone: "Asia/Manila", totals, groups: [...groups.values()], rows };
}

function dailyReportCsv(report) {
  function csvCell(value) {
    const text = typeof value === "number" ? value.toFixed(2) : value;
    const safe = typeof value === "string" && /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
    return '"' + safe.replace(/"/g, '""') + '"';
  }

  const totals = (row) => [row.collectedMinor / 100, row.reversedMinor / 100, row.netMinor / 100];
  const rows = [
    ["Business date", "Cashier", "Method", "Collected PHP", "Reversed PHP", "Net PHP"],
    ...report.groups.map((row) => [report.date, row.postedBy, row.method, ...totals(row)]),
    [report.date, "TOTAL", "", ...totals(report.totals)]
  ];
  return "\ufeff" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

module.exports = {
  FinanceError, readText, readReference, readAmount, objectId, methods,
  createEnrollment, getEnrollment, getAccount, createCharge, postPayment, changeReversal,
  findReceipt, dailyReport, dailyReportCsv, publicCharge, outstanding
};
