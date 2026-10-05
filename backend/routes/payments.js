const express = require("express");
const router = express.Router();

const Payment = require("../models/Payment");

// GET all payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message
    });
  }
});

// GET payments by student ID
router.get("/student/:studentId", async (req, res) => {
  try {
    const payments = await Payment.find({
      studentId: req.params.studentId
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student payments",
      error: error.message
    });
  }
});

// GET one payment
router.get("/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payment",
      error: error.message
    });
  }
});

// CREATE payment
router.post("/", async (req, res) => {
  try {
    const {
      paymentId,
      studentId,
      assessmentId,
      amountPaid,
      paymentDate,
      paymentMethod,
      referenceNumber,
      receiptNumber,
      processedBy,
      remarks,
      paymentStatus
    } = req.body;

    if (
      !paymentId ||
      !studentId ||
      !assessmentId ||
      amountPaid === undefined ||
      !paymentMethod ||
      !receiptNumber ||
      !processedBy
    ) {
      return res.status(400).json({
        message: "All required payment fields must be provided"
      });
    }

    if (amountPaid <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than zero"
      });
    }

    const existingPaymentId = await Payment.findOne({ paymentId });

    if (existingPaymentId) {
      return res.status(409).json({
        message: "Payment ID already exists"
      });
    }

    const existingReceipt = await Payment.findOne({
      receiptNumber
    });

    if (existingReceipt) {
      return res.status(409).json({
        message: "Receipt number already exists"
      });
    }

    const payment = new Payment({
      paymentId,
      studentId,
      assessmentId,
      amountPaid,
      paymentDate,
      paymentMethod,
      referenceNumber,
      receiptNumber,
      processedBy,
      remarks,
      paymentStatus
    });

    const savedPayment = await payment.save();

    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create payment",
      error: error.message
    });
  }
});

// UPDATE payment
router.put("/:id", async (req, res) => {
  try {
    const {
      paymentId,
      studentId,
      assessmentId,
      amountPaid,
      paymentDate,
      paymentMethod,
      referenceNumber,
      receiptNumber,
      processedBy,
      remarks,
      paymentStatus
    } = req.body;

    if (amountPaid !== undefined && amountPaid <= 0) {
      return res.status(400).json({
        message: "Payment amount must be greater than zero"
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    payment.paymentId = paymentId;
    payment.studentId = studentId;
    payment.assessmentId = assessmentId;
    payment.amountPaid = amountPaid;
    payment.paymentDate = paymentDate;
    payment.paymentMethod = paymentMethod;
    payment.referenceNumber = referenceNumber;
    payment.receiptNumber = receiptNumber;
    payment.processedBy = processedBy;
    payment.remarks = remarks;
    payment.paymentStatus = paymentStatus;

    const updatedPayment = await payment.save();

    res.json(updatedPayment);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update payment",
      error: error.message
    });
  }
});

// DELETE payment
router.delete("/:id", async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    res.json({
      message: "Payment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete payment",
      error: error.message
    });
  }
});

module.exports = router;