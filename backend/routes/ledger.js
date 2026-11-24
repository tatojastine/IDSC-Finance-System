const express = require("express");
const { Enrollment, Charge, PartnerItem } = require("../models/FinanceLedger");
const ledger = require("../services/ledger");

const router = express.Router();

function ownerOnly(req, res, next) {
  if (req.account.role !== "owner") throw new ledger.FinanceError(403, "Only the owner can perform this action.");
  next();
}

router.get("/enrollments", async (req, res) => {
  const search = ledger.readText(req.query.search, "Search", 100, false);
  const page = Number(req.query.page ?? 1);
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) {
    throw new ledger.FinanceError(400, "Invalid enrollment page.");
  }
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = search ? { $or: ["studentId", "name", "term"].map((field) => ({
    [field]: { $regex: escaped, $options: "i" }
  })) } : {};
  const rows = await Enrollment.find(filter).sort({ name: 1, _id: 1 }).skip((page - 1) * 25).limit(26).lean();
  res.json({ rows: rows.slice(0, 25), hasMore: rows.length > 25 });
});

router.post("/enrollments", ownerOnly, async (req, res) => {
  const result = await ledger.createEnrollment(req.body);
  res.status(201).json(result.enrollment);
});

router.get("/enrollments/:id", async (req, res) => {
  res.json(await ledger.getAccount(await ledger.getEnrollment(req.params.id)));
});

router.post("/charges", ownerOnly, async (req, res) => {
  const result = await ledger.createCharge(req.body, req.account);
  res.status(result.created ? 201 : 200).json(result.charge);
});

router.post("/payments", async (req, res) => {
  const result = await ledger.postPayment(req.body, req.account, "finance");
  res.status(result.created ? 201 : 200).json(result.payment);
});

router.get("/payments/:id/receipt", async (req, res) => {
  res.json(await ledger.findReceipt(req.params.id));
});

router.post("/payments/:id/reversals", async (req, res) => {
  res.status(201).json(await ledger.changeReversal(req.params.id, req.body, req.account, false));
});

router.patch("/payments/:id/reversal", ownerOnly, async (req, res) => {
  res.json(await ledger.changeReversal(req.params.id, req.body, req.account, true));
});

router.get("/reversals", ownerOnly, async (req, res) => {
  const charges = await Charge.find({ "payments.reversals.status": "pending" }).populate("enrollmentId", "studentId name term").lean();
  const rows = charges.flatMap((charge) => charge.payments.flatMap((payment) => {
    const reversal = payment.reversals.find((item) => item.status === "pending");
    if (!reversal) return [];
    return [{
      paymentId: payment._id, amountMinor: payment.amountMinor, charge: charge.label,
      enrollment: charge.enrollmentId, ...reversal
    }];
  }));
  rows.sort((a, b) => a.requestedAt - b.requestedAt);
  res.json(rows);
});

router.get("/reports/daily", async (req, res) => {
  res.json(await ledger.dailyReport(req.query.date, req.account));
});

router.get("/reports/tuition", ownerOnly, async (req, res) => {
  res.json(await ledger.tuitionBalances(req.query.status ?? "overdue", Number(req.query.page ?? 1)));
});

router.get("/reports/daily.csv", async (req, res) => {
  const report = await ledger.dailyReport(req.query.date, req.account);
  res.attachment(`IDSC-collections-${report.date}.csv`);
  res.type("text/csv").send(ledger.dailyReportCsv(report));
});

router.get("/partner-items", ownerOnly, async (req, res) => {
  res.json(await PartnerItem.find().sort({ updatedAt: -1 }).limit(100).lean());
});

router.patch("/partner-items/:id", ownerOnly, async (req, res) => {
  const transitions = {
    approve: { partner: "inventory", from: "submitted", to: "approved" },
    reject: { partner: "inventory", from: "submitted", to: "rejected" },
    settle: { partner: "inventory", from: "approved", to: "settled" },
    review: { partner: "faculty", from: "submitted", to: "reviewed" }
  };
  const action = req.body?.action;
  if (typeof action !== "string" || !Object.hasOwn(transitions, action)) {
    throw new ledger.FinanceError(400, "Invalid partner record action.");
  }
  const transition = transitions[action];
  const reference = ledger.readText(req.body?.reference, "Decision reference", 200, ["reject", "settle"].includes(action));
  const item = await PartnerItem.findOneAndUpdate({
    _id: ledger.objectId(req.params.id), partner: transition.partner, status: transition.from
  }, {
    $set: { status: transition.to },
    $push: { decisions: { status: transition.to, actor: req.account.email, at: new Date(), reference } }
  }, { returnDocument: "after" });
  if (!item) throw new ledger.FinanceError(409, "This action is unavailable for the current status.");
  res.json(item);
});

module.exports = router;
