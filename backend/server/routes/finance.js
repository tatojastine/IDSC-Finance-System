const express = require("express");

const router = express.Router();

const {
  getFinanceByStudentId
} = require("../services/financeService");

// GET /api/v1/finance/:studentId
router.get("/:studentId", (req, res) => {
  const finance = getFinanceByStudentId(req.params.studentId);

  if (!finance) {
    return res.status(404).type("application/problem+json").json({
      type: "https://example.com/problems/not-found",
      title: "Not Found",
      status: 404,
      detail: "Finance account not found for this student"
    });
  }

  res.json(finance);
});

module.exports = router;