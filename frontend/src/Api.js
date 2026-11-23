
const API_URL =
  import.meta.env.VITE_API_URL || "/api/v1";

async function request(path, { method = "GET", body, format = "json" } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (response.status === 204) return null;
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const error = new Error(data.message || "The Finance server could not complete the request.");
    error.status = response.status;
    throw error;
  }
  return format === "blob" ? response.blob() : response.json();
}

export const registerCashier = (details) =>
  request("/auth/register", { method: "POST", body: details });

export const getSetup = () => request("/auth/setup");
export const createOwner = (details) =>
  request("/auth/setup", { method: "POST", body: details });
export const resetPassword = (details) =>
  request("/auth/reset-password", { method: "POST", body: details });
export const replaceRecoveryCode = (password) =>
  request("/auth/recovery-code", { method: "POST", body: { password } });

export const getCashiers = () => request("/auth/cashiers");
export const changeCashierStatus = (id, action) =>
  request(`/auth/cashiers/${id}`, { method: "PATCH", body: { action } });
export const deleteCashier = (id) => request(`/auth/cashiers/${id}`, { method: "DELETE" });

export const signIn = (details) =>
  request("/auth/login", { method: "POST", body: details });

export const getSession = () => request("/auth/session");
export const signOut = () => request("/auth/logout", { method: "POST" });

export const searchEnrollments = (search, page) =>
  request(`/ledger/enrollments?${new URLSearchParams({ search, page })}`);
export const getEnrollment = (id) => request(`/ledger/enrollments/${id}`);
export const addEnrollment = (data) => request("/ledger/enrollments", { method: "POST", body: data });
export const addCharge = (data) => request("/ledger/charges", { method: "POST", body: data });
export const postPayment = (data) => request("/ledger/payments", { method: "POST", body: data });
export const getReceipt = (id) => request(`/ledger/payments/${id}/receipt`);
export const requestReversal = (id, reason) =>
  request(`/ledger/payments/${id}/reversals`, { method: "POST", body: { reason } });
export const getReversals = () => request("/ledger/reversals");
export const reviewReversal = (id, status, note) =>
  request(`/ledger/payments/${id}/reversal`, { method: "PATCH", body: { status, note } });
export const getDailyReport = (date) => request(`/ledger/reports/daily?date=${encodeURIComponent(date)}`);
export const downloadDailyReport = (date) =>
  request(`/ledger/reports/daily.csv?date=${encodeURIComponent(date)}`, { format: "blob" });
export const getPartnerItems = () => request("/ledger/partner-items");
export const updatePartnerItem = (id, action, reference) =>
  request(`/ledger/partner-items/${id}`, { method: "PATCH", body: { action, reference } });

export const listPayrollRuns = (page) => request(`/payroll/runs?page=${page}`);
export const createPayrollRun = (period) => request("/payroll/runs", { method: "POST", body: { period } });
export const getPayrollRun = (id) => request(`/payroll/runs/${id}`);
export const getPayrollWorkloads = (id) => request(`/payroll/runs/${id}/workloads`);
export const importPayrollWorkload = (id, body) =>
  request(`/payroll/runs/${id}/workloads`, { method: "POST", body });
export const savePayrollLine = (id, body) => request(`/payroll/runs/${id}/lines`, { method: "PUT", body });
export const removePayrollLine = (id, lineId, revision) =>
  request(`/payroll/runs/${id}/lines/${lineId}?revision=${revision}`, { method: "DELETE" });
export const finalizePayroll = (id, revision) => request(`/payroll/runs/${id}/finalize`, { method: "POST", body: { revision } });
export const recordPayrollSettlement = (id, body) => request(`/payroll/runs/${id}/settlement`, { method: "POST", body });

// GET STUDENTS FROM MONGODB
export async function getStudents() {
  const data = await request("/students");

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
  const data = await request("/payments");

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
