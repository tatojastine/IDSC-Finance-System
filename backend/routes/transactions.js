const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");

// GET all transactions
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
});

// GET one transaction
router.get("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch transaction",
      error: error.message,
    });
  }
});

// CREATE transaction
router.post("/", async (req, res) => {
  try {
    const { type, amount, description, category } = req.body;

    if (!type || !amount || !description || !category) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const transaction = new Transaction({
      type,
      amount,
      description,
      category,
    });

    const savedTransaction = await transaction.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create transaction",
      error: error.message,
    });
  }
});

// UPDATE transaction
router.put("/:id", async (req, res) => {
  try {
    const { type, amount, description, category } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        type,
        amount,
        description,
        category,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update transaction",
      error: error.message,
    });
  }
});

// DELETE transaction
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json({
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
});

module.exports = router;