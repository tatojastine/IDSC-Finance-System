const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const transactionRoutes = require("./routes/transactions");
const userRoutes = require("./routes/users");
const studentRoutes = require("./routes/students");
const assessmentRoutes = require("./routes/assessments");
const paymentRoutes = require("./routes/payments");
const receiptRoutes = require("./routes/receipts");
const financeRoutes = require("./routes/finance");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "IDSC Finance Management System API is running",
  });
});

// Health check
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

// Transaction API
app.use("/api/v1/transactions", transactionRoutes);

// User API
app.use("/api/v1/users", userRoutes);

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

// Login test route
app.post("/api/v1/login-test", (req, res) => {
  res.json({
    message: "Login test route is working",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health API: http://localhost:${PORT}/api/v1/health`);
  console.log(`User API: http://localhost:${PORT}/api/v1/users`);
  console.log(`Login API: http://localhost:${PORT}/api/v1/users/login`);
  console.log(`Student API: http://localhost:${PORT}/api/v1/students`);
  console.log(`Assessment API: http://localhost:${PORT}/api/v1/assessments`);
  console.log(`Payment API: http://localhost:${PORT}/api/v1/payments`);
  console.log(`Receipt API: http://localhost:${PORT}/api/v1/receipts`);
  console.log(`Finance API: http://localhost:${PORT}/api/v1/finance`);
});