
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("node:path");
const mongoose = require("mongoose");
const config = require("./config");

const connectDB = require("./db");

const studentRoutes = require("./routes/students");
const assessmentRoutes = require("./routes/assessments");
const paymentRoutes = require("./routes/payments");
const receiptRoutes = require("./routes/receipts");
const financeRoutes = require("./routes/finance");
const reportsRoutes = require("./routes/reports");
const CashierAccount = require("./models/CashierAccount");
const { Enrollment, Charge, PartnerItem } = require("./models/FinanceLedger");
const { PayrollRate, PayrollRun } = require("./models/FacultyPayroll");
const { FinanceError } = require("./services/ledger");
const ledgerRoutes = require("./routes/ledger");
const payrollRoutes = require("./routes/payroll");
const integrationRoutes = require("./routes/integrations");
const { router: authRoutes, requireAccount, CashierSession } = require("./routes/auth");

const app = express();
app.disable("x-powered-by");

const frontendOrigins = new Set(config.hosted ? [config.publicOrigin] : [
  "http://localhost:5173", "http://localhost:5174",
  "http://127.0.0.1:5173", "http://127.0.0.1:5174"
]);
app.use(cors({
  origin: (origin, callback) => callback(null, frontendOrigins.has(origin)),
  credentials: true
}));
app.use("/api/v1", (req, res, next) => {
  const origin = req.get("Origin");
  const sameLocalOrigin = !config.hosted && origin === `http://${req.get("Host")}`;
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && origin &&
      !sameLocalOrigin && !frontendOrigins.has(origin)) {
    return res.status(403).json({ message: "This request must come from the Finance app." });
  }
  next();
});
app.use(express.json());

// Swagger documentation
const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, "openapi.yaml"), "utf8")
);

if (config.hosted) {
  swaggerDocument.servers = [{ url: config.publicOrigin, description: "This Finance service" }];
  app.use("/docs", requireAccount, (req, res, next) => {
    if (req.account.role !== "owner") return res.status(403).json({ message: "Only the owner can open the hosted API reference." });
    next();
  });
}
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

app.get("/api/v1/ready", async (req, res) => {
  res.set("Cache-Control", "no-store");
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ status: "unavailable" });
    await mongoose.connection.db.command({ ping: 1 }, { timeoutMS: 2000 });
    return res.json({ status: "ready" });
  } catch {
    return res.status(503).json({ status: "unavailable" });
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/integrations", integrationRoutes);
app.use("/api/v1", requireAccount);
app.use("/api/v1/ledger", ledgerRoutes);
app.use("/api/v1/payroll", payrollRoutes);

function legacyReadOnly(req, res, next) {
  if (["GET", "HEAD"].includes(req.method)) return next();
  const status = req.account.role === "owner" ? 410 : 403;
  return res.status(status).json({ message: "Use the Finance ledger for new assessments, payments, and receipts." });
}

// Student API
app.use("/api/v1/students", studentRoutes);

// Assessment API
app.use("/api/v1/assessments", legacyReadOnly, assessmentRoutes);

// Payment API
app.use("/api/v1/payments", legacyReadOnly, paymentRoutes);

// Receipt API
app.use("/api/v1/receipts", legacyReadOnly, receiptRoutes);

// Finance API
app.use("/api/v1/finance", financeRoutes);

// Reports API
app.use("/api/v1/reports", reportsRoutes);

if (config.hosted) {
  app.use(express.static(config.frontendDir));
}

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).type("application/problem+json").json({
    type: "https://example.com/problems/not-found",
    title: "Not Found",
    status: 404,
    detail: "The requested endpoint was not found"
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error instanceof FinanceError) return res.status(error.status).json({ message: error.message });
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "The request must contain valid JSON." });
  }
  console.error("Finance request failed:", error.name);
  return res.status(500).json({ message: "The Finance server could not complete the request." });
});

async function start() {
  if (config.hosted && !fs.existsSync(path.join(config.frontendDir, "index.html"))) {
    throw new Error("Build the frontend before starting Finance in production mode.");
  }
  await connectDB();
  await Promise.all([CashierAccount, CashierSession, Enrollment, Charge, PartnerItem, PayrollRate, PayrollRun]
    .map((model) => model.init()));
  app.listen(config.port, config.bindHost, () => {
    const base = config.publicOrigin || `http://localhost:${config.port}`;
    console.log(`Finance running at ${base}`);
    console.log(`Database readiness: ${base}/api/v1/ready`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  });
}

module.exports = app;
