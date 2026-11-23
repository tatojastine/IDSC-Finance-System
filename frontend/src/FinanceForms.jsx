import { useEffect, useRef, useState } from "react";

export function ResourceNotice({ resource }) {
  if (resource.error) return <p className="login-error" role="alert">{resource.error} <button className="outline-btn" onClick={resource.refresh}>Retry</button></p>;
  return <p role="status">Loading…</p>;
}

export function DataForm({ title, children, submitLabel, onSubmit, onCancel }) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const form = useRef(null);
  useEffect(() => {
    form.current.scrollIntoView({ block: "nearest" });
    form.current.querySelector("input, select")?.focus({ preventScroll: true });
  }, []);
  async function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setSaving(true);
    setError("");
    try {
      await onSubmit(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <form ref={form} className="panel finance-form" onSubmit={submit}>
      <h3>{title}</h3>
      <fieldset className="finance-fields" disabled={saving}>{children}</fieldset>
      {error && <p className="login-error" role="alert">{error}</p>}
      <div className="finance-actions">
        <button className="primary-btn" disabled={saving}>{saving ? "Saving…" : submitLabel}</button>
        {onCancel && <button type="button" className="outline-btn" disabled={saving} onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

export function Field({ label, name, maxLength = 100, type = "text", required = true, defaultValue, inputMode }) {
  return <label>{label}<input name={name} type={type} maxLength={maxLength} required={required} defaultValue={defaultValue} inputMode={inputMode} /></label>;
}

export function PesosField() {
  return <label>Amount (PHP)<input name="amount" inputMode="decimal" placeholder="0.00" maxLength={11} required /></label>;
}
