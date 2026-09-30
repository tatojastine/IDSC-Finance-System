const express = require("express");

const router = express.Router();

const {
  getAllPayments,
  createPayment,
  getPaymentsByStudentId
} = require("../services/paymentService");

// GET /api/v1/payments
router.get("/", (req, res) => {
  const payments = getAllPayments();

  res.json(payments);
});

// POST /api/v1/payments
router.post("/", (req, res) => {
  const data = req.body;

  if (!data.studentId || !data.assessmentId || !data.amountPaid) {
    return res.status(400).type("application/problem+json").json({
      type: "https://example.com/problems/bad-request",
      title: "Bad Request",
      status: 400,
      detail: "studentId, assessmentId, and amountPaid are required"
    });
  }

  if (typeof data.amountPaid !== "number" || data.amountPaid <= 0) {
    return res.status(400).type("application/problem+json").json({
      type: "https://example.com/problems/bad-request",
      title: "Bad Request",
      status: 400,
      detail: "amountPaid must be a number greater than 0"
    });
  }

  const payment = createPayment(data);

  res.status(201).json(payment);
});

// GET /api/v1/payments/:studentId
router.get("/:studentId", (req, res) => {
  const payments = getPaymentsByStudentId(req.params.studentId);

  if (payments.length === 0) {
    return res.status(404).type("application/problem+json").json({
      type: "https://example.com/problems/not-found",
      title: "Not Found",
      status: 404,
      detail: "No payments found for this student"
    });
  }

  res.json(payments);
});

module.exports = router;