const payments = require("../data/payments");

function getAllPayments() {
  return payments;
}

function createPayment(data) {
  const newPayment = {
    paymentId: `PAY-2026-${String(payments.length + 1).padStart(3, "0")}`,
    ...data
  };

  payments.push(newPayment);

  return newPayment;
}

function getPaymentsByStudentId(studentId) {
  return payments.filter(
    (payment) => payment.studentId === studentId
  );
}

module.exports = {
  getAllPayments,
  createPayment,
  getPaymentsByStudentId
};