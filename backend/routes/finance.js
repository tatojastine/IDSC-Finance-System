const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Assessment = require("../models/Assessment");
const Payment = require("../models/Payment");

// GET student financial account
router.get("/:studentId", async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Check if student exists
    const student = await Student.findOne({
      studentId
    });

    if (!student) {
      return res
        .status(404)
        .type("application/problem+json")
        .json({
          type: "https://example.com/problems/finance-account-not-found",
          title: "Finance Account Not Found",
          status: 404,
          detail: "Finance account not found for this student"
        });
    }

    // Get all assessments for the student
    const assessments = await Assessment.find({
      studentId
    }).sort({ createdAt: -1 });

    // Get all non-cancelled payments
    const payments = await Payment.find({
      studentId,
      paymentStatus: { $ne: "Cancelled" }
    }).sort({ createdAt: -1 });

    // Calculate total assessment
    const totalAssessment = assessments.reduce(
      (total, assessment) =>
        total + assessment.totalAssessment,
      0
    );

    // Calculate total paid
    const totalPaid = payments.reduce(
      (total, payment) =>
        total + payment.amountPaid,
      0
    );

    // Calculate outstanding balance
    const outstandingBalance = Math.max(
      0,
      totalAssessment - totalPaid
    );

    // Determine account status
    let accountStatus = "Unpaid";

    if (totalAssessment === 0) {
      accountStatus = "No Assessment";
    } else if (totalPaid >= totalAssessment) {
      accountStatus = "Paid";
    } else if (totalPaid > 0) {
      accountStatus = "Partially Paid";
    }

    // Return financial account
    res.json({
      student: {
        studentId: student.studentId,
        studentName: student.studentName,
        program: student.program,
        academicYear: student.academicYear,
        semester: student.semester,
        accountStatus: student.accountStatus
      },
      finance: {
        totalAssessment,
        totalPaid,
        outstandingBalance,
        accountStatus
      },
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