const assert = require("node:assert/strict");
const fs = require("node:fs");
const { randomBytes } = require("node:crypto");
const { once } = require("node:events");
const path = require("node:path");
const test = require("node:test");
const mongoose = require("mongoose");

const mongoUri = process.env.FINANCE_TEST_MONGO;
const hostedOrigin = "https://finance-staging.example.test";

test("hosted Finance protects setup and serves the app and API from one origin", { skip: !mongoUri }, async (t) => {
  process.env.NODE_ENV = "production";
  process.env.APP_ORIGIN = hostedOrigin;
  process.env.MONGODB_URI = mongoUri;
  process.env.OWNER_SETUP_KEY = "";
  const app = require("../server");
  const config = require("../config");
  const CashierAccount = require("../models/CashierAccount");
  const { CashierSession } = require("../routes/auth");
  const server = app.listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const base = "http://127.0.0.1:" + server.address().port;
    const get = (url, headers) => fetch(base + url, { headers });
    const post = (url, body, origin = hostedOrigin) => fetch(base + url, {
      method: "POST", headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify(body)
    });

    assert.equal((await get("/api/v1/ready")).status, 503);
    assert.deepEqual(await (await get("/api/v1/health")).json(), { status: "ok" });

    await mongoose.connect(mongoUri, { dbName: "finance_hosted_test_" + randomBytes(8).toString("hex") });
    await Promise.all([CashierAccount.init(), CashierSession.init()]);
    assert.deepEqual(await (await get("/api/v1/ready")).json(), { status: "ready" });

    await t.test("serves the compiled dashboard and its assets", {
      skip: !fs.existsSync(path.join(config.frontendDir, "index.html"))
    }, async () => {
      const home = await get("/");
      assert.equal(home.status, 200);
      const html = await home.text();
      assert.match(html, /IDSC Finance Web System/);
      const script = html.match(/src="(\/assets\/[^"]+\.js)"/)?.[1];
      assert.ok(script);
      assert.equal((await get(script)).status, 200);
      assert.equal((await get("/asset-that-does-not-exist.js")).status, 404);
    });

    const owner = { email: "hosted-owner@example.test", password: "Fictional Hosted Demo Owner" };
    assert.deepEqual(await (await get("/api/v1/auth/setup")).json(), {
      ownerRequired: true, cashierSlotsAvailable: 2, setupKeyRequired: true
    });
    assert.equal((await post("/api/v1/auth/setup", owner)).status, 503);
    const key = randomBytes(32).toString("hex");
    config.ownerSetupKey = key;
    assert.equal((await post("/api/v1/auth/setup", owner)).status, 403);
    assert.equal((await post("/api/v1/auth/setup", { ...owner, setupKey: "a".repeat(key.length) })).status, 403);
    assert.equal((await post("/api/v1/auth/setup", { ...owner, setupKey: key }, "https://unrelated.example.test")).status, 403);
    assert.equal((await post("/api/v1/auth/setup", { ...owner, setupKey: key }, base)).status, 403);
    assert.equal(await CashierAccount.countDocuments(), 0);
    assert.equal((await post("/api/v1/auth/setup", { ...owner, setupKey: key })).status, 201);
    config.ownerSetupKey = "";
    assert.equal((await post("/api/v1/auth/setup", owner)).status, 409);

    const login = await post("/api/v1/auth/login", owner);
    assert.equal(login.status, 200);
    assert.equal(login.headers.get("access-control-allow-origin"), hostedOrigin);
    const session = login.headers.get("set-cookie");
    assert.match(session, /; Secure/i);
    assert.match(session, /; HttpOnly/i);
    const cookie = session.split(";")[0];
    assert.equal((await get("/docs/")).status, 401);
    assert.equal((await get("/docs/", { Cookie: cookie })).status, 200);
    assert.equal((await get("/api/v1/payroll/runs", { Cookie: cookie })).status, 200);
    assert.equal((await get("/api/v1/missing", { Cookie: cookie })).status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (mongoose.connection.readyState === 1) {
      try { await mongoose.connection.dropDatabase(); } finally { await mongoose.disconnect(); }
    }
  }
});
