import { useEffect, useState } from "react";
import { changeCashierStatus, deleteCashier, getCashiers } from "./Api.js";

const nextAction = {
  pending: ["approve", "Approve"],
  active: ["deactivate", "Deactivate"],
  inactive: ["activate", "Activate"],
};

export default function CashierManagement() {
  const [cashiers, setCashiers] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getCashiers()
      .then((rows) => { if (!cancelled) setCashiers(rows); })
      .catch(() => { if (!cancelled) setError("Could not load cashier accounts."); });
    return () => { cancelled = true; };
  }, [refresh]);

  async function update(cashier, action) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (action === "delete") {
        await deleteCashier(cashier.id);
        setCashiers((rows) => rows.filter((row) => row.id !== cashier.id));
        setMessage("Cashier account deleted. Its slot is now available.");
      } else {
        const updated = await changeCashierStatus(cashier.id, action);
        setCashiers((rows) => rows.map((row) => row.id === updated.id ? updated : row));
        setMessage(action === "approve" ? "Cashier approved." : `Cashier is now ${updated.status}.`);
      }
      setConfirming(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel account-panel" aria-label="Cashier accounts">
      <div className="account-panel-header">
        <div>
          <h2>Cashier accounts</h2>
          <p>Review requests and manage sign-in access.</p>
        </div>
        {cashiers && <span className="account-capacity">{cashiers.length} of 2 slots used</span>}
      </div>
      {error && (
        <div className="account-feedback">
          <p className="login-error" role="alert">{error}</p>
          <button className="outline-btn" disabled={busy} onClick={() => {
            setError("");
            setConfirming(null);
            setRefresh((value) => value + 1);
          }}>Refresh accounts</button>
        </div>
      )}
      {message && <p className="account-message" role="status">{message}</p>}
      {!cashiers && !error && <p role="status">Loading cashier accounts…</p>}
      {cashiers?.length === 0 && (
        <p className="account-empty">No cashier accounts yet. Cashiers can request access from the sign-in page.</p>
      )}
      {cashiers?.map((cashier) => (
        <div className="cashier-row" key={cashier.id}>
          <div className="cashier-identity">
            <strong>{cashier.email}</strong>
            <span className={`cashier-status ${cashier.status}`}>{cashier.status}</span>
          </div>
          {confirming === cashier.id ? (
            <div className="cashier-actions">
              <p>Delete this account and free its slot?</p>
              <button className="outline-btn" disabled={busy} onClick={() => setConfirming(null)}>Cancel</button>
              <button className="danger-btn" disabled={busy} onClick={() => update(cashier, "delete")}>Confirm delete</button>
            </div>
          ) : (
            <div className="cashier-actions">
              <button className={cashier.status === "pending" ? "primary-btn" : "outline-btn"} disabled={busy}
                onClick={() => update(cashier, nextAction[cashier.status][0])}>
                {nextAction[cashier.status][1]}
              </button>
              <button className="danger-btn" disabled={busy} onClick={() => setConfirming(cashier.id)}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
