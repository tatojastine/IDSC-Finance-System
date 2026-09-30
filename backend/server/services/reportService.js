const students = require("../data/students");
const assessments = require("../data/assessments");
const payments = require("../data/payments");

function getCollectionsReport() {
  const totalAssessment = assessments.reduce(
    (total, assessment) => total + assessment.totalAssessment,
    0
  );

  const totalCollected = payments.reduce(
    (total, payment) => total + payment.amountPaid,
    0
  );

  const totalOutstanding = totalAssessment - totalCollected;

  return {
    totalAssessment,
    totalCollected,
    totalOutstanding,
    paymentCount: payments.length,
    studentCount: students.length
  };
}

function getOutstandingReport() {
  const report = students.map((student) => {
    const studentAssessments = assessments.filter(
      (assessment) => assessment.studentId === student.studentId
    );

    const studentPayments = payments.filter(
      (payment) => payment.studentId === student.studentId
    );

    const totalAssessment = studentAssessments.reduce(
      (total, assessment) => total + assessment.totalAssessment,
      0
    );

    const totalPaid = studentPayments.reduce(
      (total, payment) => total + payment.amountPaid,
      0
    );

    const outstandingBalance = totalAssessment - totalPaid;

    return {
      studentId: student.studentId,
      studentName: student.studentName,
      totalAssessment,
      totalPaid,
      outstandingBalance,
      accountStatus: outstandingBalance > 0 ? "Outstanding" : "Paid"
    };
  });

  return report.filter(
    (student) => student.outstandingBalance > 0
  );
}

module.exports = {
  getCollectionsReport,
  getOutstandingReport
};