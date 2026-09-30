const students = require("../data/students");
const assessments = require("../data/assessments");
const payments = require("../data/payments");

function getFinanceByStudentId(studentId) {
  const student = students.find(
    (student) => student.studentId === studentId
  );

  if (!student) {
    return null;
  }

  const studentAssessments = assessments.filter(
    (assessment) => assessment.studentId === studentId
  );

  const studentPayments = payments.filter(
    (payment) => payment.studentId === studentId
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
    accountStatus: outstandingBalance <= 0 ? "Paid" : "Outstanding"
  };
}

module.exports = {
  getFinanceByStudentId
};