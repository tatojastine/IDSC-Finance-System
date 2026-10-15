
const express = require("express");
const router = express.Router();

const Receipt = require("../models/Receipt");

// GET all receipts
router.get("/", async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({ createdAt: -1 });

    return res.status(200).json(receipts);
  } catch (error) {
    console.error("Failed to fetch receipts:", error);

    return res.status(500).json({
      message: "Failed to fetch receipts"
    });
  }
});

// GET receipts by student ID
router.get("/student/:studentId", async (req, res) => {
  try {
    const receipts = await Receipt.find({
      studentId: req.params.studentId
    }).sort({ createdAt: -1 });

    return res.status(200).json(receipts);
  } catch (error) {
    console.error("Failed to fetch student receipts:", error);

    return res.status(500).json({
      message: "Failed to fetch student receipts"
    });
  }
});

// GET one receipt
router.get("/:id", async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        message: "Receipt not found"
      });
    }

    return res.status(200).json(receipt);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid receipt ID"
      });
    }

    console.error("Failed to fetch receipt:", error);

    return res.status(500).json({
      message: "Failed to fetch receipt"
    });
  }
});

// CREATE receipt
router.post("/", async (req, res) => {
  try {
    const {
      receiptNumber,
      paymentId,
      studentId,
      studentName,
      paymentDate,
      amountPaid,
      paymentMethod,
      referenceNumber,
      previousBalance,
      remainingBalance,
      processedBy
    } = req.body;

    // Validate required fields
    if (
      !receiptNumber ||
      !paymentId ||
      !studentId ||
      !studentName ||
      amountPaid === undefined ||
      amountPaid === null ||
      amountPaid === "" ||
      !paymentMethod ||
      previousBalance === undefined ||
      previousBalance === null ||
      previousBalance === "" ||
      remainingBalance === undefined ||
      remainingBalance === null ||
      remainingBalance === "" ||
      !processedBy
    ) {
      return res.status(400).json({
        message: "All required receipt fields must be provided"
      });
    }

    // Validate numeric amounts
    const parsedAmount = Number(amountPaid);
    const parsedPreviousBalance = Number(previousBalance);
    const parsedRemainingBalance = Number(remainingBalance);

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !Number.isFinite(parsedPreviousBalance) ||
      parsedPreviousBalance < 0 ||
      !Number.isFinite(parsedRemainingBalance) ||
      parsedRemainingBalance < 0
    ) {
      return res.status(400).json({
        message: "Receipt amounts must be valid numbers. Amount paid must be greater than zero, and balances cannot be negative."
      });
    }

    // Check duplicate receipt number
    const existingReceipt = await Receipt.findOne({ receiptNumber });

    if (existingReceipt) {
      return res.status(409).json({
        message: "Receipt number already exists"
      });
    }

    const receipt = new Receipt({
      receiptNumber,
      paymentId,
      studentId,
      studentName,
      paymentDate,
      amountPaid: parsedAmount,
      paymentMethod,
      referenceNumber,
      previousBalance: parsedPreviousBalance,
      remainingBalance: parsedRemainingBalance,
      processedBy
    });

    const savedReceipt = await receipt.save();

    return res.status(201).json(savedReceipt);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid receipt data",
        errors: Object.values(error.errors).map((item) => item.message)
      });
    }

    console.error("Failed to create receipt:", error);

    return res.status(500).json({
      message: "Failed to create receipt"
    });
  }
});

// UPDATE receipt
router.put("/:id", async (req, res) => {
  try {
    const {
      receiptNumber,
      paymentId,
      studentId,
      studentName,
      paymentDate,
      amountPaid,
      paymentMethod,
      referenceNumber,
      previousBalance,
      remainingBalance,
      processedBy
    } = req.body;

    // Find receipt first
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        message: "Receipt not found"
      });
    }

    // Validate required fields
    if (
      !receiptNumber ||
      !paymentId ||
      !studentId ||
      !studentName ||
      amountPaid === undefined ||
      amountPaid === null ||
      amountPaid === "" ||
      !paymentMethod ||
      previousBalance === undefined ||
      previousBalance === null ||
      previousBalance === "" ||
      remainingBalance === undefined ||
      remainingBalance === null ||
      remainingBalance === "" ||
      !processedBy
    ) {
      return res.status(400).json({
        message: "All required receipt fields must be provided"
      });
    }

    // Validate numeric amounts
    const parsedAmount = Number(amountPaid);
    const parsedPreviousBalance = Number(previousBalance);
    const parsedRemainingBalance = Number(remainingBalance);

    if (
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0 ||
      !Number.isFinite(parsedPreviousBalance) ||
      parsedPreviousBalance < 0 ||
      !Number.isFinite(parsedRemainingBalance) ||
      parsedRemainingBalance < 0
    ) {
      return res.status(400).json({
        message: "Receipt amounts must be valid numbers. Amount paid must be greater than zero, and balances cannot be negative."
      });
    }

    // Check duplicate receipt number
    const existingReceipt = await Receipt.findOne({
      receiptNumber,
      _id: { $ne: req.params.id }
    });

    if (existingReceipt) {
      return res.status(409).json({
        message: "Receipt number already exists"
      });
    }

    // Update receipt
    receipt.receiptNumber = receiptNumber;
    receipt.paymentId = paymentId;
    receipt.studentId = studentId;
    receipt.studentName = studentName;
    receipt.paymentDate = paymentDate;
    receipt.amountPaid = parsedAmount;
    receipt.paymentMethod = paymentMethod;
    receipt.referenceNumber = referenceNumber;
    receipt.previousBalance = parsedPreviousBalance;
    receipt.remainingBalance = parsedRemainingBalance;
    receipt.processedBy = processedBy;

    const updatedReceipt = await receipt.save();

    return res.status(200).json(updatedReceipt);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid receipt ID or field value"
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid receipt data",
        errors: Object.values(error.errors).map((item) => item.message)
      });
    }

    console.error("Failed to update receipt:", error);

    return res.status(500).json({
      message: "Failed to update receipt"
    });
  }
});

module.exports = router;
