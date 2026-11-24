import { useCallback, useEffect, useRef, useState } from "react";
import { getSetup, getSession, replaceRecoveryCode, signOut } from "./Api.js";
import AccountAccess, { RecoveryCode, ThemeButton } from "./AccountAccess.jsx";
import CashierManagement from "./CashierManagement.jsx";
import FacultyPayroll from "./FacultyPayroll.jsx";
import { DailyCollections, EnrollmentWorkspace, PartnerInbox, ReversalQueue } from "./FinanceWorkspace.jsx";

import {
  LayoutDashboard,
  Users,
  WalletCards,
  ChartNoAxesCombined,
  Settings as SettingsIcon,
  ChevronDown,
  CheckCircle2,
  Menu,
  LogOut,
  ShieldCheck,
  Undo2,
  Network,
  Banknote,
  X,
} from "lucide-react";


const navigationGroups = [
  { items: [["Dashboard", LayoutDashboard]] },
  { label: "Collections", items: [
    ["Students", Users],
    ["Payments", WalletCards],
    ["Reversals", Undo2, "owner"],
    ["Reports", ChartNoAxesCombined],
  ] },
  { label: "Operations", items: [
    ["Faculty Payroll", Banknote, "owner"],
    ["Partner Records", Network, "owner"],
  ] },
  { label: "Account", items: [
    ["Cashier Accounts", ShieldCheck, "owner"],
    ["Settings", SettingsIcon],
  ] },
];

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

// ========================================
// DASHBOARD STATISTICS
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

