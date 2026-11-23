const express = require("express");
const { createHash, timingSafeEqual } = require("node:crypto");
const { Charge, Enrollment, PartnerItem } = require("../models/FinanceLedger");
const ledger = require("../services/ledger");
const payroll = require("../services/payroll");

const router = express.Router();
const partners = ["registrar", "cashier", "library", "inventory", "faculty", "personnel", "disbursement", "accounting"];

function authorize(req, res, next) {
  const [partner] = req.path.split("/").filter(Boolean);
  if (!partners.includes(partner)) throw new ledger.FinanceError(404, "Unknown integration.");
  const configured = process.env[`FINANCE_${partner.toUpperCase()}_TOKEN_HASH`];
  if (!/^[a-f0-9]{64}$/.test(configured)) throw new ledger.FinanceError(503, "This integration is not configured.");
  const token = /^Bearer ([A-Za-z0-9_-]{32,128})$/i.exec(req.get("Authorization") ?? "")?.[1];
  if (!token || !timingSafeEqual(createHash("sha256").update(token).digest(), Buffer.from(configured, "hex"))) {
    throw new ledger.FinanceError(401, "This integration requires its own valid token.");
  }
  res.set("Cache-Control", "no-store");
  next();
}

router.use(authorize);

async function findEnrollment(identifier, academicTerm) {
  const studentId = ledger.readReference(identifier, "Student ID");
  const term = ledger.readReference(academicTerm, "Academic term");
  const enrollment = await Enrollment.findOne({ studentId, term }).lean();
  if (!enrollment) throw new ledger.FinanceError(404, "Enrollment not found.");
  return enrollment;
}

router.post("/registrar/enrollments", async (req, res) => {
  const result = await ledger.createEnrollment(req.body, "registrar");
  const { _id, studentId, term } = result.enrollment;
  res.status(result.created ? 201 : 200).json({ id: _id, studentId, term });
});

router.get("/registrar/students/:studentId/standing", async (req, res) => {
  const enrollment = await findEnrollment(req.params.studentId, req.query.term);
  const account = await ledger.getAccount(enrollment);
  const standing = account.totalMinor === 0 ? "unassessed" : account.outstandingMinor === 0 ? "settled" : "outstanding";
  res.json({ studentId: enrollment.studentId, term: enrollment.term, standing, outstandingMinor: account.outstandingMinor });
});

router.get("/cashier/students/:studentId/charges", async (req, res) => {
  const account = await ledger.getAccount(await findEnrollment(req.params.studentId, req.query.term));
  res.json(account.charges.map(({ id, label, outstandingMinor }) => ({ id, label, outstandingMinor })));
});

router.post("/cashier/payments", async (req, res) => {
  const operator = ledger.readReference(req.body?.operatorRef, "Cashier operator reference");
  const result = await ledger.postPayment(req.body, { id: `cashier:${operator}`, email: `Cashier system · ${operator}` }, "cashier");
  res.status(result.created ? 201 : 200).json({
    paymentId: result.payment._id, receiptNumber: result.payment.receiptNumber,
    status: result.payment.status, remainingChargeMinor: result.payment.balanceAfterMinor
  });
});

router.post("/library/fines", async (req, res) => {
  const enrollment = await findEnrollment(req.body?.studentId, req.body?.term);
  const result = await ledger.createCharge(
    { ...req.body, enrollmentId: enrollment._id }, { email: "Library system" }, "library"
  );
  res.status(result.created ? 201 : 200).json({ id: result.charge.id, reference: result.charge.reference });
});

router.get("/library/fines/:reference", async (req, res) => {
  const reference = ledger.readReference(req.params.reference, "Fine reference");
  const charge = await Charge.findOne({ key: `library:${reference}` }).lean();
  if (!charge) throw new ledger.FinanceError(404, "Library fine not found.");
  const outstandingMinor = ledger.outstanding(charge);
  res.json({ reference, status: outstandingMinor === 0 ? "settled" : "outstanding", outstandingMinor });
});

function inventoryDetails(body) {
  if (!Array.isArray(body?.items) || body.items.length < 1 || body.items.length > 50) {
    throw new ledger.FinanceError(400, "Include 1 to 50 received items.");
  }
  const items = body.items.map((item) => {
    if (!Number.isSafeInteger(item?.quantity) || item.quantity < 1 || item.quantity > 100000) {
      throw new ledger.FinanceError(400, "Received quantity must be a positive whole number.");
    }
    return {
      itemRef: ledger.readReference(item?.itemRef, "Item reference"), quantity: item.quantity,
      unitCostMinor: ledger.readAmount(item?.unitCostMinor)
    };
  });
  return {
    approvedOrderRef: ledger.readReference(body.approvedOrderRef, "Approved order reference"),
    receivingRef: ledger.readReference(body.receivingRef, "Receiving reference"),
    vendorRef: ledger.readReference(body.vendorRef, "Vendor reference"),
    amountMinor: ledger.readAmount(items.reduce((sum, item) => sum + item.quantity * item.unitCostMinor, 0)),
    items
  };
}

function partnerStatus(item) {
  const decision = item.decisions.at(-1);
  return { externalId: item.externalId, status: item.status, updatedAt: item.updatedAt, reference: decision?.reference };
}

for (const [partner, resource, validate] of [
  ["inventory", "payables", inventoryDetails], ["faculty", "workloads", payroll.facultyDetails]
]) {
  router.post(`/${partner}/${resource}`, async (req, res) => {
    const externalId = ledger.readReference(req.body?.externalId, "External reference");
    const details = validate(req.body);
    try {
      const item = await PartnerItem.create({ partner, externalId, details });
      res.status(201).json(partnerStatus(item));
    } catch (error) {
      if (error.code !== 11000) throw error;
      const item = await PartnerItem.findOne({ partner, externalId }).lean();
      if (!item && error.keyPattern?.["details.receivingRef"]) {
        throw new ledger.FinanceError(409, "This receiving reference already has a Finance payable.");
      }
      if (!item || JSON.stringify(item.details) !== JSON.stringify(details)) {
        throw new ledger.FinanceError(409, "This source reference was already used with different details.");
      }
      res.json(partnerStatus(item));
    }
  });
  router.get(`/${partner}/${resource}/:reference`, async (req, res) => {
    const externalId = ledger.readReference(req.params.reference, "External reference");
    const item = await PartnerItem.findOne({ partner, externalId }).lean();
    if (!item) throw new ledger.FinanceError(404, "Partner record not found.");
    res.json(partnerStatus(item));
  });
}

router.post("/personnel/payroll-rates", async (req, res) => {
  const result = await payroll.importRate(req.body);
  res.status(result.created ? 201 : 200).json({ externalId: result.externalId });
});

for (const [partner, present] of [["disbursement", payroll.disbursementRun], ["accounting", payroll.summary]]) {
  router.get(`/${partner}/payroll-runs`, async (req, res) => {
    res.json(await payroll.listRuns(req.query, true));
  });
  router.get(`/${partner}/payroll-runs/:id`, async (req, res) => {
    res.json(present(await payroll.getRun(req.params.id, true)));
  });
}

router.post("/disbursement/payroll-runs/:id/settlement", async (req, res) => {
  const run = await payroll.settle(await payroll.getRun(req.params.id, true), req.body, "Disbursement system");
  res.json(payroll.disbursementRun(run));
});

module.exports = router;
