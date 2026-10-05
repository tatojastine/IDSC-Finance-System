const express = require("express");
const router = express.Router();

const Receipt = require("../models/Receipt");

// GET all receipts
router.get("/", async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({ createdAt: -1 });

    res.json(receipts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch receipts",
      error: error.message
    });
  }
});

// GET receipts by student ID
router.get("/student/:studentId", async (req, res) => {
  try {
    const receipts = await Receipt.find({
      studentId: req.params.studentId
    }).sort({ createdAt: -1 });

    res.json(receipts);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student receipts",
      error: error.message
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

    res.json(receipt);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch receipt",
      error: error.message
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

    if (
      !receiptNumber ||
      !paymentId ||
      !studentId ||
      !studentName ||
      amountPaid === undefined ||
      !paymentMethod ||
      previousBalance === undefined ||
      remainingBalance === undefined ||
      !processedBy
    ) {
      return res.status(400).json({
        message: "All required receipt fields must be provided"
      });
    }

    if (amountPaid <= 0) {
      return res.status(400).json({
        message: "Amount paid must be greater than zero"
      });
    }

    const existingReceipt = await Receipt.findOne({
      receiptNumber
    });

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
      amountPaid,
      paymentMethod,
      referenceNumber,
      previousBalance,
      remainingBalance,
      processedBy
    });

    const savedReceipt = await receipt.save();

    res.status(201).json(savedReceipt);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create receipt",
      error: error.message
    });
  }
});

// DELETE receipt
router.delete("/:id", async (req, res) => {
  try {
    const receipt = await Receipt.findByIdAndDelete(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        message: "Receipt not found"
      });
    }

    res.json({
      message: "Receipt deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete receipt",
      error: error.message
    });
  }
});

module.exports = router;