function SettingsPage({ account, onLogout }) {
  const [password, setPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function generateCode(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await replaceRecoveryCode(password);
      setRecoveryCode(result.recoveryCode);
      setPassword("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <PageIntro title="Settings" description="View your account and manage password recovery." icon={SettingsIcon} />
      <div className="settings-grid account-settings">
        <div className="panel settings-card">
          <h3>Account information</h3>
          <label>
            Email address
            <input type="email" value={account.email} readOnly />
          </label>
          <label>
            Account role
            <input value={account.role === "owner" ? "Owner" : "Cashier"} readOnly />
          </label>
          <button className="danger-btn" onClick={onLogout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
        <div className="panel settings-card">
          <h3>Password recovery</h3>
          {recoveryCode ? (
            <>
              <RecoveryCode code={recoveryCode} />
              <button className="outline-btn" onClick={() => setRecoveryCode("")}>Done</button>
            </>
          ) : (
            <form onSubmit={generateCode}>
              <p>Generate a new recovery code if yours is missing. This will replace your previous code.</p>
              <label>
                Current password
                <input type="password" autoComplete="current-password" required
                  value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
              {error && <p className="login-error" role="alert">{error}</p>}
              <button className="outline-btn" disabled={saving}>{saving ? "Generating…" : "Generate recovery code"}</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

// ========================================
// ADD TRANSACTION MODAL
// ========================================

function App() {
  const [account, setAccount] = useState(null);
  const [setup, setSetup] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [startupError, setStartupError] = useState(false);
  const [startupAttempt, setStartupAttempt] = useState(0);
  const [theme, setTheme] = useState(() => (
    localStorage.getItem("idsc-finance-theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  ));

  // Navigation state
  const [active, setActive] = useState("Dashboard");
  const [paymentEnrollment, setPaymentEnrollment] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggle = useRef(null);
  const drawerClose = useRef(null);

  const [toast, setToast] = useState("");

  const clearSession = useCallback(() => {
    setAccount(null);
    setActive("Dashboard");
    setPaymentEnrollment(null);
    setMenuOpen(false);
    setToast("");
    setSessionLoading(true);
    setStartupAttempt((attempt) => attempt + 1);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem("idsc-finance-theme", theme);
  }, [theme]);

  function refreshAccess() {
    setSessionLoading(true);
    setStartupError(false);
    setStartupAttempt((attempt) => attempt + 1);
  }

  function toggleTheme() {
    setTheme((current) => current === "dark" ? "light" : "dark");
  }

  useEffect(() => {
    let cancelled = false;

    async function loadAccess() {
      try {
        const settings = await getSetup();
        const session = settings.ownerRequired ? null : await getSession().catch((error) => {
          if (error.status !== 401) throw error;
          return null;
        });
        if (!cancelled) {
          setSetup(settings);
          setAccount(session);
          setStartupError(false);
        }
      } catch {
        if (!cancelled) {
          setSetup(null);
          setStartupError(true);
        }
      } finally {
        if (!cancelled) setSessionLoading(false);
      }
    }

    loadAccess();
    return () => { cancelled = true; };
  }, [startupAttempt]);

  useEffect(() => {
    if (!account) return;
    let isMounted = true;

    async function checkAccess() {
      try {
        await getSession();
      } catch (error) {
        if (isMounted && error.status === 401) clearSession();
      }
    }

    const refreshTimer = window.setInterval(checkAccess, 30000);
    window.addEventListener("focus", checkAccess);
    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", checkAccess);
    };
  }, [account, clearSession]);

  function handleLogin(user) {
    setAccount(user);
    setActive("Dashboard");
  }

  async function handleLogout() {
    try {
      await signOut();
    } catch {
      showToast("Could not sign out. Try again.");
      return;
    }
    clearSession();
  }

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuToggle.current?.focus();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    drawerClose.current?.focus();
    function handleEscape(event) {
      if (event.key === "Escape") closeMenu();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [menuOpen, closeMenu]);

  function navigate(page, enrollment = null) {
    setActive(page);
    setPaymentEnrollment(enrollment);
    if (menuOpen) closeMenu();
  }

  function showToast(message) {
    setToast(message);

    window.setTimeout(() => {
      setToast((current) =>
        current === message ? "" : current
      );
    }, 3000);
  }

  if (!account) {
    return <AccountAccess Logo={Logo} onLogin={handleLogin} loading={sessionLoading}
      setup={setup} startupError={startupError} onRefresh={refreshAccess}
      theme={theme} onToggleTheme={toggleTheme} />;
  }
  const userEmail = account.email;
  const roleLabel = account.role === "owner" ? "Owner" : "Cashier";
  const owner = account.role === "owner";
  const menu = navigationGroups.map(({ label, items }) => ({
    label,
    items: items.filter(([, , role]) => !role || role === account.role),
  })).filter(({ items }) => items.length > 0);

  // ======================================
  // MAIN APP LAYOUT
  // ======================================

  return (
    <div className="app-shell">
      {menuOpen && <button className="sidebar-backdrop" type="button" onClick={closeMenu} tabIndex={-1}
        aria-hidden="true" />}

      <aside
        id="finance-sidebar"
        className={
          menuOpen
            ? "sidebar mobile-open"
            : "sidebar"
        }
      >
        <div className="brand-wrap">
          <Logo />
          <button ref={drawerClose} className="sidebar-close" type="button" aria-label="Close navigation"
            onClick={closeMenu}>
            <X size={19} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar-navigation" aria-label="Finance navigation">
          {menu.map(({ label, items }) => (
            <div className="sidebar-group" key={label ?? "dashboard"}
              role={label ? "group" : undefined} aria-label={label}>
              {label && <p className="menu-label">{label}</p>}
              {items.map(([name, Icon]) => (
                <button key={name} type="button"
                  className={active === name ? "nav-item active" : "nav-item"}
                  aria-current={active === name ? "page" : undefined}
                  onClick={() => navigate(name)}>
                  <Icon size={18} aria-hidden="true" />
                  <span>{name}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-mini">
            <div className="avatar" aria-hidden="true">{userEmail.slice(0, 2).toUpperCase()}</div>
            <div>
              <b>{roleLabel}</b>
              <span>{userEmail}</span>
            </div>
          </div>

          <button
            type="button"
            className="nav-item logout"
            onClick={handleLogout}
          >
            <LogOut size={18} aria-hidden="true" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="main">
        <header className="topbar">
          <button
            ref={menuToggle}
            type="button"
            className="mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open finance navigation"
            aria-expanded={menuOpen}
            aria-controls="finance-sidebar"
          >
            <Menu />
          </button>

          <div className="page-title">
            <p>Infotech Development Systems Colleges</p>
            <h1>{active}</h1>
          </div>

          <div className="top-actions">
            <ThemeButton theme={theme} onToggle={toggleTheme} />
            <button
              className="top-user"
              onClick={() => navigate("Settings")}
            >
              <div className="avatar">{userEmail.slice(0, 2).toUpperCase()}</div>

              <div className="top-user-text">
                <b>{roleLabel}</b>
                <span>{userEmail}</span>
              </div>

              <ChevronDown size={16} />
            </button>
          </div>
        </header>

        <div className="content">
          {active === "Dashboard" && <DailyCollections owner={owner} compact navigate={navigate} />}
          {active === "Students" && (
            <EnrollmentWorkspace key="Students" owner={owner} onOpenAccount={(row) => navigate("Payments", row)} />
          )}
          {active === "Payments" && (
            <EnrollmentWorkspace key="Payments" paymentView initialEnrollment={paymentEnrollment} />
          )}
          {active === "Reports" && <DailyCollections owner={owner} />}
          {active === "Reversals" && owner && <ReversalQueue />}
          {active === "Partner Records" && owner && <PartnerInbox />}
          {active === "Faculty Payroll" && owner && <FacultyPayroll />}

          {/* SETTINGS */}

          {active === "Settings" && (
            <SettingsPage
              account={account}
              onLogout={handleLogout}
            />
          )}

          {active === "Cashier Accounts" && account.role === "owner" && <CashierManagement />}

          <footer>
            <span>© 2026 IDSC Finance Web System</span>
            <span>
              Infotech Development Systems Colleges • Ligao City
            </span>
          </footer>
        </div>
      </main>

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
