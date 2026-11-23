
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });

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
const PORT = 5000;

const frontendOrigins = new Set([
  "http://localhost:5173", "http://localhost:5174",
  "http://127.0.0.1:5173", "http://127.0.0.1:5174"
]);
app.use(cors({
  origin: (origin, callback) => callback(null, frontendOrigins.has(origin)),
  credentials: true
}));
app.use("/api/v1", (req, res, next) => {
  const origin = req.get("Origin");
  if (req.method !== "GET" && origin &&
      origin !== `http://${req.get("Host")}` && !frontendOrigins.has(origin)) {
    return res.status(403).json({ message: "This request must come from the Finance app." });
  }
  next();
});
app.use(express.json());

// Swagger documentation
const swaggerDocument = yaml.load(
  fs.readFileSync(path.join(__dirname, "openapi.yaml"), "utf8")
);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok"
  });
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

// Connect to MongoDB and enforce the account limits before accepting requests.
if (require.main === module) connectDB()
  .then(async () => {
    await Promise.all([CashierAccount, CashierSession, Enrollment, Charge, PartnerItem, PayrollRate, PayrollRun]
      .map((model) => model.init()));
    app.listen(PORT, "127.0.0.1", () => {
      console.log(`Midterm API running on http://localhost:${PORT}`);
      console.log(`Swagger Docs: http://localhost:${PORT}/docs`);
      console.log(`Health API: http://localhost:${PORT}/api/v1/health`);
      console.log(`Student API: http://localhost:${PORT}/api/v1/students`);
      console.log(`Assessment API: http://localhost:${PORT}/api/v1/assessments`);
      console.log(`Payment API: http://localhost:${PORT}/api/v1/payments`);
      console.log(`Receipt API: http://localhost:${PORT}/api/v1/receipts`);
      console.log(`Finance API: http://localhost:${PORT}/api/v1/finance`);
      console.log(`Reports API: http://localhost:${PORT}/api/v1/reports`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  });

module.exports = app;
