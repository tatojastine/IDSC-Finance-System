import SalaryManagement from "./SalaryManagement.jsx";
import React, { useMemo, useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  WalletCards,
  ReceiptText,
  ChartNoAxesCombined,
  Settings as SettingsIcon,
  Search,
  Bell,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download,
  Eye,
  MoreHorizontal,
  CreditCard,
  Banknote,
  CircleDollarSign,
  FileText,
  X,
  CheckCircle2,
  Clock3,
  Menu,
  LogOut,
  LockKeyhole,
  Mail,
  UserRound,
  ShieldCheck,
  CircleHelp,
  Trash2,
  Moon,
  Sun,
} from "lucide-react";

// ========================================
// SAMPLE DATA
// ========================================

const initialTransactions = [
  {
    id: "TX-1048",
    student: "Maria Santos",
    type: "Tuition Fee",
    amount: 12500,
    date: "Oct 06, 2026",
    status: "Paid",
    method: "GCash",
  },
  {
    id: "TX-1047",
    student: "John Madrigal",
    type: "Laboratory Fee",
    amount: 2500,
    date: "Oct 06, 2026",
    status: "Pending",
    method: "Cash",
  },
  {
    id: "TX-1046",
    student: "Ashley Beltran",
    type: "Tuition Fee",
    amount: 10000,
    date: "Oct 05, 2026",
    status: "Paid",
    method: "Bank Transfer",
  },
  {
    id: "TX-1045",
    student: "Felix Almero",
    type: "Miscellaneous",
    amount: 1800,
    date: "Oct 05, 2026",
    status: "Paid",
    method: "GCash",
  },
  {
    id: "TX-1044",
    student: "Martin Matias",
    type: "Tuition Fee",
    amount: 8500,
    date: "Oct 04, 2026",
    status: "Overdue",
    method: "Cash",
  },
];

const initialStudents = [
  {
    id: "ST-001",
    name: "Maria Santos",
    course: "BS Information Technology",
    year: "1st Year",
    status: "Active",
  },
  {
    id: "ST-002",
    name: "John Madrigal",
    course: "BS Information Technology",
    year: "2nd Year",
    status: "Active",
  },
  {
    id: "ST-003",
    name: "Ashley Beltran",
    course: "BS Computer Science",
    year: "3rd Year",
    status: "Active",
  },
  {
    id: "ST-004",
    name: "Felix Almero",
    course: "BS Information Technology",
    year: "4th Year",
    status: "Active",
  },
  {
    id: "ST-005",
    name: "Martin Matias",
    course: "BS Computer Science",
    year: "2nd Year",
    status: "Pending",
  },
];

const navigation = [
  ["Dashboard", LayoutDashboard],
  ["Students", Users],
  ["Payments", WalletCards],
  ["Salary Management", Banknote],
  ["Expenses", ReceiptText],
  ["Reports", ChartNoAxesCombined],
  ["Settings", SettingsIcon],
];

const money = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(amount);

// ========================================
// IDSC LOGO
// ========================================

function Logo({ compact = false }) {
  return (
    <div className={compact ? "brand compact" : "brand"}>
      <img
        src="/idsc-logo.png"
        alt="IDSC Logo"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      {!compact && (
        <div>
          <strong>IDSC</strong>
          <span>Finance Web System</span>
        </div>
      )}
    </div>
  );
}

// ========================================
// LOGIN PAGE
// ========================================

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    onLogin(email);
  }

  return (
    <div className="login-page">
      <section className="login-left">
        <div className="login-brand">
          <Logo />
        </div>

        <div className="login-hero">
          <span className="eyebrow light">
            FINANCE MANAGEMENT
          </span>

          <h1>
            Manage IDSC finances
            <br />
            <span>with confidence.</span>
          </h1>

          <p>
            Manage student payments, school expenses,
            collections, and financial reports in one
            convenient system.
          </p>

          <div className="login-points">
            <div>
              <CheckCircle2 size={18} />
              Secure finance records
            </div>

            <div>
              <CheckCircle2 size={18} />
              Easy payment monitoring
            </div>

            <div>
              <CheckCircle2 size={18} />
              Organized financial reports
            </div>
          </div>
        </div>

        <small className="login-footer">
          © 2026 Infotech Development Systems Colleges
          <br />
          Ligao City
        </small>
      </section>

      <section className="login-right">
        <div className="login-card">
          <div className="mobile-login-logo">
            <Logo />
          </div>

          <span className="eyebrow">WELCOME BACK</span>

          <h2>Sign in to your account</h2>

          <p className="login-sub">
            Enter your account details to access
            the IDSC Finance Web System.
          </p>

          <form onSubmit={handleSubmit}>
            <label>
              Email address

              <div className="input-wrap">
                <Mail size={17} />

                <input
                  type="email"
                  placeholder="admin@idsc.edu.ph"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </div>
            </label>

            <label>
              Password

              <div className="input-wrap">
                <LockKeyhole size={17} />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />
              </div>
            </label>

            <div className="login-options">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) =>
                    setRemember(event.target.checked)
                  }
                />
                Remember me
              </label>
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button className="login-btn" type="submit">
              Sign in
              <ArrowUpRight size={17} />
            </button>
          </form>

          <div className="secure-note">
            <ShieldCheck size={15} />
            IDSC Finance Portal
          </div>
        </div>
      </section>
    </div>
  );
}

// ========================================
// DASHBOARD STATISTICS
// ========================================

