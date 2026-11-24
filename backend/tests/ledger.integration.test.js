const assert = require("node:assert/strict");
const { createHash, randomBytes } = require("node:crypto");
const { once } = require("node:events");
const test = require("node:test");
const mongoose = require("mongoose");

const mongoUri = process.env.FINANCE_TEST_MONGO;

test("finance workflow and all five partner contracts", { skip: !mongoUri }, async () => {
  const app = require("../server");
  const CashierAccount = require("../models/CashierAccount");
  const { CashierSession } = require("../routes/auth");
  const models = require("../models/FinanceLedger");
  const partners = ["registrar", "cashier", "library", "inventory", "faculty"];
  const tokens = Object.fromEntries(partners.map((partner) => [partner, randomBytes(30).toString("hex")]));
  for (const [partner, token] of Object.entries(tokens)) {
    process.env["FINANCE_" + partner.toUpperCase() + "_TOKEN_HASH"] = createHash("sha256").update(token).digest("hex");
  }
  await mongoose.connect(mongoUri, { dbName: "finance_workflow_test_" + randomBytes(8).toString("hex") });
  let server;
  try {
    await Promise.all([CashierAccount, CashierSession, ...Object.values(models)].map((model) => model.init()));
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const base = "http://127.0.0.1:" + server.address().port + "/api/v1";
    async function send(method, path, data, headers = {}) {
      const response = await fetch(base + path, {
        method, headers: { ...(data && { "Content-Type": "application/json" }), ...headers },
        body: data && JSON.stringify(data)
      });
      return { status: response.status, data: response.status === 204 ? null : await response.json(), headers: response.headers };
    }
    function status(response, expected) {
      assert.equal(response.status, expected, JSON.stringify(response.data));
      return response.data;
    }
    const password = "Fictional Demo Password";
    const ownerLogin = { email: "owner@example.test", password };
    const cashierLogin = { email: "cashier@example.test", password };
    const cookie = (response) => ({ Cookie: response.headers.get("set-cookie").split(";")[0] });
    const partner = (name) => ({ Authorization: "Bearer " + tokens[name] });

    status(await send("POST", "/auth/setup", ownerLogin), 201);
    const owner = cookie(await send("POST", "/auth/login", ownerLogin));
    const cashier = status(await send("POST", "/auth/register", cashierLogin), 201);
    status(await send("PATCH", "/auth/cashiers/" + cashier.id, { action: "approve" }, owner), 200);
    const operator = cookie(await send("POST", "/auth/login", cashierLogin));
    status(await send("GET", "/ledger/enrollments"), 401);

    const registrarInput = { externalId: "REG-001", studentId: "DEMO-001", term: "2026-2027 T1", name: "Demo Student", program: "BSIT" };
    const addRegistrar = (input, headers = partner("registrar")) => send("POST", "/integrations/registrar/enrollments", input, headers);
    status(await addRegistrar(registrarInput, partner("library")), 401);
    const enrollment = status(await addRegistrar(registrarInput), 201);
    assert.equal(status(await addRegistrar(registrarInput), 200).id, enrollment.id);
    status(await addRegistrar({ ...registrarInput, term: "Different" }), 409);
    const term = "?term=" + encodeURIComponent(registrarInput.term);
    const standing = "/integrations/registrar/students/DEMO-001/standing" + term;
    assert.equal(status(await send("GET", standing, null, partner("registrar")), 200).standing, "unassessed");

    const assessment = { enrollmentId: enrollment.id, label: "Tuition", reference: "TUITION-01", amountMinor: 1000000 };
    status(await send("POST", "/ledger/charges", assessment, operator), 403);
    const charge = status(await send("POST", "/ledger/charges", assessment, owner), 201);
    assert.equal(status(await send("POST", "/ledger/charges", assessment, owner), 200).id, charge.id);
    const search = status(await send("GET", "/ledger/enrollments?search=DEMO-001", null, operator), 200);
    assert.equal(search.rows.length, 1);

    const partial = { chargeId: charge.id, amountMinor: 400000, method: "Cash", requestId: "PAY-01" };
    const attempts = await Promise.all([send("POST", "/ledger/payments", partial, operator), send("POST", "/ledger/payments", partial, operator)]);
    assert.deepEqual(attempts.map((result) => result.status).sort(), [200, 201]);
    assert.equal(attempts[0].data.receiptNumber, attempts[1].data.receiptNumber);
    const first = attempts[0].data;
    const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Manila", dateStyle: "short" }).format(new Date());
    const accountPath = "/ledger/enrollments/" + enrollment.id;
    const reportPath = "/ledger/reports/daily?date=" + date;
    assert.equal(status(await send("GET", accountPath, null, operator), 200).outstandingMinor, 600000);
    const receipt = status(await send("GET", "/ledger/payments/" + first._id + "/receipt", null, operator), 200);
    assert.equal(receipt.receiptNumber, first.receiptNumber);
    assert.equal(receipt.balanceAfterMinor, 600000);
    assert.equal(status(await send("GET", reportPath, null, owner), 200).totals.collectedMinor, 400000);
    status(await send("POST", "/ledger/payments", { ...partial, amountMinor: 420000 }, operator), 409);

    const payableCharges = status(await send("GET", "/integrations/cashier/students/DEMO-001/charges" + term, null, partner("cashier")), 200);
    assert.equal(payableCharges[0].outstandingMinor, 600000);
    const closing = { ...partial, amountMinor: 600000, requestId: "EXTERNAL-002", operatorRef: "Counter-2" };
    const closeAttempts = await Promise.all([
      send("POST", "/integrations/cashier/payments", closing, partner("cashier")),
      send("POST", "/ledger/payments", { ...closing, requestId: "OTHER-002" }, operator)
    ]);
    assert.equal(closeAttempts.filter((result) => result.status === 201).length, 1);
    assert.equal(closeAttempts.filter((result) => result.status === 409).length, 1);
    assert.equal(status(await send("GET", standing, null, partner("registrar")), 200).standing, "settled");

    const paymentPath = "/ledger/payments/" + first._id;
    status(await send("POST", paymentPath + "/reversals", { reason: "Demo correction" }, operator), 201);
    assert.equal(status(await send("GET", accountPath, null, owner), 200).outstandingMinor, 0);
    status(await send("PATCH", paymentPath + "/reversal", { status: "approved" }, operator), 403);
    assert.equal(status(await send("GET", "/ledger/reversals", null, owner), 200).length, 1);
    status(await send("PATCH", paymentPath + "/reversal", { status: "approved", note: "Reviewed" }, owner), 200);
    assert.equal(status(await send("GET", accountPath, null, owner), 200).outstandingMinor, 400000);
    status(await send("PATCH", paymentPath + "/reversal", { status: "approved" }, owner), 409);
    const report = status(await send("GET", reportPath, null, owner), 200);
    assert.deepEqual(report.totals, { collectedMinor: 1000000, reversedMinor: 400000, netMinor: 600000 });
    assert.equal(status(await send("GET", paymentPath + "/receipt", null, owner), 200).status, "reversed");

    const fine = { studentId: registrarInput.studentId, term: registrarInput.term, label: "Library fine", reference: "FINE-01", amountMinor: 5000 };
    const fineRecord = status(await send("POST", "/integrations/library/fines", fine, partner("library")), 201);
    status(await send("POST", "/integrations/library/fines", fine, partner("library")), 200);
    status(await send("POST", "/integrations/library/fines", { ...fine, amountMinor: 5001 }, partner("library")), 409);
    const finePayment = {
      chargeId: fineRecord.id, requestId: "FINE-PAY-1", amountMinor: 5000, method: "Cash", operatorRef: "Counter-2"
    };
    const postedFine = status(await send("POST", "/integrations/cashier/payments", finePayment, partner("cashier")), 201);
    assert.equal(status(await send("POST", "/integrations/cashier/payments", finePayment, partner("cashier")), 200).receiptNumber, postedFine.receiptNumber);
    assert.equal(status(await send("GET", "/integrations/library/fines/FINE-01", null, partner("library")), 200).status, "settled");

    const csvPath = "/ledger/reports/daily.csv?date=" + date;
    assert.equal((await send("GET", csvPath)).status, 401);
    for (const [headers, scope] of [[owner, "owner"], [operator, "cashier"]]) {
      const json = status(await send("GET", reportPath, null, headers), 200);
      const csv = await fetch(base + csvPath, { headers });
      assert.equal(csv.status, 200);
      assert.match(csv.headers.get("content-type"), /text\/csv/);
      assert.match(csv.headers.get("content-disposition"), new RegExp(`IDSC-collections-${date}\\.csv`));
      const content = await csv.text();
      const expected = [json.totals.collectedMinor, json.totals.reversedMinor, json.totals.netMinor]
        .map((amount) => '"' + (amount / 100).toFixed(2) + '"').join(",");
      assert.ok(content.endsWith(`"${date}","TOTAL","",${expected}`));
      assert.equal(content.includes("Cashier system · Counter-2"), scope === "owner");
    }
    const inventory = { externalId: "INV-01", approvedOrderRef: "ORD-1", receivingRef: "REC-1",
      vendorRef: "VEND-1", items: [{ itemRef: "BOOK-01", quantity: 2, unitCostMinor: 10000 }] };
    const faculty = { externalId: "FAC-01", employeeRef: "EMP-1", period: "2026 T1", approvedHoursHundredths: 1234 };
    status(await send("POST", "/integrations/inventory/payables", inventory, partner("inventory")), 201);
    status(await send("POST", "/integrations/inventory/payables", inventory, partner("inventory")), 200);
    status(await send("POST", "/integrations/inventory/payables", { ...inventory, externalId: "INV-02" }, partner("inventory")), 409);
    status(await send("POST", "/integrations/faculty/workloads", faculty, partner("faculty")), 201);
    status(await send("GET", "/ledger/partner-items", null, operator), 403);
    const items = status(await send("GET", "/ledger/partner-items", null, owner), 200);
    const payable = items.find((item) => item.partner === "inventory");
    assert.equal(payable.details.amountMinor, 20000);
    const itemPath = "/ledger/partner-items/" + payable._id;
    status(await send("PATCH", itemPath, { action: "settle", reference: "DSP-01" }, owner), 409);
    status(await send("PATCH", itemPath, { action: "approve" }, owner), 200);
    status(await send("PATCH", itemPath, { action: "settle", reference: "DSP-01" }, owner), 200);
    assert.equal(status(await send("GET", "/integrations/inventory/payables/INV-01", null, partner("inventory")), 200).status, "settled");
    const workloadPath = "/ledger/partner-items/" + items.find((item) => item.partner === "faculty")._id;
    status(await send("PATCH", workloadPath, { action: "review" }, owner), 200);
    assert.equal(status(await send("GET", "/integrations/faculty/workloads/FAC-01", null, partner("faculty")), 200).status, "reviewed");

    const tuition = { ...assessment, label: "Prelim tuition", reference: "PRELIM-01", tuitionInstallment: "prelim", dueDate: "2000-01-01" };
    status(await send("POST", "/ledger/charges", { ...tuition, dueDate: "2025-02-29" }, owner), 400);
    const installment = status(await send("POST", "/ledger/charges", tuition, owner), 201);
    assert.equal(installment.dueDate, tuition.dueDate);
    status(await send("POST", "/ledger/charges", tuition, owner), 200);
    status(await send("POST", "/ledger/charges", { ...tuition, dueDate: "2000-01-02" }, owner), 409);
    status(await send("POST", "/ledger/charges", { ...tuition, reference: "ANOTHER-PRELIM" }, owner), 409);
    status(await send("POST", "/ledger/charges", {
      ...tuition, label: "Midterm tuition", reference: "MIDTERM-01", tuitionInstallment: "midterm", dueDate: date
    }, owner), 201);

    const tuitionPath = "/ledger/reports/tuition";
    status(await send("GET", tuitionPath, null, operator), 403);
    status(await send("GET", tuitionPath + "?status=unknown", null, owner), 400);
    const overdue = async () => status(await send("GET", tuitionPath, null, owner), 200).rows;
    const initialOverdue = await overdue();
    assert.equal(initialOverdue.length, 1);
    assert.equal(initialOverdue[0].studentId, "DEMO-001");
    assert.equal(initialOverdue[0].outstandingMinor, 1000000);
    const allTuition = status(await send("GET", tuitionPath + "?status=outstanding", null, owner), 200);
    assert.deepEqual(allTuition.rows.map((row) => row.tuitionInstallment), ["prelim", "midterm"]);

    const tuitionPayment = status(await send("POST", "/ledger/payments", {
      ...partial, chargeId: installment.id, requestId: "PRELIM-PAY-01"
    }, operator), 201);
    assert.equal((await overdue())[0].outstandingMinor, 600000);
    status(await send("POST", "/ledger/payments", {
      ...partial, chargeId: installment.id, amountMinor: 600000, requestId: "PRELIM-PAY-02"
    }, operator), 201);
    assert.equal((await overdue()).length, 0);
    const tuitionReversal = "/ledger/payments/" + tuitionPayment._id + "/reversal";
    status(await send("POST", tuitionReversal + "s", { reason: "Tuition posting correction" }, operator), 201);
    assert.equal((await overdue()).length, 0);
    status(await send("PATCH", tuitionReversal, { status: "approved" }, owner), 200);
    assert.equal((await overdue())[0].outstandingMinor, 400000);
    const activity = status(await send("GET", reportPath, null, owner), 200).rows
      .find((row) => row.type === "reversal" && row.paymentId === tuitionPayment._id);
    assert.equal(activity.studentId, "DEMO-001");
    assert.equal(activity.charge, "Prelim tuition");
    assert.equal(activity.reason, "Tuition posting correction");

    const extraEnrollments = await models.Enrollment.insertMany(Array.from({ length: 25 }, (_, index) => ({
      studentId: `PAGE-${index}`, name: `Page Student ${index}`, term: registrarInput.term, program: "BSIT", source: "finance"
    })));
    await models.Charge.insertMany(extraEnrollments.map((extra, index) => ({
      enrollmentId: extra._id, key: `tuition-page-charge-${index}`, label: "Finals tuition",
      tuitionInstallment: "finals", dueDate: "2000-01-02", amountMinor: 500000
    })));
    const firstPage = status(await send("GET", tuitionPath, null, owner), 200);
    const secondPage = status(await send("GET", tuitionPath + "?page=2", null, owner), 200);
    assert.equal(firstPage.hasMore, true);
    assert.equal(firstPage.rows.length, 25);
    assert.equal(secondPage.hasMore, false);
    assert.equal(secondPage.rows.length, 1);
    assert.equal(new Set([...firstPage.rows, ...secondPage.rows].map((row) => row.chargeId)).size, 26);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    try { await mongoose.connection.dropDatabase(); } finally { await mongoose.disconnect(); }
  }
});
