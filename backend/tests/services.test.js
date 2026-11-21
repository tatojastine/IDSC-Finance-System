
const test = require("node:test");
const assert = require("node:assert/strict");

// Import services
const Student = require("../models/Student");

const studentService = require("../server/services/studentService");
const assessmentService = require("../server/services/assessmentService");
const paymentService = require("../server/services/paymentService");
const receiptService = require("../server/services/receiptService");
const financeService = require("../server/services/financeService");
const reportService = require("../server/services/reportService");

// 1. Get all students
test("1. Student service returns all students", async () => {
  const originalFind = Student.find;

  const fakeStudents = [
    { studentId: "2026-001", studentName: "Juan Dela Cruz" },
    { studentId: "2026-002", studentName: "Maria Santos" }
  ];

  Student.find = () => ({
    sort: (options) => {
      assert.deepEqual(options, { createdAt: -1 });
      return {
        lean: async () => fakeStudents
      };
    }
  });

  try {
    const result = await studentService.getAllStudents();
    assert.equal(result.length, 2);
    assert.equal(result[0].studentName, "Juan Dela Cruz");
  } finally {
    Student.find = originalFind;
  }
});

// 2. Get student by ID
test("2. Student service finds student by ID", async () => {
  const originalFindOne = Student.findOne;

  Student.findOne = (query) => {
    assert.deepEqual(query, { studentId: "2026-001" });
    return {
      lean: async () => ({
        studentId: "2026-001",
        studentName: "Juan Dela Cruz"
      })
    };
  };

  try {
    const result = await studentService.getStudentById(" 2026-001 ");
    assert.equal(result.studentName, "Juan Dela Cruz");
  } finally {
    Student.findOne = originalFindOne;
  }
});

// 3. Get all assessments
test("3. Assessment service returns all assessments", () => {
  const result = assessmentService.getAllAssessments();

  assert.equal(result.length, 3);
});

// 4. Get assessments by student ID
test("4. Assessment service filters by student ID", () => {
  const result = assessmentService.getAssessmentsByStudentId("2026-001");

  assert.equal(result.length, 1);
  assert.equal(result[0].id, "ASM-2026-001");
});

// 5. Get all payments
test("5. Payment service returns all payments", () => {
  const result = paymentService.getAllPayments();

  assert.equal(result.length, 2);
});

// 6. Get payments by student ID
test("6. Payment service filters by student ID", () => {
  const result = paymentService.getPaymentsByStudentId("2026-001");

  assert.equal(result.length, 1);
  assert.equal(result[0].amountPaid, 5000);
});

// 7. Find existing receipt
test("7. Receipt service finds an existing receipt", () => {
  const result = receiptService.getReceiptById("OR-2026-001");

  assert.equal(result.studentName, "Juan Dela Cruz");
  assert.equal(result.amount, 5000);
});

// 8. Find missing receipt
test("8. Receipt service returns undefined for missing receipt", () => {
  const result = receiptService.getReceiptById("OR-999");

  assert.equal(result, undefined);
});

// 9. Get Juan's finance information
test("9. Finance service calculates Juan's balance", () => {
  const result = financeService.getFinanceByStudentId("2026-001");

  assert.equal(result.totalAssessment, 19500);
  assert.equal(result.totalPaid, 5000);
  assert.equal(result.outstandingBalance, 14500);
  assert.equal(result.accountStatus, "Outstanding");
});

// 10. Get Maria's finance information
test("10. Finance service identifies fully paid student", () => {
  const result = financeService.getFinanceByStudentId("2026-002");

  assert.equal(result.totalAssessment, 19000);
  assert.equal(result.totalPaid, 19000);
  assert.equal(result.outstandingBalance, 0);
  assert.equal(result.accountStatus, "Paid");
});

// 11. Find missing student finance record
test("11. Finance service returns null for missing student", () => {
  const result = financeService.getFinanceByStudentId("999999");

  assert.equal(result, null);
});

// 12. Get collections report
test("12. Report service calculates collections totals", () => {
  const result = reportService.getCollectionsReport();

  assert.equal(result.totalAssessment, 57000);
  assert.equal(result.totalCollected, 24000);
  assert.equal(result.totalOutstanding, 33000);
  assert.equal(result.paymentCount, 2);
  assert.equal(result.studentCount, 4);
});

// 13. Get outstanding report
test("13. Report service returns students with outstanding balances", () => {
  const result = reportService.getOutstandingReport();

  assert.equal(result.length, 2);

  assert.equal(result[0].studentId, "2026-001");
  assert.equal(result[0].outstandingBalance, 14500);

  assert.equal(result[1].studentId, "2026-003");
  assert.equal(result[1].outstandingBalance, 18500);
});

// 14. Create assessment
test("14. Assessment service creates a new assessment", () => {
  const data = {
    studentId: "2026-004",
    totalAssessment: 20000
  };

  const result = assessmentService.createAssessment(data);

  assert.equal(result.id, "ASM-2026-004");
  assert.equal(result.studentId, "2026-004");
  assert.ok(assessmentService.getAllAssessments().includes(result));
});

// 15. Create payment
test("15. Payment service creates a new payment", () => {
  const data = {
    studentId: "2026-004",
    amountPaid: 3000
  };

  const result = paymentService.createPayment(data);

  assert.equal(result.paymentId, "PAY-2026-003");
  assert.equal(result.studentId, "2026-004");
  assert.equal(result.amountPaid, 3000);
  assert.ok(paymentService.getAllPayments().includes(result));
});
