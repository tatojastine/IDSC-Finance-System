const express = require("express");

const router = express.Router();

const {
  getReceiptById
} = require("../services/receiptService");

// GET /api/v1/receipts/:id
router.get("/:id", (req, res) => {
  const receipt = getReceiptById(req.params.id);

  if (!receipt) {
    return res.status(404).type("application/problem+json").json({
      type: "https://example.com/problems/not-found",
      title: "Not Found",
      status: 404,
      detail: "Receipt not found"
    });
  }

  res.json(receipt);
});

module.exports = router;