function StatCard({
  title,
  value,
  change,
  positive = true,
  icon: Icon,
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div>
          <p className="muted">{title}</p>
          <h2>{value}</h2>
        </div>

        <div className="stat-icon">
          <Icon size={22} />
        </div>
      </div>

      <div className={positive ? "trend up" : "trend down"}>
        {positive ? (
          <ArrowUpRight size={16} />
        ) : (
          <ArrowDownRight size={16} />
        )}

        <b>{change}</b>
        <span>vs. last month</span>
      </div>
    </div>
  );
}

// ========================================
// PAGE HEADER
// ========================================

function PageIntro({ title, description, icon: Icon }) {
  return (
    <div className="page-intro">
      <div className="page-icon">
        <Icon size={23} />
      </div>

      <div>
        <span className="eyebrow">IDSC FINANCE</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

// ========================================
// TRANSACTION TABLE
// ========================================


function TransactionTable({
  rows,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <section className="panel transactions-panel">
      <div className="panel-head">
        <div>
          <h3>Recent transactions</h3>
          <p>Latest recorded finance activity</p>
        </div>

        <button className="outline-btn" onClick={onAdd}>
          <Plus size={15} />
          Add transaction
        </button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Student</th>
              <th>Type</th>
              <th>Date</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((transaction) => (
              <tr key={transaction.id}>
                <td><b>{transaction.id}</b></td>

                <td>
                  <div className="student-cell">
                    <div className="tiny-avatar">
                      {transaction.student
                        .split(" ")
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    {transaction.student}
                  </div>
                </td>

                <td>{transaction.type}</td>
                <td>{transaction.date}</td>
                <td>{transaction.method}</td>
                <td><b>{money(transaction.amount)}</b></td>

                <td>
                  <span
                    className={
                      "status " +
                      transaction.status.toLowerCase()
                    }
                  >
                    <span />
                    {transaction.status}
                  </span>
                </td>

                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="edit-btn"
                      title="Edit payment"
                      onClick={() => onEdit(transaction.id)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      title="Delete payment"
                      onClick={() => onDelete(transaction.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="empty">
            No transactions found.
          </div>
        )}
      </div>
    </section>
  );
}

// ========================================
// PAYMENTS MANAGEMENT PAGE
// ========================================

function PaymentsPage({
  transactions,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [paymentSearch, setPaymentSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const paidTransactions = transactions.filter(
    (item) => item.status === "Paid"
  );

  const pendingTransactions = transactions.filter(
    (item) => item.status === "Pending"
  );

  const overdueTransactions = transactions.filter(
    (item) => item.status === "Overdue"
  );

  const filteredPayments = transactions.filter((item) => {
    const query = paymentSearch.toLowerCase().trim();

    const matchesSearch = [
      item.id,
      item.student,
      item.type,
      item.method,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);

    const matchesStatus =
      statusFilter === "All" ||
      item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="payments-page">

      <PageIntro
        title="Payments"
        description="Record and monitor student payments."
        icon={WalletCards}
      />

      {/* PAYMENT SUMMARY */}
      <div className="stats-grid">

        <StatCard
          title="Total Collections"
          value={money(
            paidTransactions.reduce(
              (sum, item) => sum + item.amount,
              0
            )
          )}
          change={`${paidTransactions.length} paid records`}
          icon={CircleDollarSign}
        />

        <StatCard
          title="Pending Payments"
          value={money(
            pendingTransactions.reduce(
              (sum, item) => sum + item.amount,
              0
            )
          )}
          change={`${pendingTransactions.length} pending records`}
          icon={Clock3}
        />

        <StatCard
          title="Overdue Payments"
          value={money(
            overdueTransactions.reduce(
              (sum, item) => sum + item.amount,
              0
            )
          )}
          change={`${overdueTransactions.length} overdue records`}
          positive={false}
          icon={ReceiptText}
        />

        <StatCard
          title="Total Transactions"
          value={transactions.length.toString()}
          change="All recorded payments"
          icon={CreditCard}
        />

      </div>

      {/* PAYMENT RECORDS */}
      <div className="payments-records">

        <div className="panel-head payments-heading">
          <div>
            <h3>Payment transactions</h3>
            <p>
              Showing {filteredPayments.length} of{" "}
              {transactions.length} records
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={onAdd}
          >
            <Plus size={16} />
            Record payment
          </button>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="payments-toolbar">

          <div className="payments-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search transaction, student, or method..."
              value={paymentSearch}
              onChange={(event) =>
                setPaymentSearch(event.target.value)
              }
            />
          </div>

          <select
            className="payments-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>

        </div>

        <TransactionTable
          rows={filteredPayments}
          onAdd={onAdd}
          onEdit={onEdit}
          onDelete={onDelete}
        />

      </div>

    </section>
  );
}


// ========================================
// STUDENTS PAGE - IMPROVED VERSION
// ========================================


function StudentsPage({
  students,
  onAdd,
  onEdit,
  onDelete,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      student.name.toLowerCase().includes(search) ||
      student.id.toLowerCase().includes(search) ||
      student.course.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="students-page">
      <PageIntro
        title="Students"
        description="View and manage student finance records."
        icon={Users}
      />

      <div className="panel table-panel students-panel">
        <div className="panel-head students-header">
          <div>
            <h3>Student directory</h3>
            <p>
              Showing {filteredStudents.length} of{" "}
              {students.length} student records
            </p>
          </div>

          <button className="primary-btn" onClick={onAdd}>
            <Plus size={17} />
            Add student
          </button>
        </div>

        <div className="students-toolbar">
          <div className="student-search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, ID, or course..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <select
            className="student-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="table-wrap">
          <table className="students-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Program</th>
                <th>Year</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td><b>{student.id}</b></td>

                    <td>
                      <div className="student-cell">
                        <div className="tiny-avatar">
                          {student.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <span>{student.name}</span>
                      </div>
                    </td>

                    <td>{student.course}</td>
                    <td>{student.year}</td>

                    <td>
                      <span
                        className={`status ${
                          student.status === "Active"
                            ? "paid"
                            : student.status === "Pending"
                            ? "pending"
                            : "overdue"
                        }`}
                      >
                        <span />
                        {student.status}
                      </span>
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="edit-btn"
                          title="Edit student"
                          onClick={() => onEdit(student.id)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-btn"
                          title="Delete student"
                          onClick={() => onDelete(student.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="students-empty">
                      <Users size={30} />
                      <strong>No students found</strong>
                      <p>
                        Try another search term or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ========================================
//  IMPROVED EXPENSES PAGE
// ========================================


// ========================================
// EXPENSES PAGE
// ========================================

function ExpensesPage({ expenses, setExpenses }) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [formData, setFormData] = useState({
    name: "",
    category: "Utilities",
    amount: "",
    date: new Date().toLocaleDateString("en-CA"),
  });

  const MONTHLY_BUDGET = 1000000;

  // Calculate current month's expenses
  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date + "T00:00:00");
    const today = new Date();

    return (
      expenseDate.getMonth() === today.getMonth() &&
      expenseDate.getFullYear() === today.getFullYear()
    );
  });

  const totalExpenses = currentMonthExpenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const budgetRemaining = MONTHLY_BUDGET - totalExpenses;

  // Search and category filtering
  const filteredExpenses = expenses.filter((expense) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      expense.name.toLowerCase().includes(query) ||
      expense.category.toLowerCase().includes(query);

    const matchesCategory =
      categoryFilter === "All" ||
      expense.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Add expense
  const handleAddExpense = (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.amount ||
      Number(formData.amount) <= 0 ||
      !formData.date
    ) {
      alert("Please complete all fields with a valid amount.");
      return;
    }

    const newExpense = {
      id: Date.now(),
      name: formData.name.trim(),
      category: formData.category,
      amount: Number(formData.amount),
      date: formData.date,
    };

    setExpenses((previous) => [
      newExpense,
      ...previous,
    ]);

    setFormData({
      name: "",
      category: "Utilities",
      amount: "",
      date: new Date().toLocaleDateString("en-CA"),
    });

    setShowForm(false);
  };

  // Delete expense
  const handleDeleteExpense = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (confirmed) {
      setExpenses((previous) =>
        previous.filter((expense) => expense.id !== id)
      );
    }
  };

  return (
    <section className="expenses-page">

      <PageIntro
        title="Expenses"
        description="Monitor school operating expenses and outgoing funds."
        icon={ReceiptText}
      />

      {/* EXPENSE SUMMARY */}
      <div className="expense-grid">

        <div className="panel expense-card">
          <span>Monthly Expenses</span>

          <strong>{money(totalExpenses)}</strong>

          <small>
            {currentMonthExpenses.length} expense entries this month
          </small>
        </div>

        <div className="panel expense-card">
          <span>Budget Remaining</span>

          <strong
            className={
              budgetRemaining < 0 ? "budget-negative" : ""
            }
          >
            {money(budgetRemaining)}
          </strong>

          <small>
            Based on a sample ₱1,000,000 monthly budget
          </small>
        </div>

      </div>

      {/* EXPENSE RECORDS */}
      <div className="panel table-panel expenses-records">

        <div className="panel-head expenses-heading">

          <div>
            <h3>Expense records</h3>

            <p>
              Showing {filteredExpenses.length} of{" "}
              {expenses.length} expenses
            </p>
          </div>

          <button
            className="primary-btn"
            type="button"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <>
                <X size={17} />
                Cancel
              </>
            ) : (
              <>
                <Plus size={17} />
                Add expense
              </>
            )}
          </button>

        </div>

        {/* ADD EXPENSE FORM */}
        {showForm && (
          <form
            className="expense-form"
            onSubmit={handleAddExpense}
          >

            <h3>Add new expense</h3>

            <div className="expense-form-grid">

              <div className="expense-field">
                <label>Expense name</label>

                <input
                  type="text"
                  placeholder="e.g. Electricity Bill"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      name: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="expense-field">
                <label>Category</label>

                <select
                  value={formData.category}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      category: event.target.value,
                    })
                  }
                >
                  <option value="Utilities">Utilities</option>
                  <option value="Office Supplies">
                    Office Supplies
                  </option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Salaries">Salaries</option>
                  <option value="Transportation">
                    Transportation
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="expense-field">
                <label>Amount (PHP)</label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      amount: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="expense-field">
                <label>Expense date</label>

                <input
                  type="date"
                  value={formData.date}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      date: event.target.value,
                    })
                  }
                  required
                />
              </div>

            </div>

            <button
              type="submit"
              className="primary-btn"
            >
              <Plus size={16} />
              Save expense
            </button>

          </form>
        )}

        {/* SEARCH AND FILTER */}
        <div className="expenses-toolbar">

          <div className="expenses-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search expense..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <select
            className="expenses-filter"
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
          >
            <option value="All">All Categories</option>
            <option value="Utilities">Utilities</option>
            <option value="Office Supplies">
              Office Supplies
            </option>
            <option value="Maintenance">Maintenance</option>
            <option value="Salaries">Salaries</option>
            <option value="Transportation">
              Transportation
            </option>
            <option value="Other">Other</option>
          </select>

        </div>

        {/* EXPENSE TABLE */}
        <div className="table-wrap expenses-table-wrap">

          <table className="expenses-table">

            <thead>
              <tr>
                <th>Expense ID</th>
                <th>Expense Name</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id}>

                    <td>
                      <b>EXP-{String(expense.id).slice(-4)}</b>
                    </td>

                    <td>{expense.name}</td>

                    <td>
                      <span className="expense-category">
                        {expense.category}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        expense.date + "T00:00:00"
                      ).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </td>

                    <td className="expense-amount">
                      {money(expense.amount)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="expense-delete-btn"
                        title="Delete expense"
                        onClick={() =>
                          handleDeleteExpense(expense.id)
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <ReceiptText size={27} />
                      <b>No expenses found</b>
                      <span>
                        Try another search or add a new expense.
                      </span>
                    </div>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </section>
  );
}

// ========================================
//  REPORTS AND ANALYTICS
// ========================================

function ReportsPage({ transactions = [] }) {
  const [statusFilter, setStatusFilter] = useState("All");

  // Calculate financial totals
  const paidTransactions = transactions.filter(
    (item) => item.status === "Paid"
  );

  const pendingTransactions = transactions.filter(
    (item) => item.status === "Pending"
  );

  const overdueTransactions = transactions.filter(
    (item) => item.status === "Overdue"
  );

  const totalCollections = paidTransactions.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const pendingAmount = pendingTransactions.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const overdueAmount = overdueTransactions.reduce(
    (total, item) => total + Number(item.amount || 0),
    0
  );

  const filteredTransactions = transactions.filter((item) =>
    statusFilter === "All" || item.status === statusFilter
  );

  // Download transaction report as CSV
  function exportReport() {
    if (filteredTransactions.length === 0) {
      alert("There are no transactions to export.");
      return;
    }

    const headers = [
      "Transaction ID",
      "Student",
      "Payment Type",
      "Amount",
      "Date",
      "Payment Method",
      "Status",
    ];

    const rows = filteredTransactions.map((item) => [
      item.id,
      item.student,
      item.type,
      item.amount,
      item.date,
      item.method,
      item.status,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "IDSC-Financial-Report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <section className="reports-page">

      <PageIntro
        title="Reports"
        description="Monitor collections and review financial activity."
        icon={ChartNoAxesCombined}
      />

      {/* REPORT SUMMARY */}
      <div className="reports-summary-grid">

        <div className="panel reports-summary-card">
          <div className="reports-summary-icon">
            <CircleDollarSign size={21} />
          </div>

          <span>Total Collections</span>

          <strong>{money(totalCollections)}</strong>

          <small>
            {paidTransactions.length} paid transactions
          </small>
        </div>

        <div className="panel reports-summary-card">
          <div className="reports-summary-icon">
            <Clock3 size={21} />
          </div>

          <span>Pending Payments</span>

          <strong>{money(pendingAmount)}</strong>

          <small>
            {pendingTransactions.length} pending transactions
          </small>
        </div>

        <div className="panel reports-summary-card">
          <div className="reports-summary-icon">
            <ReceiptText size={21} />
          </div>

          <span>Overdue Payments</span>

          <strong>{money(overdueAmount)}</strong>

          <small>
            {overdueTransactions.length} overdue transactions
          </small>
        </div>

        <div className="panel reports-summary-card">
          <div className="reports-summary-icon">
            <FileText size={21} />
          </div>

          <span>Total Transactions</span>

          <strong>{transactions.length}</strong>

          <small>All recorded transactions</small>
        </div>

      </div>

      {/* REPORT INFORMATION */}
      <div className="panel reports-overview">

        <div className="reports-overview-heading">
          <div>
            <h3>Financial overview</h3>
            <p>Summary of recorded payment activity</p>
          </div>

          <span className="reports-period">
            All Records
          </span>
        </div>

        <div className="reports-progress-list">

          <div className="reports-progress-item">
            <div>
              <span>Paid transactions</span>
              <strong>{paidTransactions.length}</strong>
            </div>

            <div className="reports-progress-track">
              <div
                className="reports-progress-fill paid-fill"
                style={{
                  width: `${
                    transactions.length
                      ? (paidTransactions.length /
                          transactions.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="reports-progress-item">
            <div>
              <span>Pending transactions</span>
              <strong>{pendingTransactions.length}</strong>
            </div>

            <div className="reports-progress-track">
              <div
                className="reports-progress-fill pending-fill"
                style={{
                  width: `${
                    transactions.length
                      ? (pendingTransactions.length /
                          transactions.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="reports-progress-item">
            <div>
              <span>Overdue transactions</span>
              <strong>{overdueTransactions.length}</strong>
            </div>

            <div className="reports-progress-track">
              <div
                className="reports-progress-fill overdue-fill"
                style={{
                  width: `${
                    transactions.length
                      ? (overdueTransactions.length /
                          transactions.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* TRANSACTION LEDGER */}
      <div className="panel reports-ledger">

        <div className="reports-ledger-heading">

          <div>
            <h3>Transaction ledger</h3>

            <p>
              Review and export recorded transactions.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={exportReport}
          >
            <Download size={16} />
            Export CSV
          </button>

        </div>

        {/* FILTER */}
        <div className="reports-toolbar">

          <span>Filter transactions:</span>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            className="reports-filter"
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>

        </div>

        {/* TABLE */}
        <div className="table-wrap">

          <table className="reports-table">

            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Student</th>
                <th>Payment Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <tr key={item.id}>

                    <td>
                      <b>{item.id}</b>
                    </td>

                    <td>{item.student}</td>

                    <td>{item.type}</td>

                    <td>{item.date}</td>

                    <td className="reports-amount">
                      {money(item.amount)}
                    </td>

                    <td>
                      <span
                        className={`status ${
                          item.status === "Paid"
                            ? "paid"
                            : item.status === "Pending"
                            ? "pending"
                            : "overdue"
                        }`}
                      >
                        <span />
                        {item.status}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      <FileText size={28} />
                      <b>No transactions found</b>
                      <span>
                        There are no records for this status.
                      </span>
                    </div>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

      </div>

    </section>
  );
}


// ========================================
// SETTINGS PAGE
// ========================================

function SettingsPage({ userEmail, onLogout, onToast }) {
  const [name, setName] = useState("Jastine Nicole");
  const [email, setEmail] = useState(
    userEmail || "admin@idsc.edu.ph"
  );

  const handleSave = () => {
    if (!name.trim() || !email.trim()) {
      onToast("Please complete all required fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      onToast("Please enter a valid email address.");
      return;
    }

    onToast("Account information updated successfully!");
  };

  return (
    <section>
      <PageIntro
        title="Settings"
        description="Manage your account and system preferences."
        icon={SettingsIcon}
      />

      <div className="settings-grid">

        {/* ACCOUNT INFORMATION */}
        <div className="panel settings-card">
          <h3>Account information</h3>

          <p className="settings-description">
            Update your personal account details.
          </p>

          <label>
            Full name

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              readOnly={false}
            />
          </label>

          <label>
            Email address

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
            />
          </label>

          <label>
            Account role

            <input
              type="text"
              value="Finance Administrator"
              readOnly
            />
          </label>

          <button
            className="primary-btn"
            type="button"
            onClick={handleSave}
          >
            Save changes
          </button>
        </div>

        {/* SECURITY */}
        <div className="panel settings-card">
          <h3>Security</h3>

          <p className="settings-description">
            Review your account security information.
          </p>

          <div className="setting-row">
            <LockKeyhole size={20} />

            <span>
              <b>Password security</b>
              <small>
                Connect authentication to a backend for
                secure password management.
              </small>
            </span>
          </div>

          <div className="setting-row">
            <ShieldCheck size={20} />

            <span>
              <b>Account protection</b>
              <small>
                Server-side authentication is required
                for real account protection.
              </small>
            </span>
          </div>

          <div className="settings-divider"></div>

          <button
            className="danger-btn"
            type="button"
            onClick={onLogout}
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>

      </div>
    </section>
  );
}

// ========================================
// EDIT STUDENT MODAL
// ========================================

function StudentEditModal({ student, onClose, onSave }) {
  const [form, setForm] = useState({ ...student });
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.course.trim() ||
      !form.year.trim()
    ) {
      setError("Please complete all required student details.");
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      course: form.course.trim(),
      year: form.year.trim(),
    });
  }

  return (
    <div
      className="salary-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="salary-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-modal-title"
      >
        <div className="salary-modal-heading">
          <div>
            <h3 id="student-modal-title">Edit Student Record</h3>
            <p>Update the student's information.</p>
          </div>

          <button
            type="button"
            className="salary-close"
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="salary-form-grid">
            <label>
              Student ID
              <input value={form.id} disabled />
            </label>

            <label>
              Student Name *
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Enter full name"
                required
              />
            </label>

            <label className="salary-full-width">
              Program / Course *
              <input
                value={form.course}
                onChange={(event) =>
                  setForm({ ...form, course: event.target.value })
                }
                placeholder="e.g. BS Information Technology"
                required
              />
            </label>

            <label>
              Year Level *
              <select
                value={form.year}
                onChange={(event) =>
                  setForm({ ...form, year: event.target.value })
                }
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
                <option>5th Year</option>
              </select>
            </label>

            <label>
              Student Status *
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                <option>Active</option>
                <option>Pending</option>
                <option>Inactive</option>
              </select>
            </label>
          </div>

          {error && (
            <p className="salary-form-error">{error}</p>
          )}

          <div className="salary-modal-actions">
            <button
              type="button"
              className="salary-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="salary-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ========================================
// EDIT PAYMENT MODAL
// ========================================

function PaymentEditModal({ transaction, onClose, onSave }) {
  const [form, setForm] = useState({ ...transaction });
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.student.trim() ||
      !form.type.trim() ||
      !form.method.trim()
    ) {
      setError("Please complete all required payment details.");
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    onSave({
      ...form,
      student: form.student.trim(),
      type: form.type.trim(),
      method: form.method.trim(),
      amount,
    });
  }

  return (
    <div
      className="salary-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="salary-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        <div className="salary-modal-heading">
          <div>
            <h3 id="payment-modal-title">Edit Payment Record</h3>
            <p>Update the student's payment information.</p>
          </div>

          <button
            type="button"
            className="salary-close"
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="salary-form-grid">
            <label>
              Transaction ID
              <input value={form.id} disabled />
            </label>

            <label>
              Student Name *
              <input
                value={form.student}
                onChange={(event) =>
                  setForm({ ...form, student: event.target.value })
                }
                placeholder="Enter student name"
                required
              />
            </label>

            <label>
              Payment Type *
              <select
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value })
                }
              >
                <option>Tuition Fee</option>
                <option>Laboratory Fee</option>
                <option>Miscellaneous</option>
                <option>Other Fee</option>
              </select>
            </label>

            <label>
              Amount (₱) *
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm({ ...form, amount: event.target.value })
                }
                required
              />
            </label>

            <label>
              Payment Method *
              <select
                value={form.method}
                onChange={(event) =>
                  setForm({ ...form, method: event.target.value })
                }
              >
                <option>Cash</option>
                <option>GCash</option>
                <option>Bank Transfer</option>
              </select>
            </label>

            <label>
              Payment Status *
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({ ...form, status: event.target.value })
                }
              >
                <option>Paid</option>
                <option>Pending</option>
                <option>Overdue</option>
              </select>
            </label>

            <label className="salary-full-width">
              Transaction Date
              <input
                value={form.date}
                onChange={(event) =>
                  setForm({ ...form, date: event.target.value })
                }
                placeholder="e.g. Nov 13, 2026"
              />
            </label>
          </div>

          {error && (
            <p className="salary-form-error">{error}</p>
          )}

          <div className="salary-modal-actions">
            <button
              type="button"
              className="salary-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="salary-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========================================
// ADD TRANSACTION MODAL
// ========================================

function TransactionModal({ onClose, onSave }) {
  const [student, setStudent] = useState("");
  const [type, setType] = useState("Tuition Fee");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [status, setStatus] = useState("Paid");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!student.trim() || !amount || Number(amount) <= 0) {
      setError("Enter a student name and a valid amount.");
      return;
    }

    onSave({
      student: student.trim(),
      type,
      amount: Number(amount),
      method,
      status,
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">NEW RECORD</span>
            <h2>Record transaction</h2>
          </div>

          <button
            className="icon-btn"
            type="button"
            onClick={onClose}
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Student name

            <div className="input-wrap">
              <UserRound size={16} />

              <input
                value={student}
                onChange={(event) =>
                  setStudent(event.target.value)
                }
                placeholder="Enter student name"
                required
              />
            </div>
          </label>

          <div className="two-col">
            <label>
              Transaction type

              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option>Tuition Fee</option>
                <option>Laboratory Fee</option>
                <option>Miscellaneous</option>
                <option>Other Fee</option>
              </select>
            </label>

            <label>
              Amount (PHP)

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                required
              />
            </label>
          </div>

          <label>
            Payment method

            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
            >
              <option>Cash</option>
              <option>GCash</option>
              <option>Bank Transfer</option>
            </select>
          </label>

          <label>
            Payment status

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>Paid</option>
              <option>Pending</option>
              <option>Overdue</option>
            </select>
          </label>

          {error && (
            <div className="login-error">{error}</div>
          )}

          <div className="modal-actions">
            <button
              className="outline-btn"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button className="primary-btn" type="submit">
              <CheckCircle2 size={17} />
              Save transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========================================
// MAIN APPLICATION
// ========================================

function App() {
  // Login state
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Navigation state
  const [active, setActive] = useState("Dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  // Data state
  const [transactions, setTransactions] = useState(
    initialTransactions
  );
  const [students, setStudents] = useState(initialStudents);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("idsc-dark-mode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("idsc-dark-mode", darkMode);

    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  const [expenses, setExpenses] = useState(() => {
    try {
      const savedExpenses = localStorage.getItem("idsc-expenses");

      if (savedExpenses !== null) {
        return JSON.parse(savedExpenses);
      }
    } catch (error) {
      console.error("Unable to load expenses:", error);
    }

    return [
      {
        id: 1,
        name: "Electricity Bill",
        category: "Utilities",
        amount: 12500,
        date: "2026-11-05",
      },
      {
        id: 2,
        name: "Office Supplies",
        category: "Office Supplies",
        amount: 8500,
        date: "2026-11-08",
      },
      {
        id: 3,
        name: "Internet Subscription",
        category: "Utilities",
        amount: 3500,
        date: "2026-11-10",
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "idsc-expenses",
        JSON.stringify(expenses)
      );
    } catch (error) {
      console.error("Unable to save expenses:", error);
    }
  }, [expenses]);

  // Search, modal, and notification state
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");

  const filteredTransactions = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return transactions;

    return transactions.filter((transaction) =>
      Object.values(transaction)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [transactions, search]);

  function handleLogin(email) {
    setUserEmail(email);
    setLoggedIn(true);
    setActive("Dashboard");
  }

  function handleLogout() {
    setLoggedIn(false);
    setUserEmail("");
    setActive("Dashboard");
    setSearch("");
    setMenuOpen(false);
  }

  function navigate(page) {
    setActive(page);
    setSearch("");
    setMenuOpen(false);
  }

  function showToast(message) {
    setToast(message);

    window.setTimeout(() => {
      setToast((current) =>
        current === message ? "" : current
      );
    }, 3000);
  }

  function saveTransaction(formData) {
    const newTransaction = {
      ...formData,
      id: `TX-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    setTransactions((current) => [
      newTransaction,
      ...current,
    ]);

    setShowModal(false);
    setSearch("");
    showToast("Transaction added successfully.");
  }

  function deleteTransaction(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmed) return;

    setTransactions((current) =>
      current.filter((transaction) => transaction.id !== id)
    );

    showToast("Transaction deleted.");
  }

  function editTransaction(id) {
  const transaction = transactions.find(
    (item) => item.id === id
  );

  if (!transaction) return;

  setEditingPayment({ ...transaction });
  }

  function savePaymentChanges(updatedPayment) {
    setTransactions((current) =>
      current.map((item) =>
        item.id === updatedPayment.id ? updatedPayment : item
      )
    );

    setEditingPayment(null);
    showToast("Payment updated successfully.");
  }

  function addStudent() {
    const name = window.prompt("Enter the student's full name:");

    if (!name || !name.trim()) return;

    const course = window.prompt(
      "Enter the student's course:",
      "BS Information Technology"
    );

    if (!course || !course.trim()) return;

    const year = window.prompt(
      "Enter the year level:",
      "1st Year"
    );

    if (!year || !year.trim()) return;

    const newStudent = {
      id: `ST-${String(Date.now()).slice(-3)}`,
      name: name.trim(),
      course: course.trim(),
      year: year.trim(),
      status: "Active",
    };

    setStudents((current) => [...current, newStudent]);
    showToast("Student added successfully.");
  }

  function editStudent(id) {
    const student = students.find((item) => item.id === id);

    if (!student) return;

    setEditingStudent({ ...student });
  }

  function saveStudentChanges(updatedStudent) {
    setStudents((current) =>
      current.map((item) =>
        item.id === updatedStudent.id ? updatedStudent : item
      )
    );

    setEditingStudent(null);
    showToast("Student updated successfully.");
  }

  function deleteStudent(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) return;

    setStudents((current) =>
      current.filter((student) => student.id !== id)
    );

    showToast("Student deleted successfully.");
  }

  // Show login until the user signs in.
  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // ======================================
  // MAIN APP LAYOUT
  // ======================================

  return (
    <div className={darkMode ? "app-shell dark-mode" : "app-shell"}>
      {/* SIDEBAR */}

      <aside
        className={
          menuOpen
            ? "sidebar mobile-open"
            : "sidebar"
        }
      >
        <div className="brand-wrap">
          <Logo />
        </div>

        <div className="menu-label">MAIN MENU</div>

        <nav>
          {navigation.map(([label, Icon]) => (
            <button
              key={label}
              className={
                active === label
                  ? "nav-item active"
                  : "nav-item"
              }
              onClick={() => navigate(label)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <CircleHelp size={17} />
            </div>

            <div>
              <b>Need help?</b>
              <span>Contact the finance office.</span>
            </div>
          </div>

          <button
            className="profile-mini"
            onClick={() => navigate("Settings")}
          >
            <div className="avatar">JN</div>

            <div>
              <b>Finance Admin</b>
              <span>{userEmail}</span>
            </div>

            <ChevronDown size={16} />
          </button>

          <button
            className="nav-item logout"
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <Menu />
          </button>

          <div className="page-title">
            <p>Infotech Development Systems Colleges</p>
            <h1>{active}</h1>
          </div>

          <div className="top-actions">
            
            <button
              type="button"
              className="icon-btn theme-toggle"
              onClick={() => setDarkMode((previous) => !previous)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              className="icon-btn notification"
              onClick={() =>
                setShowNotifications((previous) => !previous)
              }
              aria-label="Notifications"
              type="button"
            >
              <Bell size={20} />

              {transactions.some(
                (item) =>
                  item.status === "Pending" ||
                  item.status === "Overdue"
              ) && <span className="notification-dot" />}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <div>
                    <h3>Notifications</h3>
                    <p>Payment updates and reminders</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="notification-list">
                  {transactions.filter(
                    (item) =>
                      item.status === "Pending" ||
                      item.status === "Overdue"
                  ).length > 0 ? (
                    transactions
                      .filter(
                        (item) =>
                          item.status === "Pending" ||
                          item.status === "Overdue"
                      )
                      .map((item) => (
                        <button
                          type="button"
                          className="notification-item"
                          key={item.id}
                          onClick={() => {
                            navigate("Payments");
                            setShowNotifications(false);
                          }}
                        >
                          <span
                            className={
                              item.status === "Overdue"
                                ? "notification-indicator overdue-indicator"
                                : "notification-indicator"
                            }
                          />

                          <span>
                            <strong>
                              {item.status === "Overdue"
                                ? "Overdue payment"
                                : "Pending payment"}
                            </strong>

                            <small>
                              {item.student} — {item.id}
                            </small>

                            <small>
                              Amount: {money(item.amount)}
                            </small>
                          </span>
                        </button>
                      ))
                  ) : (
                    <div className="notification-empty">
                      <CheckCircle2 size={25} />
                      <strong>You're all caught up!</strong>
                      <p>No pending or overdue payments.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              className="top-user"
              onClick={() => navigate("Settings")}
            >
              <div className="avatar">JN</div>

              <div className="top-user-text">
                <b>Finance Admin</b>
                <span>{userEmail}</span>
              </div>

              <ChevronDown size={16} />
            </button>
          </div>
        </header>

        <div className="content">
          {/* DASHBOARD */}

          {active === "Dashboard" && (
            <>
              <section className="welcome">
                <div>
                  <span className="eyebrow">
                    FINANCIAL OVERVIEW
                  </span>

                  <h2>Welcome to IDSC Finance! 👋</h2>

                  <p>
                    Here is an overview of the sample
                    financial records.
                  </p>
                </div>

                <button
                  className="primary-btn"
                  onClick={() => setShowModal(true)}
                >
                  <Plus size={18} />
                  Add transaction
                </button>
              </section>

              <section className="stats-grid">
                <StatCard
                  title="Total Collections"
                  value={money(
                    transactions
                      .filter((t) => t.status === "Paid")
                      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
                  )}
                  change={`${transactions.filter((t) => t.status === "Paid").length} successful payments`}
                  positive
                  icon={CircleDollarSign}
                />

                <StatCard
                  title="Pending Payments"
                  value={money(
                    transactions
                      .filter((t) => t.status === "Pending")
                      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
                  )}
                  change={`${transactions.filter((t) => t.status === "Pending").length} awaiting payment`}
                  positive={false}
                  icon={Clock3}
                />

                
                <StatCard
                  title="Monthly Expenses"
                  value={money(
                    expenses
                      .filter((expense) => {
                        const expenseDate = new Date(
                          expense.date + "T00:00:00"
                        );
                        const today = new Date();

                        return (
                          expenseDate.getMonth() === today.getMonth() &&
                          expenseDate.getFullYear() === today.getFullYear()
                        );
                      })
                      .reduce(
                        (total, expense) =>
                          total + Number(expense.amount || 0),
                        0
                      )
                  )}
                  change="Current month expenses"
                  positive={false}
                  icon={ReceiptText}
                />


                <StatCard
                  title="Student Records"
                  value={students.length.toString()}
                  change="Registered students"
                  positive
                  icon={Users}
                />
              </section>

              <section className="dashboard-grid">
                <div className="panel overview-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Collection overview</h3>
                      <p>Illustrative monthly finance activity</p>
                    </div>
                  </div>

                  <div className="chart">
                    <div className="y-axis">
                      <span>₱400k</span>
                      <span>₱300k</span>
                      <span>₱200k</span>
                      <span>₱100k</span>
                      <span>₱0</span>
                    </div>

                    <div className="chart-area">
                      <div className="grid-lines">
                        <i />
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>

                      <div className="bars">
                        {[
                          { month: "Jan", income: 62, expense: 27 },
                          { month: "Feb", income: 76, expense: 33 },
                          { month: "Mar", income: 54, expense: 25 },
                          { month: "Apr", income: 82, expense: 36 },
                          { month: "May", income: 70, expense: 30 },
                          { month: "Jun", income: 92, expense: 40 },
                          { month: "Jul", income: 80, expense: 35 },
                          { month: "Aug", income: 86, expense: 38 },
                          { month: "Sep", income: 65, expense: 29 },
                          { month: "Oct", income: 78, expense: 34 },
                          { month: "Nov", income: 88, expense: 39 },
                          { month: "Dec", income: 96, expense: 42 },
                        ].map((item) => (
                          <div className="bar-group" key={item.month}>
                            <div className="bar income"
                              style={{ height: `${item.income}%` }}
                              title={`${item.month} collections`}
                            />

                            <div className="bar expense"
                              style={{ height: `${item.expense}%` }}
                              title={`${item.month} expenses`}
                            />

                            <small>{item.month}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="legend">
                    <span>
                      <i className="dot income-dot" />
                      Collections
                    </span>

                    <span>
                      <i className="dot expense-dot" />
                      Expenses
                    </span>
                  </div>
                </div>

                <div className="panel quick-panel">
                  <div className="panel-head">
                    <div>
                      <h3>Quick actions</h3>
                      <p>Common finance tasks</p>
                    </div>
                  </div>

                  <button
                    className="quick-action"
                    onClick={() => setShowModal(true)}
                  >
                    <span className="qa-icon green">
                      <CreditCard size={20} />
                    </span>

                    <span>
                      <b>Record payment</b>
                      <small>Add a student payment</small>
                    </span>

                    <ArrowUpRight size={17} />
                  </button>

                  <button
                    className="quick-action"
                    onClick={() => navigate("Expenses")}
                  >
                    <span className="qa-icon blue">
                      <ReceiptText size={20} />
                    </span>

                    <span>
                      <b>Add expense</b>
                      <small>Open expense management</small>
                    </span>

                    <ArrowUpRight size={17} />
                  </button>

                  <button
                    className="quick-action"
                    onClick={() => navigate("Reports")}
                  >
                    <span className="qa-icon purple">
                      <FileText size={20} />
                    </span>

                    <span>
                      <b>View reports</b>
                      <small>Open financial reports</small>
                    </span>

                    <ArrowUpRight size={17} />
                  </button>

                  <button
                    className="quick-action"
                    onClick={() =>
                      showToast(
                        "Export functionality can be connected next."
                      )
                    }
                  >
                    <span className="qa-icon orange">
                      <Download size={20} />
                    </span>

                    <span>
                      <b>Download ledger</b>
                      <small>Export finance records</small>
                    </span>

                    <ArrowUpRight size={17} />
                  </button>
                </div>
              </section>

              <TransactionTable
                rows={filteredTransactions}
                onAdd={() => setShowModal(true)}
                onEdit={editTransaction}
                onDelete={deleteTransaction}
              />
            </>
          )}

          {/* STUDENTS */}

          {active === "Students" && (
            <StudentsPage
              students={students}
              onAdd={addStudent}
              onEdit={editStudent}
              onDelete={deleteStudent}
            />
          )}
          
          {/* PAYMENTS */}

          {active === "Payments" && (
            <PaymentsPage
              transactions={filteredTransactions}
              onAdd={() => setShowModal(true)}
              onEdit={editTransaction}
              onDelete={deleteTransaction}
            />
          )}

          {/* SALARY MANAGEMENT */}
          
          {active === "Salary Management" && (
            <SalaryManagement />
          )}

          {/* EXPENSES */}

          {active === "Expenses" && (
            <ExpensesPage
              expenses={expenses}
              setExpenses={setExpenses}
            />
          )}

          {/* REPORTS */}

          {active === "Reports" && (
            <ReportsPage transactions={transactions} />
          )}

          {/* SETTINGS */}

          {active === "Settings" && (
            <SettingsPage
              userEmail={userEmail}
              onLogout={handleLogout}
              onToast={showToast}
            />
          )}

          <footer>
            <span>© 2026 IDSC Finance Web System</span>
            <span>
              Infotech Development Systems Colleges • Ligao City
            </span>
          </footer>
        </div>
      </main>

      {/* TRANSACTION MODAL */}

      {showModal && (
        <TransactionModal
          onClose={() => setShowModal(false)}
          onSave={saveTransaction}
        />
      )}

      {/* EDIT STUDENT MODAL */}

      {editingStudent && (
        <StudentEditModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={saveStudentChanges}
        />
      )}

      {/* EDIT PAYMENT MODAL */}

      {editingPayment && (
        <PaymentEditModal
          transaction={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSave={savePaymentChanges}
        />
      )}

      {/* TOAST NOTIFICATION */}

      {toast && (
        <div className="toast">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}

    </div>
  );
}

export default App;
