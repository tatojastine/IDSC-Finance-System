import { useState } from "react";
import { ArrowRight, CheckCircle2, KeyRound, LockKeyhole, Mail, Moon, Sun } from "lucide-react";
import { createOwner, registerCashier, resetPassword, signIn } from "./Api.js";

export function ThemeButton({ theme, onToggle }) {
  const dark = theme === "dark";
  const label = dark ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button className="icon-btn account-theme" type="button" onClick={onToggle} aria-label={label} title={label}>
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export function RecoveryCode({ code }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="recovery-card">
      <p>Save this one-time recovery code somewhere private. You can use it to reset your password.</p>
      <label>
        Recovery code
        <input className="recovery-value" value={code} readOnly onFocus={(event) => event.target.select()} />
      </label>
      <button className="outline-btn" type="button" onClick={copyCode}>{copied ? "Copied" : "Copy code"}</button>
    </div>
  );
}

const forms = {
  setup: {
    title: "Create the owner account",
    description: "Set up IDSC Finance. The owner can use the system and approve up to two cashier accounts.",
    submit: "Create owner account",
  },
  login: {
    title: "Sign in to Finance",
    description: "Use your owner or approved cashier account.",
    submit: "Sign in",
  },
  register: {
    title: "Register as a cashier",
    description: "Your account will stay pending until the owner approves it.",
    submit: "Request cashier access",
  },
  reset: {
    title: "Reset your password",
    description: "Enter your email and the recovery code you saved when setting up your account.",
    submit: "Reset password",
  },
};

export default function AccountAccess({ Logo, setup, loading, startupError, onRefresh, onLogin, theme, onToggleTheme }) {
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const form = setup?.ownerRequired ? "setup" : view;
  const fields = forms[form];
  const waiting = loading || !setup;

  function changeView(next) {
    setView(next);
    setPassword("");
    setCode("");
    setError("");
    setResult(null);
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const details = { email, password };
      if (form === "login") {
        onLogin(await signIn({ ...details, remember }));
      } else {
        const response = await (
          form === "setup" ? createOwner(details)
            : form === "register" ? registerCashier(details)
              : resetPassword({ ...details, recoveryCode: code })
        );
        setResult({ form, code: response.recoveryCode });
        setPassword("");
        setCode("");
      }
    } catch (requestError) {
      setError(requestError.status ? requestError.message : "Could not reach Finance. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const resultTitles = {
    setup: "Owner account created",
    register: "Waiting for owner approval",
    reset: "Password reset",
  };
  const resultDetails = {
    setup: "Sign in to start using Finance and manage cashier requests.",
    register: "The owner can review your request in Cashier Accounts. Once approved, you can sign in.",
    reset: "Use your new password to sign in. This is your replacement recovery code.",
  };

  return (
    <div className="login-page">
      <section className="login-left">
        <div className="login-brand"><Logo /></div>
        <div className="login-hero">
          <span className="eyebrow light">FINANCE MANAGEMENT</span>
          <h1>Manage IDSC finances<br /><span>with confidence.</span></h1>
          <p>View student accounts, track collections, and manage cashier access.</p>
        </div>
        <small className="login-footer">Infotech Development Systems Colleges<br />Ligao City</small>
      </section>

      <section className="login-right">
        <div className="login-card">
          <div className="access-heading">
            <div className="mobile-login-logo"><Logo /></div>
            <ThemeButton theme={theme} onToggle={onToggleTheme} />
          </div>
          {waiting ? (
            <>
              <h2>{startupError ? "Could not connect to Finance" : "Checking setup…"}</h2>
              {startupError && <button className="outline-btn" onClick={onRefresh}>Retry</button>}
            </>
          ) : result ? (
            <>
              <span className="account-success"><CheckCircle2 size={20} /></span>
              <h2>{resultTitles[result.form]}</h2>
              <p className="login-sub">{resultDetails[result.form]}</p>
              <RecoveryCode code={result.code} />
              <button className="login-btn" onClick={() => { changeView("login"); onRefresh(); }}>Continue to sign in</button>
            </>
          ) : (
            <>
              <span className="eyebrow">{form === "setup" ? "FIRST-TIME SETUP" : "ACCOUNT ACCESS"}</span>
              <h2>{fields.title}</h2>
              <p className="login-sub">{fields.description}</p>
              <form onSubmit={submit}>
                <label>
                  Email address
                  <div className="input-wrap">
                    <Mail size={17} />
                    <input type="email" autoComplete="username" maxLength={254} required
                      value={email} onChange={(event) => setEmail(event.target.value)} />
                  </div>
                </label>
                {form === "reset" && (
                  <label>
                    Recovery code
                    <div className="input-wrap">
                      <KeyRound size={17} />
                      <input type="password" autoComplete="off" required
                        value={code} onChange={(event) => setCode(event.target.value)} />
                    </div>
                  </label>
                )}
                <label>
                  {form === "reset" ? "New password" : "Password"}
                  <div className="input-wrap">
                    <LockKeyhole size={17} />
                    <input type="password" autoComplete={form === "login" ? "current-password" : "new-password"}
                      minLength={form === "login" ? undefined : 12} required
                      value={password} onChange={(event) => setPassword(event.target.value)} />
                  </div>
                  {form !== "login" && <small className="password-hint">At least 12 characters.</small>}
                </label>
                {form === "login" && (
                  <div className="login-options">
                    <label className="check-label">
                      <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                      Remember me
                    </label>
                    <button type="button" className="account-link" disabled={submitting}
                      onClick={() => changeView("reset")}>Forgot password?</button>
                  </div>
                )}
                {error && <p className="login-error" role="alert">{error}</p>}
                <button className="login-btn" type="submit" disabled={submitting}>
                  {submitting ? "Please wait…" : fields.submit}<ArrowRight size={17} />
                </button>
              </form>
              {form === "login" && setup.cashierSlotsAvailable > 0 && (
                <button className="login-switch" type="button" disabled={submitting} onClick={() => changeView("register")}>
                  Register as a cashier
                </button>
              )}
              {form === "login" && setup.cashierSlotsAvailable === 0 && <p className="access-limit">Both cashier slots are occupied.</p>}
              {(form === "register" || form === "reset") && (
                <button className="login-switch" type="button" disabled={submitting} onClick={() => changeView("login")}>
                  Back to sign in
                </button>
              )}
              {form === "setup" && error && (
                <button className="login-switch" type="button" onClick={() => { setError(""); onRefresh(); }}>
                  Check setup again
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
