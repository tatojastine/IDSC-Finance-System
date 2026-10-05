const express = require("express");
const router = express.Router();

const Assessment = require("../models/Assessment");
const Payment = require("../models/Payment");

// GET student financial account
router.get("/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Get all assessments for the student
    const assessments = await Assessment.find({
      studentId
    }).sort({ createdAt: -1 });

    // Get all payments for the student
    const payments = await Payment.find({
      studentId,
      paymentStatus: { $ne: "Cancelled" }
    }).sort({ createdAt: -1 });

    // Calculate total assessment
    const totalAssessment = assessments.reduce(
      (total, assessment) => total + assessment.totalAssessment,
      0
    );

    // Calculate total payments
    const totalPaid = payments.reduce(
      (total, payment) => total + payment.amountPaid,
      0
    );

    // Calculate outstanding balance
    const outstandingBalance = Math.max(
      0,
      totalAssessment - totalPaid
    );

    // Determine account status
    let accountStatus = "Unpaid";

    if (totalPaid >= totalAssessment && totalAssessment > 0) {
      accountStatus = "Paid";
    } else if (totalPaid > 0) {
      accountStatus = "Partially Paid";
    }

    res.json({
      studentId,
      totalAssessment,
      totalPaid,
      outstandingBalance,
      accountStatus,
      assessments,
      payments
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch student financial account",
      error: error.message
    });
  }
});

module.exports = router;