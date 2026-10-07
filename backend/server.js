const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const yaml = require("js-yaml");
const fs = require("fs");

const connectDB = require("./db");

const studentRoutes = require("./routes/students");
const assessmentRoutes = require("./routes/assessments");
const paymentRoutes = require("./routes/payments");
const receiptRoutes = require("./routes/receipts");
const financeRoutes = require("./routes/finance");
const reportsRoutes = require("./routes/reports");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Swagger documentation
const swaggerDocument = yaml.load(
  fs.readFileSync("./openapi.yaml", "utf8")
);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok"
  });
});

// Student API
app.use("/api/v1/students", studentRoutes);

// Assessment API
app.use("/api/v1/assessments", assessmentRoutes);

// Payment API
app.use("/api/v1/payments", paymentRoutes);

// Receipt API
app.use("/api/v1/receipts", receiptRoutes);

// Finance API
app.use("/api/v1/finance", financeRoutes);

// Reports API
app.use("/api/v1/reports", reportsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).type("application/problem+json").json({
    type: "https://example.com/problems/not-found",
    title: "Not Found",
    status: 404,
    detail: "The requested endpoint was not found"
  });
});

// Connect MongoDB first, then start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Swagger Docs: http://localhost:${PORT}/docs`);
      console.log(`Health API: http://localhost:${PORT}/api/v1/health`);
      console.log(`Student API: http://localhost:${PORT}/api/v1/students`);
      console.log(`Assessment API: http://localhost:${PORT}/api/v1/assessments`);
      console.log(`Payment API: http://localhost:${PORT}/api/v1/payments`);
      console.log(`Receipt API: http://localhost:${PORT}/api/v1/receipts`);
      console.log(`Finance API: http://localhost:${PORT}/api/v1/finance`);
      console.log(`Reports API: http://localhost:${PORT}/api/v1/reports`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();