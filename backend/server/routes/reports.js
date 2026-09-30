const express = require("express");

const router = express.Router();

const {
  getCollectionsReport,
  getOutstandingReport
} = require("../services/reportService");

// GET /api/v1/reports/collections
router.get("/collections", (req, res) => {
  const report = getCollectionsReport();

  res.json(report);
});

// GET /api/v1/reports/outstanding
router.get("/outstanding", (req, res) => {
  const report = getOutstandingReport();

  res.json(report);
});

module.exports = router;