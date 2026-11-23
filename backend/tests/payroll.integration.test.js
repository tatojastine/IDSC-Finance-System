const assert = require("node:assert/strict");
const { createHash, randomBytes } = require("node:crypto");
const { once } = require("node:events");
const test = require("node:test");
const mongoose = require("mongoose");

const mongoUri = process.env.FINANCE_TEST_MONGO;

test("owner payroll with Faculty, Personnel, Disbursement and Accounting contracts", { skip: !mongoUri }, async () => {
  const app = require("../server");
  const CashierAccount = require("../models/CashierAccount");
  const { CashierSession } = require("../routes/auth");
  const { PartnerItem } = require("../models/FinanceLedger");
  const models = require("../models/FacultyPayroll");
  const tokens = Object.fromEntries(["faculty", "personnel", "disbursement", "accounting"].map((name) =>
    [name, randomBytes(32).toString("hex")]));
  for (const [name, token] of Object.entries(tokens)) {
    process.env["FINANCE_" + name.toUpperCase() + "_TOKEN_HASH"] = createHash("sha256").update(token).digest("hex");
  }

  await mongoose.connect(mongoUri, { dbName: "faculty_payroll_test_" + randomBytes(8).toString("hex") });
  let server;
  try {
    await Promise.all([CashierAccount, CashierSession, PartnerItem, ...Object.values(models)].map((model) => model.init()));
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const base = "http://127.0.0.1:" + server.address().port + "/api/v1";
    async function call(method, path, input, headers = {}) {
      const response = await fetch(base + path, {
        method, headers: { ...(input && { "Content-Type": "application/json" }), ...headers },
        body: input && JSON.stringify(input)
      });
      return { status: response.status, body: await response.json(), headers: response.headers };
    }
    function verify(response, expected) {
      assert.equal(response.status, expected, JSON.stringify(response.body));
      return response.body;
    }
    const token = (name) => ({ Authorization: "Bearer " + tokens[name] });
    const ownerCredentials = { email: "owner@example.test", password: "Fictional Payroll Admin" };
    const cashierCredentials = { email: "cashier@example.test", password: "Fictional Payroll Cashier" };
    async function login(credentials) {
      const result = await call("POST", "/auth/login", credentials);
      verify(result, 200);
      return { Cookie: result.headers.get("set-cookie").split(";")[0] };
    }
    verify(await call("POST", "/auth/setup", ownerCredentials), 201);
    const owner = await login(ownerCredentials);
    const cashier = verify(await call("POST", "/auth/register", cashierCredentials), 201);
    verify(await call("PATCH", "/auth/cashiers/" + cashier.id, { action: "approve" }, owner), 200);
    const operator = await login(cashierCredentials);
    verify(await call("GET", "/payroll/runs", null, operator), 403);

    const period = "DEMO-2026-11";
    const run = verify(await call("POST", "/payroll/runs", { period }, owner), 201);
    const runPath = "/payroll/runs/" + run.id;
    assert.equal(run.status, "draft");
    verify(await call("POST", "/payroll/runs", { period }, owner), 409);
    verify(await call("POST", runPath + "/finalize", { revision: 0 }, owner), 409);
    const disbursement = "/integrations/disbursement/payroll-runs";
    const accounting = "/integrations/accounting/payroll-runs";
    assert.deepEqual(verify(await call("GET", disbursement, null, token("disbursement")), 200).rows, []);
    verify(await call("GET", accounting + "/" + run.id, null, token("accounting")), 404);
    verify(await call("GET", disbursement + "/" + run.id, null, token("faculty")), 401);
    verify(await call("POST", runPath + "/settlement", { reference: "INCOMPLETE", amountMinor: 0 }, owner), 409);

    const facultyWorkload = { externalId: "WL-01", employeeRef: "EMP-01", period, approvedHoursHundredths: 1250 };
    verify(await call("POST", "/integrations/faculty/workloads", facultyWorkload, token("faculty")), 201);
    const submitted = await PartnerItem.findOne({ externalId: "WL-01" }).lean();
    verify(await call("PUT", runPath + "/lines", { workloadId: submitted._id, revision: 0 }, owner), 409);
    verify(await call("PATCH", "/ledger/partner-items/" + submitted._id, { action: "review" }, owner), 200);

    const rate = { externalId: "HR-01", employeeRef: "EMP-01", displayName: "Fictional Faculty One",
      period, hourlyRateMinor: 50000, approvalRef: "HR-APPROVAL-01" };
    verify(await call("POST", "/integrations/personnel/payroll-rates", rate, token("personnel")), 201);
    verify(await call("POST", "/integrations/personnel/payroll-rates", rate, token("personnel")), 200);
    verify(await call("POST", "/integrations/personnel/payroll-rates", { ...rate, hourlyRateMinor: 50100 }, token("personnel")), 409);
    const choices = verify(await call("GET", runPath + "/workloads", null, owner), 200);
    assert.equal(choices[0].personnelRate.hourlyRateMinor, 50000);
    const line = { workloadId: String(submitted._id), revision: 0, hourlyRateMinor: 1,
      additionsMinor: 25000, additionNote: "Demo allowance", deductionsMinor: 10000, deductionNote: "Demo approved deduction" };
    const simultaneous = await Promise.all([call("PUT", runPath + "/lines", line, owner), call("PUT", runPath + "/lines", line, owner)]);
    assert.deepEqual(simultaneous.map((result) => result.status).sort(), [200, 409]);
    let draft = simultaneous.find((result) => result.status === 200).body;
    assert.equal(draft.lines[0].hourlyRateMinor, 50000);
    assert.equal(draft.lines[0].rateSource, "personnel");
    assert.equal(draft.lines[0].netMinor, 640000);
    verify(await call("PUT", runPath + "/lines", { ...line, revision: draft.revision }, owner), 409);

    const workload = { reference: "MANUAL-WL-02", approvalRef: "APPROVED-02", employeeRef: "EMP-02", approvedHoursHundredths: 101 };
    const imported = verify(await call("POST", runPath + "/workloads", workload, owner), 201);
    const second = imported.find((row) => row.employeeRef === "EMP-02");
    const secondLine = { workloadId: second.id, revision: draft.revision, displayName: "Fictional Faculty Two", hourlyRateMinor: 12345,
      rateApprovalRef: "RATE-02", additionsMinor: 2, additionNote: "Demo addition", deductionsMinor: 1, deductionNote: "Demo deduction" };
    verify(await call("PUT", runPath + "/lines", { ...secondLine, deductionsMinor: 20000 }, owner), 400);
    draft = verify(await call("PUT", runPath + "/lines", secondLine, owner), 200);
    assert.equal(draft.lines[1].baseMinor, 12468);
    assert.equal(draft.lines[1].netMinor, 12469);
    assert.equal(draft.totals.netMinor, 652469);

    verify(await call("POST", runPath + "/finalize", { revision: 1 }, owner), 409);
    const final = verify(await call("POST", runPath + "/finalize", { revision: draft.revision }, owner), 200);
    assert.equal(final.status, "finalized");
    verify(await call("DELETE", runPath + "/lines/" + draft.lines[0]._id + "?revision=" + final.revision, null, owner), 409);

    const released = verify(await call("GET", disbursement + "/" + run.id, null, token("disbursement")), 200);
    assert.deepEqual(released.allocations, [{ employeeRef: "EMP-01", netMinor: 640000 }, { employeeRef: "EMP-02", netMinor: 12469 }]);
    const report = verify(await call("GET", accounting + "/" + run.id, null, token("accounting")), 200);
    assert.equal(report.totals.netMinor, 652469);
    assert.equal(report.allocations, undefined);
    assert.equal(report.lines, undefined);
    const settlement = { reference: "DEMO-TRANSFER-01", amountMinor: 652469 };
    const settlePath = disbursement + "/" + run.id + "/settlement";
    verify(await call("POST", settlePath, settlement, token("accounting")), 401);
    verify(await call("POST", settlePath, { ...settlement, amountMinor: 1 }, token("disbursement")), 409);
    const settled = await Promise.all([
      call("POST", settlePath, settlement, token("disbursement")),
      call("POST", settlePath, settlement, token("disbursement"))
    ]);
    for (const result of settled) assert.equal(verify(result, 200).status, "settled");
    verify(await call("POST", settlePath, { ...settlement, reference: "DIFFERENT" }, token("disbursement")), 409);
    const facultyStatus = verify(await call("GET", "/integrations/faculty/workloads/WL-01", null, token("faculty")), 200);
    assert.equal(facultyStatus.status, "reviewed");
    assert.equal(facultyStatus.hourlyRateMinor, undefined);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    try { await mongoose.connection.dropDatabase(); } finally { await mongoose.disconnect(); }
  }
});
