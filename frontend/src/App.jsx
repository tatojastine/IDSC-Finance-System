
import React, { useMemo, useState } from "react";
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
                <td>
                  <b>{transaction.id}</b>
                </td>

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

                <td>
                  <b>{money(transaction.amount)}</b>
                </td>

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
                  <button
                    className="more-btn"
                    title="Delete transaction"
                    onClick={() => onDelete(transaction.id)}
                  >
                    <Trash2 size={16} />
                  </button>
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
// STUDENTS PAGE
// ========================================

function StudentsPage({ students, onAdd, onToast }) {
  return (
    <section>
      <PageIntro
        title="Students"
        description="View and manage student finance records."
        icon={Users}
      />

      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>Student directory</h3>
            <p>{students.length} student records</p>
          </div>

          <button
            className="primary-btn"
            onClick={onAdd}
          >
            <Plus size={17} />
            Add student
          </button>
        </div>

        <div className="table-wrap">
          <table>
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
              {students.map((student) => (
                <tr key={student.id}>
                  <td>
                    <b>{student.id}</b>
                  </td>

                  <td>
                    <div className="student-cell">
                      <div className="tiny-avatar">
                        {student.name
                          .split(" ")
                          .map((word) => word[0])
                          .join("")}
                      </div>

                      {student.name}
                    </div>
                  </td>

                  <td>{student.course}</td>
                  <td>{student.year}</td>

                  <td>
                    <span className="status paid">
                      <span />
                      {student.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="more-btn"
                      onClick={() =>
                        onToast(
                          "Student record: " + student.name
                        )
                      }
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ========================================
// EXPENSES PAGE
// ========================================

function ExpensesPage({ onToast }) {
  return (
    <section>
      <PageIntro
        title="Expenses"
        description="Monitor school operating expenses and outgoing funds."
        icon={ReceiptText}
      />

      <div className="expense-grid">
        <div className="panel expense-card">
          <span>Monthly expenses</span>
          <strong>{money(326800)}</strong>
          <small>
            Office, utilities, supplies, and other expenses
          </small>
        </div>

        <div className="panel expense-card">
          <span>Budget remaining</span>
          <strong>{money(673200)}</strong>
          <small>Based on a sample ₱1,000,000 budget</small>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>Expense records</h3>
            <p>Manage your outgoing transactions</p>
          </div>

          <button
            className="primary-btn"
            onClick={() =>
              onToast("Expense entry is ready for implementation.")
            }
          >
            <Plus size={17} />
            Add expense
          </button>
        </div>

        <div className="empty-state">
          <ReceiptText size={27} />
          <b>No expense records available</b>
          <span>
            Expense records will appear here when added.
          </span>
        </div>
      </div>
    </section>
  );
}

// ========================================
// REPORTS PAGE
// ========================================

function ReportsPage({ onToast }) {
  const reports = [
    {
      title: "Monthly Collection Report",
      description: "Review collections by month.",
      icon: CircleDollarSign,
    },
    {
      title: "Expense Summary",
      description: "Review school operating expenses.",
      icon: ReceiptText,
    },
    {
      title: "Student Balance Report",
      description: "Review outstanding student balances.",
      icon: Users,
    },
    {
      title: "Transaction Ledger",
      description: "Review recorded finance activity.",
      icon: FileText,
    },
  ];

  return (
    <section>
      <PageIntro
        title="Reports"
        description="Generate and review IDSC financial reports."
        icon={ChartNoAxesCombined}
      />

      <div className="report-grid">
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <button
              className="report-card"
              key={report.title}
              onClick={() =>
                onToast(
                  report.title +
                    " preview is ready for implementation."
                )
              }
            >
              <span className="report-icon">
                <Icon size={22} />
              </span>

              <span>
                <b>{report.title}</b>
                <small>{report.description}</small>
              </span>

              <Download size={17} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ========================================
// SETTINGS PAGE
// ========================================

function SettingsPage({ userEmail, onLogout, onToast }) {
  const [name, setName] = useState("Justine Nicole");
  const [email, setEmail] = useState(
    userEmail || "admin@idsc.edu.ph"
  );

  return (
    <section>
      <PageIntro
        title="Settings"
        description="Manage your account and system preferences."
        icon={SettingsIcon}
      />

      <div className="settings-grid">
        <div className="panel settings-card">
          <h3>Account information</h3>

          <label>
            Full name

            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label>
            Email address

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            Account role

            <input
              value="Finance Administrator"
              readOnly
            />
          </label>

          <button
            className="primary-btn"
            onClick={() =>
              onToast("Account information updated for this session.")
            }
          >
            Save changes
          </button>
        </div>

        <div className="panel settings-card">
          <h3>Security</h3>

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
                Real access control requires server-side
                authentication.
              </small>
            </span>
          </div>

          <button
            className="danger-btn"
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

  // Show login until the user signs in.
  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // ======================================
  // MAIN APP LAYOUT
  // ======================================

  return (
    <div className="app-shell">
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
            <div className="search-box">
              <Search size={18} />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search transactions..."
              />
            </div>

            <button
              className="icon-btn notification"
              onClick={() =>
                showToast("You have no new notifications.")
              }
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>

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
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                  change="Recorded payments"
                  positive
                  icon={CircleDollarSign}
                />

                <StatCard
                  title="Pending Payments"
                  value={money(
                    transactions
                      .filter((t) => t.status === "Pending")
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                  change="Awaiting payment"
                  positive
                  icon={Clock3}
                />

                <StatCard
                  title="Monthly Expenses"
                  value={money(326800)}
                  change="Sample data"
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
                        {[62, 76, 54, 82, 70, 92, 80, 86, 65, 78, 88, 96].map(
                          (height, index) => (
                            <div className="bar-group" key={index}>
                              <div
                                className="bar income"
                                style={{ height: `${height}%` }}
                              />

                              <div
                                className="bar expense"
                                style={{
                                  height: `${Math.max(
                                    25,
                                    height * 0.43
                                  )}%`,
                                }}
                              />

                              <small>
                                {[
                                  "Jan",
                                  "Feb",
                                  "Mar",
                                  "Apr",
                                  "May",
                                  "Jun",
                                  "Jul",
                                  "Aug",
                                  "Sep",
                                  "Oct",
                                  "Nov",
                                  "Dec",
                                ][index]}
                              </small>
                            </div>
                          )
                        )}
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
                onDelete={deleteTransaction}
              />
            </>
          )}

          {/* STUDENTS */}

          {active === "Students" && (
            <StudentsPage
              students={students}
              onAdd={addStudent}
              onToast={showToast}
            />
          )}

          {/* PAYMENTS */}

          {active === "Payments" && (
            <section>
              <PageIntro
                title="Payments"
                description="Record and monitor student payments."
                icon={WalletCards}
              />

              <div className="stats-grid compact-stats">
                <StatCard
                  title="Paid transactions"
                  value={money(
                    transactions
                      .filter((t) => t.status === "Paid")
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                  change="Total recorded"
                  positive
                  icon={CreditCard}
                />

                <StatCard
                  title="Pending payments"
                  value={money(
                    transactions
                      .filter((t) => t.status === "Pending")
                      .reduce((sum, t) => sum + t.amount, 0)
                  )}
                  change="Awaiting payment"
                  positive
                  icon={Clock3}
                />
              </div>

              <TransactionTable
                rows={filteredTransactions}
                onAdd={() => setShowModal(true)}
                onDelete={deleteTransaction}
              />
            </section>
          )}

          {/* EXPENSES */}

          {active === "Expenses" && (
            <ExpensesPage onToast={showToast} />
          )}

          {/* REPORTS */}

          {active === "Reports" && (
            <ReportsPage onToast={showToast} />
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
