const express = require("express");
const { FinanceError } = require("../services/ledger");
const payroll = require("../services/payroll");

const router = express.Router();

router.use((req, res, next) => {
  if (req.account.role !== "owner") throw new FinanceError(403, "Only the owner can access faculty payroll.");
  next();
});

router.get("/runs", async (req, res) => {
  res.json(await payroll.listRuns(req.query));
});

router.post("/runs", async (req, res) => {
  res.status(201).json(await payroll.createRun(req.body, req.account.email));
});

router.get("/runs/:id", async (req, res) => {
  res.json(payroll.ownerRun(await payroll.getRun(req.params.id)));
});

router.get("/runs/:id/workloads", async (req, res) => {
  const run = await payroll.getRun(req.params.id);
  res.json(await payroll.workloadChoices(run.period));
});

router.post("/runs/:id/workloads", async (req, res) => {
  const run = await payroll.getRun(req.params.id);
  if (run.status !== "draft") throw new FinanceError(409, "Workloads can only be imported from a draft payroll run.");
  await payroll.importWorkload(run.period, req.body, req.account.email);
  res.status(201).json(await payroll.workloadChoices(run.period));
});

router.put("/runs/:id/lines", async (req, res) => {
  res.json(await payroll.saveLine(await payroll.getRun(req.params.id), req.body, req.account.email));
});

router.delete("/runs/:id/lines/:lineId", async (req, res) => {
  const revision = /^\d+$/.test(req.query.revision) ? Number(req.query.revision) : NaN;
  res.json(await payroll.removeLine(await payroll.getRun(req.params.id), req.params.lineId, revision));
});

router.post("/runs/:id/finalize", async (req, res) => {
  res.json(await payroll.finalize(await payroll.getRun(req.params.id), req.body?.revision, req.account.email));
});

router.post("/runs/:id/settlement", async (req, res) => {
  const run = await payroll.settle(await payroll.getRun(req.params.id), req.body, req.account.email);
  res.json(payroll.ownerRun(run));
});

module.exports = router;
