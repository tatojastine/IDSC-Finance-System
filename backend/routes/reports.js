const express = require("express");

const router = express.Router();

const Student = require("../models/Student");
const Assessment = require("../models/Assessment");
const Payment = require("../models/Payment");

// GET /api/v1/reports/collections
router.get("/collections", async (req, res) => {
  try {
    // Get all students
    const students = await Student.find();

    // Get all assessments
    const assessments = await Assessment.find();

    // Get all non-cancelled payments
    const payments = await Payment.find({
      paymentStatus: { $ne: "Cancelled" }
    });

    // Calculate total assessment
    const totalAssessment = assessments.reduce(
      (total, assessment) => total + assessment.totalAssessment,
      0
    );

    // Calculate total collected
    const totalCollected = payments.reduce(
      (total, payment) => total + payment.amountPaid,
      0
    );

    // Calculate total outstanding
    const totalOutstanding = Math.max(
      0,
      totalAssessment - totalCollected
    );

    // Return report
    res.json({
      totalAssessment,
      totalCollected,
      totalOutstanding,
      paymentCount: payments.length,
      studentCount: students.length
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate collections report",
      error: error.message
    });
  }
});

// GET /api/v1/reports/outstanding
router.get("/outstanding", async (req, res) => {
  try {
    const students = await Student.find();
    const assessments = await Assessment.find();
    const payments = await Payment.find({
      paymentStatus: { $ne: "Cancelled" }
    });

    const report = students
      .map((student) => {
        const studentAssessments = assessments.filter(
          (assessment) =>
            assessment.studentId === student.studentId
        );

        const studentPayments = payments.filter(
          (payment) =>
            payment.studentId === student.studentId
        );

        const totalAssessment = studentAssessments.reduce(
          (total, assessment) =>
            total + assessment.totalAssessment,
          0
        );

        const totalPaid = studentPayments.reduce(
          (total, payment) =>
            total + payment.amountPaid,
          0
        );

        const outstandingBalance = Math.max(
          0,
          totalAssessment - totalPaid
        );

        return {
          studentId: student.studentId,
          studentName: student.studentName,
          totalAssessment,
          totalPaid,
          outstandingBalance,
          accountStatus:
            outstandingBalance > 0 ? "Outstanding" : "Paid"
        };
      })
      .filter(
        (student) => student.outstandingBalance > 0
      );

    res.json(report);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate outstanding report",
      error: error.message
    });
  }
});

module.exports = router;