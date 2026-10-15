
const express = require("express");
const router = express.Router();

const Student = require("../models/Student");
const Assessment = require("../models/Assessment");
const Payment = require("../models/Payment");

// GET student financial account
router.get("/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate student ID
    if (!studentId || !studentId.trim()) {
      return res
        .status(400)
        .type("application/problem+json")
        .json({
          type: "https://example.com/problems/invalid-student-id",
          title: "Bad Request",
          status: 400,
          detail: "A valid student ID is required"
        });
    }

    // Find student
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res
        .status(404)
        .type("application/problem+json")
        .json({
          type: "https://example.com/problems/finance-account-not-found",
          title: "Finance Account Not Found",
          status: 404,
          detail: `No finance account was found for student ${studentId}`
        });
    }

    // Get student assessments
    const assessments = await Assessment.find({ studentId }).sort({
      createdAt: -1
    });

    // Get student payments, excluding cancelled payments
    const payments = await Payment.find({
      studentId,
      paymentStatus: { $ne: "Cancelled" }
    }).sort({ createdAt: -1 });

    // Calculate total assessment
    const totalAssessment = assessments.reduce((total, assessment) => {
      return total + (Number(assessment.totalAssessment) || 0);
    }, 0);

    // Calculate total paid
    const totalPaid = payments.reduce((total, payment) => {
      return total + (Number(payment.amountPaid) || 0);
    }, 0);

    // Calculate outstanding balance
    const outstandingBalance = Math.max(
      0,
      totalAssessment - totalPaid
    );

    // Determine financial account status
    let accountStatus = "Unpaid";

    if (totalAssessment === 0) {
      accountStatus = "No Assessment";
    } else if (totalPaid >= totalAssessment) {
      accountStatus = "Paid";
    } else if (totalPaid > 0) {
      accountStatus = "Partially Paid";
    }

    // Return financial account information
    return res.status(200).json({
      student: {
        studentId: student.studentId,
        studentName: student.studentName,
        program: student.program,
        academicYear: student.academicYear,
        semester: student.semester
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
    console.error("Failed to fetch student financial account:", error);

    return res
      .status(500)
      .type("application/problem+json")
      .json({
        type: "https://example.com/problems/internal-server-error",
        title: "Internal Server Error",
        status: 500,
        detail: "Failed to fetch student financial account"
      });
  }
});

module.exports = router;
