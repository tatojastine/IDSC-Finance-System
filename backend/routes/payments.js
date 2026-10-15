
const express = require("express");
const router = express.Router();

const Payment = require("../models/Payment");

// GET all payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });

    return res.status(200).json(payments);
  } catch (error) {
    console.error("Failed to fetch payments:", error);

    return res.status(500).json({
      message: "Failed to fetch payments"
    });
  }
});

// GET payments by student ID
router.get("/student/:studentId", async (req, res) => {
  try {
    const payments = await Payment.find({
      studentId: req.params.studentId
    }).sort({ createdAt: -1 });

    return res.status(200).json(payments);
  } catch (error) {
    console.error("Failed to fetch student payments:", error);

    return res.status(500).json({
      message: "Failed to fetch student payments"
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

    return res.status(200).json(payment);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid payment ID"
      });
    }

    console.error("Failed to fetch payment:", error);

    return res.status(500).json({
      message: "Failed to fetch payment"
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

    // Validate required fields
    if (
      !paymentId ||
      !studentId ||
      !assessmentId ||
      amountPaid === undefined ||
      amountPaid === null ||
      amountPaid === "" ||
      !paymentMethod ||
      !receiptNumber ||
      !processedBy
    ) {
      return res.status(400).json({
        message: "All required payment fields must be provided"
      });
    }

    // Validate payment amount
    const parsedAmount = Number(amountPaid);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        message: "Payment amount must be a number greater than zero"
      });
    }

    // Check duplicate payment ID
    const existingPaymentId = await Payment.findOne({ paymentId });

    if (existingPaymentId) {
      return res.status(409).json({
        message: "Payment ID already exists"
      });
    }

    // Check duplicate receipt number
    const existingReceipt = await Payment.findOne({ receiptNumber });

    if (existingReceipt) {
      return res.status(409).json({
        message: "Receipt number already exists"
      });
    }

    const payment = new Payment({
      paymentId,
      studentId,
      assessmentId,
      amountPaid: parsedAmount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      receiptNumber,
      processedBy,
      remarks,
      paymentStatus
    });

    const savedPayment = await payment.save();

    return res.status(201).json(savedPayment);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid payment data",
        errors: Object.values(error.errors).map((item) => item.message)
      });
    }

    console.error("Failed to create payment:", error);

    return res.status(500).json({
      message: "Failed to create payment"
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

    // Find existing payment
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found"
      });
    }

    // Validate amount if provided
    if (amountPaid !== undefined) {
      const parsedAmount = Number(amountPaid);

      if (
        amountPaid === null ||
        amountPaid === "" ||
        !Number.isFinite(parsedAmount) ||
        parsedAmount <= 0
      ) {
        return res.status(400).json({
          message: "Payment amount must be a number greater than zero"
        });
      }

      payment.amountPaid = parsedAmount;
    }

    // Check duplicate payment ID if changed
    if (paymentId !== undefined && paymentId !== payment.paymentId) {
      const existingPaymentId = await Payment.findOne({ paymentId });

      if (existingPaymentId) {
        return res.status(409).json({
          message: "Payment ID already exists"
        });
      }

      payment.paymentId = paymentId;
    }

    // Check duplicate receipt number if changed
    if (
      receiptNumber !== undefined &&
      receiptNumber !== payment.receiptNumber
    ) {
      const existingReceipt = await Payment.findOne({ receiptNumber });

      if (existingReceipt) {
        return res.status(409).json({
          message: "Receipt number already exists"
        });
      }

      payment.receiptNumber = receiptNumber;
    }

    // Update only fields included in the request
    if (studentId !== undefined) payment.studentId = studentId;
    if (assessmentId !== undefined) payment.assessmentId = assessmentId;
    if (paymentDate !== undefined) payment.paymentDate = paymentDate;
    if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod;
    if (referenceNumber !== undefined) {
      payment.referenceNumber = referenceNumber;
    }
    if (processedBy !== undefined) payment.processedBy = processedBy;
    if (remarks !== undefined) payment.remarks = remarks;
    if (paymentStatus !== undefined) payment.paymentStatus = paymentStatus;

    const updatedPayment = await payment.save();

    return res.status(200).json(updatedPayment);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid payment ID or field value"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid payment data",
        errors: Object.values(error.errors).map((item) => item.message)
      });
    }

    console.error("Failed to update payment:", error);

    return res.status(500).json({
      message: "Failed to update payment"
    });
  }
});

module.exports = router;
