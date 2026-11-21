
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// GET STUDENTS FROM MONGODB
export async function getStudents() {
  const response = await fetch(`${API_URL}/students`);

  if (!response.ok) {
    throw new Error("Unable to load students from the backend.");
  }

  const data = await response.json();

  return data.map((student) => ({
    id: student.studentId,
    name: student.studentName,
    course: student.program,
    year: `${student.academicYear} - ${student.semester}`,
    status: student.accountStatus,
  }));
}

// GET PAYMENTS FROM MONGODB
export async function getPayments() {
  const response = await fetch(`${API_URL}/payments`);

  if (!response.ok) {
    throw new Error("Unable to load payments from the backend.");
  }

  const data = await response.json();

  return data.map((payment) => ({
    id: payment.paymentId,
    student: payment.studentId,
    type: "Payment",
    amount: payment.amountPaid,
    date: payment.paymentDate
      ? new Date(payment.paymentDate).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : "",
    status: payment.paymentStatus,
    method: payment.paymentMethod,
  }));
}

// CHECK BACKEND CONNECTION
export async function checkBackendConnection() {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error("Backend connection failed.");
  }

  return await response.json();
}
