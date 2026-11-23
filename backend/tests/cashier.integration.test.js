const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const { once } = require("node:events");
const test = require("node:test");
const mongoose = require("mongoose");

const mongoUri = process.env.FINANCE_TEST_MONGO;

test("first-run owner, two cashier slots, approval and recovery", { skip: !mongoUri }, async () => {
  const app = require("../server");
  const CashierAccount = require("../models/CashierAccount");
  const { CashierSession } = require("../routes/auth");
  await mongoose.connect(mongoUri, { dbName: "finance_accounts_test_" + randomBytes(8).toString("hex") });
  let server;
  try {
    await Promise.all([CashierAccount.init(), CashierSession.init()]);
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const base = "http://127.0.0.1:" + server.address().port + "/api/v1";
    const password = "Fictional first password";
    const owners = ["owner-one@example.test", "owner-two@example.test"].map(email => ({ email, password }));
    const applicants = ["a@example.test", "b@example.test", "c@example.test"].map(email => ({ email, password }));
    const send = (method, path, body, cookie) => fetch(base + path, {
      method,
      headers: { ...(body && { "Content-Type": "application/json" }), ...(cookie && { Cookie: cookie }) },
      body: body && JSON.stringify(body)
    });
    const get = (path, cookie) => send("GET", path, null, cookie);
    const post = (path, data, cookie) => send("POST", path, data, cookie);
    async function login(details) {
      const response = await post("/auth/login", { ...details, remember: true });
      assert.equal(response.status, 200);
      const header = response.headers.get("set-cookie");
      assert.match(header, /HttpOnly/i);
      return header.split(";")[0];
    }
    const setStatus = (cashier, action, cookie) => send("PATCH", "/auth/cashiers/" + cashier.id, { action }, cookie);

    assert.equal((await get("/students")).status, 401);
    assert.deepEqual(await (await get("/auth/setup")).json(), { ownerRequired: true, cashierSlotsAvailable: 2 });
    assert.equal((await post("/auth/register", applicants[0])).status, 409);
    const ownerAttempts = await Promise.all(owners.map(owner => post("/auth/setup", owner)));
    assert.deepEqual(ownerAttempts.map(r => r.status).sort(), [201, 409]);
    const ownerIndex = ownerAttempts.findIndex(r => r.status === 201);
    const owner = await ownerAttempts[ownerIndex].json();
    assert.equal(owner.role, "owner");
    assert.equal(owner.status, "active");
    assert.equal(await CashierAccount.countDocuments({ cashierSlot: 0 }), 1);
    let ownerCookie = await login(owners[ownerIndex]);
    assert.equal((await get("/students", ownerCookie)).status, 200);

    const registrations = await Promise.all(applicants.map(details => post("/auth/register", details)));
    assert.deepEqual(registrations.map(r => r.status).sort(), [201, 201, 409]);
    const [cashier, other] = await Promise.all(registrations.filter(r => r.status === 201).map(r => r.json()));
    assert.deepEqual(await (await get("/auth/setup")).json(), { ownerRequired: false, cashierSlotsAvailable: 0 });
    assert.equal(cashier.status, "pending");
    assert.equal(other.status, "pending");
    assert.equal((await post("/auth/login", { email: cashier.email, password })).status, 403);
    assert.equal((await post("/auth/login", { email: cashier.email, password: "Incorrect test password" })).status, 401);
    assert.equal((await (await get("/auth/cashiers", ownerCookie)).json()).length, 2);

    assert.equal((await setStatus(cashier, "activate", ownerCookie)).status, 409);
    assert.equal((await (await setStatus(cashier, "approve", ownerCookie)).json()).status, "active");
    let cashierCookie = await login({ email: cashier.email, password });
    assert.equal((await get("/auth/cashiers", cashierCookie)).status, 403);
    assert.equal((await setStatus(other, "approve", cashierCookie)).status, 403);
    assert.equal((await post("/assessments", {}, cashierCookie)).status, 403);

    assert.equal((await setStatus(cashier, "deactivate", ownerCookie)).status, 200);
    assert.equal((await get("/students", cashierCookie)).status, 401);
    assert.equal((await post("/auth/login", { email: cashier.email, password })).status, 403);
    assert.equal((await setStatus(cashier, "activate", ownerCookie)).status, 200);
    assert.equal((await get("/auth/session", cashierCookie)).status, 401);
    cashierCookie = await login({ email: cashier.email, password });
    assert.equal((await get("/auth/session", cashierCookie)).status, 200);

    const nextPassword = "Fictional replacement password";
    for (const [account, cookie] of [[owner, ownerCookie], [cashier, cashierCookie]]) {
      const reset = { email: account.email, password: nextPassword, recoveryCode: account.recoveryCode };
      const attempts = await Promise.all([post("/auth/reset-password", reset), post("/auth/reset-password", reset)]);
      assert.deepEqual(attempts.map(response => response.status).sort(), [200, 400]);
      const replacement = await attempts.find(response => response.status === 200).json();
      assert.notEqual(replacement.recoveryCode, account.recoveryCode);
      assert.equal((await get("/auth/session", cookie)).status, 401);
      assert.equal((await post("/auth/login", { email: account.email, password })).status, 401);
      const newCookie = await login({ email: account.email, password: nextPassword });
      assert.equal((await post("/auth/recovery-code", { password: nextPassword }, newCookie)).status, 200);
      if (account.role === "owner") ownerCookie = newCookie;
    }

    assert.equal((await send("DELETE", "/auth/cashiers/" + owner.id, null, ownerCookie)).status, 404);
    assert.equal((await send("DELETE", "/auth/cashiers/" + cashier.id, null, ownerCookie)).status, 204);
    assert.equal((await post("/auth/login", { email: cashier.email, password: nextPassword })).status, 401);
    assert.equal((await (await get("/auth/setup")).json()).cashierSlotsAvailable, 1);
    assert.equal((await post("/auth/register", { email: "replacement@example.test", password })).status, 201);
    assert.equal((await post("/auth/logout", {}, ownerCookie)).status, 204);
    assert.equal((await get("/auth/session", ownerCookie)).status, 401);
    assert.equal(await CashierAccount.countDocuments(), 3);
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    try {
      await mongoose.connection.dropDatabase();
    } finally {
      await mongoose.disconnect();
    }
  }
});
