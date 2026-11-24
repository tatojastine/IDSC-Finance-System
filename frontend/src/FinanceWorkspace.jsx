import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "./Api.js";

import { DataForm, Field, PesosField, ResourceNotice } from "./FinanceForms.jsx";
import { dateTime, manilaDay, money, toCentavos, useResource } from "./financeUi.js";

const installmentLabels = { prelim: "Prelim", midterm: "Midterm", "pre-finals": "Pre-finals", finals: "Finals" };

function dueStatus(dueDate, today) {
  if (dueDate < today) return "Overdue";
  return dueDate === today ? "Due today" : "Upcoming";
}

function EnrollmentForm({ cancel, complete }) {
  return (
    <DataForm title="Add an enrollment" submitLabel="Save enrollment" onCancel={cancel}
      onSubmit={async (data) => complete(await api.addEnrollment(data))}>
      <Field label="Student ID" name="studentId" maxLength={80} />
      <Field label="Student name" name="name" maxLength={140} />
      <Field label="Program" name="program" maxLength={120} />
      <Field label="Academic term" name="term" maxLength={80} />
    </DataForm>
  );
}

function ChargeForm({ enrollment, cancel, complete }) {
  const [installment, setInstallment] = useState("");
  return (
    <DataForm title={`Add a charge for ${enrollment.name}`} submitLabel="Save charge" onCancel={cancel}
      onSubmit={async ({ amount, tuitionInstallment, dueDate, ...fields }) => {
        await api.addCharge({
          ...fields, enrollmentId: enrollment._id, amountMinor: toCentavos(amount),
          ...(tuitionInstallment && { tuitionInstallment, dueDate })
        });
        complete();
      }}>
      <Field label="Description" name="label" maxLength={140} />
      <Field label="Assessment reference" name="reference" maxLength={80} />
      <PesosField />
      <label>Tuition installment
        <select name="tuitionInstallment" value={installment} onChange={(event) => setInstallment(event.target.value)}>
          <option value="">General charge</option>
          {Object.entries(installmentLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {installment && <Field label="Due date" name="dueDate" type="date" />}
    </DataForm>
  );
}

function PaymentForm({ charge, cancel, complete }) {
  const request = useRef(null);
  const [method, setMethod] = useState("Cash");
  return (
    <DataForm title={`Record payment for ${charge.label}`} submitLabel="Post payment" onCancel={cancel}
      onSubmit={async ({ amount, reference }) => {
        request.current ??= crypto.randomUUID();
        const payment = await api.postPayment({
          chargeId: charge.id, amountMinor: toCentavos(amount), method, reference, requestId: request.current
        });
        complete(payment);
      }}>
      <p>Outstanding on this charge is {money(charge.outstandingMinor)}.</p>
      <PesosField />
      <label>Method
        <select value={method} onChange={(event) => setMethod(event.target.value)}>
          {["Cash", "Bank Transfer", "Online Payment", "Other"].map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      <Field label="Payment reference" name="reference" maxLength={120} required={method !== "Cash"} />
    </DataForm>
  );
}

function Receipt({ id, close }) {
  const load = useCallback(() => api.getReceipt(id), [id]);
  const receipt = useResource(load);
  const card = useRef(null);
  useEffect(() => {
    if (receipt.data) card.current.scrollIntoView({ block: "nearest" });
  }, [receipt.data]);
  if (!receipt.data) return <ResourceNotice resource={receipt} />;
  const payment = receipt.data;
  return (
    <section ref={card} className="panel finance-receipt" aria-label="Payment receipt">
      <div className="receipt-body">
        <p className="eyebrow">IDSC Finance</p>
        <h2>Payment receipt</h2>
        <p className="finance-reference">{payment.receiptNumber}</p>
        <p className={`cashier-status ${payment.status === "posted" ? "active" : "pending"}`}>{payment.status}</p>
        <dl>
          <dt>Student</dt><dd>{payment.studentName} · {payment.studentId}</dd>
          <dt>Academic term</dt><dd>{payment.term}</dd>
          <dt>Charge</dt><dd>{payment.charge}</dd>
          <dt>Collected</dt><dd>{money(payment.amountMinor)} · {payment.method}</dd>
          <dt>Recorded by</dt><dd>{payment.postedBy}</dd>
          <dt>Posted</dt><dd>{dateTime(payment.postedAt)}</dd>
          <dt>Charge balance after posting</dt><dd>{money(payment.balanceAfterMinor)}</dd>
          {payment.reference && <><dt>Reference</dt><dd>{payment.reference}</dd></>}
        </dl>
        {payment.status === "reversed" && <p>This payment has been reversed.</p>}
        <small>Internal school payment record</small>
      </div>
      <div className="finance-actions receipt-actions">
        <button className="primary-btn" onClick={() => window.print()}>Print receipt</button>
        <button className="outline-btn" onClick={close}>Close receipt</button>
      </div>
    </section>
  );
}

function ChargeCard({ charge, showForm, showReceipt, paymentButtonRef }) {
  return (
    <section className="finance-charge">
      <div className="finance-row">
        <div><h3>{charge.label}</h3><p>{charge.source} · {charge.reference}</p></div>
        <div><strong>{money(charge.outstandingMinor)} outstanding</strong><p>{money(charge.amountMinor)} assessed</p></div>
        {charge.outstandingMinor > 0 && <button ref={paymentButtonRef} className="primary-btn" onClick={() => showForm({ kind: "payment", charge })}>Record payment</button>}
      </div>
      {charge.dueDate && (
        <p>{installmentLabels[charge.tuitionInstallment]} · Due {charge.dueDate} · {
          charge.outstandingMinor > 0 ? dueStatus(charge.dueDate, manilaDay.format(new Date())) : "Paid"
        }</p>
      )}
      {charge.payments.length > 0 && (
        <ul className="finance-history">
          {charge.payments.slice().reverse().map((payment) => {
            const pending = payment.reversals.some((row) => row.status === "pending");
            return (
              <li key={payment._id}>
                <div>
                  <b>{money(payment.amountMinor)} · {payment.method}</b>
                  <p>{dateTime(payment.postedAt)} · {payment.postedBy}</p>
                  {(pending || payment.status === "reversed") && <span className="cashier-status pending">{pending ? "Reversal pending" : "Reversed"}</span>}
                  {payment.reversals.length > 0 && (
                    <details className="finance-reversal-history">
                      <summary>Reversal history</summary>
                      {payment.reversals.map((row, index) => <p key={index}>
                        {row.status} · {row.reason}{row.decidedBy ? ` · Reviewed by ${row.decidedBy}` : ""}
                        {row.decisionNote ? ` · ${row.decisionNote}` : ""}
                      </p>)}
                    </details>
                  )}
                </div>
                <div className="finance-actions">
                  <button className="outline-btn" onClick={() => showReceipt(payment._id)}>View receipt</button>
                  {!pending && payment.status !== "reversed" &&
                    <button className="outline-btn" onClick={() => showForm({ kind: "reversal", payment })}>Request reversal</button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function EnrollmentWorkspace({ owner, paymentView, initialEnrollment, onOpenAccount }) {
  const [search, setSearch] = useState(initialEnrollment?.studentId ?? "");
  const [query, setQuery] = useState({ search: initialEnrollment?.studentId ?? "", page: 1 });
  const [selection, setSelection] = useState({ id: initialEnrollment?._id ?? "", jumpToPayment: Boolean(initialEnrollment) });
  const selected = selection.id;
  const [form, setForm] = useState(null);
  const [receiptId, setReceiptId] = useState("");
  const [notice, setNotice] = useState("");
  const manageEnrollments = owner && !paymentView;
  const showResults = !paymentView || (query.search !== "" && !selected);
  const loadList = useCallback(() => showResults
    ? api.searchEnrollments(query.search, query.page)
    : Promise.resolve(null), [query, showResults]);
  const loadAccount = useCallback(() => selected ? api.getEnrollment(selected) : Promise.resolve(null), [selected]);
  const list = useResource(loadList);
  const account = useResource(loadAccount);
  const searchInput = useRef(null);
  const accountHeading = useRef(null);
  const paymentButton = useRef(null);
  const lastScrolledSelection = useRef(null);
  const firstPayable = account.data?.charges.find((charge) => charge.outstandingMinor > 0);
  const closeForm = () => setForm(null);

  useEffect(() => {
    if (!selection.jumpToPayment || !account.data || lastScrolledSelection.current === selection) return;
    const target = paymentButton.current ?? accountHeading.current;
    if (!target) return;

    lastScrolledSelection.current = selection;
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      block: "center",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"
    });
  }, [selection, account.data]);

  function open(id, jumpToPayment = false) {
    setSelection({ id, jumpToPayment });
    setForm(null);
    setReceiptId("");
    setNotice("");
  }

  function completed(message) {
    closeForm();
    setNotice(message);
    account.refresh();
  }

  return (
    <section className="finance-stack">
      <div className="panel finance-panel">
        <div className="finance-row">
          <div>
            <h2>{paymentView ? "Collect a payment" : "Student financial accounts"}</h2>
            <p>Search by student ID, name, or academic term.</p>
          </div>
          {manageEnrollments && <button className="primary-btn" onClick={() => setForm({ kind: "enrollment" })}>Add enrollment</button>}
          {paymentView && selected && <button className="outline-btn" onClick={() => {
            open("");
            searchInput.current?.focus();
          }}>Change student</button>}
        </div>
        <form className="finance-actions finance-search" onSubmit={(event) => {
          event.preventDefault();
          const term = search.trim();
          if (paymentView && !term) return;
          if (paymentView) open("");
          setQuery({ search: term, page: 1 });
        }}>
          <label className="sr-only" htmlFor="finance-search">{paymentView ? "Find student for payment" : "Search enrollments"}</label>
          <input ref={searchInput} id="finance-search" value={search} onChange={(event) => setSearch(event.target.value)}
            placeholder={paymentView ? "Student ID, name, or term" : undefined} maxLength={100} />
          <button className={paymentView ? "primary-btn" : "outline-btn"} disabled={paymentView && !search.trim()}>
            {paymentView ? "Find student" : "Search"}
          </button>
        </form>
        {showResults && (!list.data ? <ResourceNotice resource={list} /> : list.data.rows.length === 0 ? (
          <p>No enrollments found.</p>
        ) : (
          <ul className="finance-list">
            {list.data.rows.map((row) => <li key={row._id}>
              <div><strong>{row.name}</strong><p>{row.studentId} · {row.term} · {row.program}</p></div>
              <div className="finance-actions">
                {manageEnrollments && <button className="outline-btn" onClick={() => {
                  setNotice("");
                  setForm({ kind: "charge", enrollment: row });
                }}>Add charge</button>}
                {paymentView ? (
                  <button className="outline-btn" onClick={() => open(row._id, true)}>View charges</button>
                ) : (
                  <button className="outline-btn" onClick={() => onOpenAccount(row)}>Open account</button>
                )}
              </div>
            </li>)}
          </ul>
        ))}
        {showResults && (query.page > 1 || list.data?.hasMore) && (
          <div className="finance-actions">
            <button className="outline-btn" disabled={query.page === 1} onClick={() => setQuery({ ...query, page: query.page - 1 })}>Previous</button>
            <span>Page {query.page}</span>
            <button className="outline-btn" disabled={!list.data?.hasMore} onClick={() => setQuery({ ...query, page: query.page + 1 })}>Next</button>
          </div>
        )}
      </div>

      {notice && <p className="account-message" role="status">{notice}</p>}
      {form?.kind === "enrollment" && <EnrollmentForm cancel={closeForm} complete={(row) => {
        closeForm();
        setSearch(row.studentId);
        setQuery({ search: row.studentId, page: 1 });
        setNotice("Enrollment saved.");
      }} />}
      {form?.kind === "charge" && <ChargeForm enrollment={form.enrollment} cancel={closeForm} complete={() => {
        closeForm();
        setNotice("Charge saved.");
      }} />}
      {form?.kind === "payment" && <PaymentForm key={form.charge.id} charge={form.charge} cancel={closeForm} complete={(payment) => {
        setReceiptId(payment._id);
        completed("Payment saved. The receipt is ready to print.");
      }} />}
      {form?.kind === "reversal" && <DataForm title="Request a payment reversal" submitLabel="Send to owner" onCancel={closeForm}
        onSubmit={async ({ reason }) => {
          await api.requestReversal(form.payment._id, reason);
          completed("Reversal sent to the owner for approval.");
        }}>
        <Field label="Reason" name="reason" maxLength={300} />
      </DataForm>}

      {receiptId && <Receipt id={receiptId} close={() => setReceiptId("")} />}
      {selected && (!account.data ? <ResourceNotice resource={account} /> : (
        <article className="panel finance-panel">
          <div className="finance-row">
            <div><h2 ref={accountHeading} tabIndex={-1}>{account.data.enrollment.name}</h2><p>{account.data.enrollment.studentId} · {account.data.enrollment.term}</p></div>
          </div>
          <div className="finance-totals">
            <div><span>Outstanding balance</span><strong>{money(account.data.outstandingMinor)}</strong></div>
            <div><span>Total assessed</span><strong>{money(account.data.totalMinor)}</strong></div>
          </div>
          {account.data.charges.length === 0 && <p>No charges for this term.</p>}
          {account.data.charges.map((charge) => <ChargeCard key={charge.id} charge={charge}
            paymentButtonRef={charge.id === firstPayable?.id ? paymentButton : undefined} showForm={(nextForm) => {
            setForm(nextForm);
            setReceiptId("");
          }} showReceipt={setReceiptId} />)}
        </article>
      ))}
    </section>
  );
}

function saveDailyReport(blob, date) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `IDSC-collections-${date}.csv`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function TuitionBalances() {
  const [filter, setFilter] = useState({ status: "overdue", page: 1 });
  const load = useCallback(() => api.getTuitionBalances(filter.status, filter.page), [filter]);
  const report = useResource(load);
  const data = report.data;
  return (
    <section className="panel finance-panel">
      <div className="finance-row">
        <h2>Tuition balances</h2>
        <div className="finance-actions">
          <label>Show installments
            <select value={filter.status} onChange={(event) => setFilter({ status: event.target.value, page: 1 })}>
              <option value="overdue">Overdue only</option>
              <option value="outstanding">All outstanding</option>
            </select>
          </label>
        </div>
      </div>
      {!data ? <ResourceNotice resource={report} /> : (
        <>
          <p>As of {data.today} · Asia/Manila</p>
          {data.rows.length === 0 ? <p>No {filter.status} tuition installments on this page.</p> : (
            <div className="finance-table-wrap">
              <table className="finance-table">
                <thead><tr><th>Student</th><th>Term</th><th>Installment</th><th>Due date</th><th>Outstanding</th><th>Status</th></tr></thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.chargeId}>
                      <td><strong>{row.studentName}</strong><p>{row.studentId}</p></td>
                      <td>{row.term}</td><td>{installmentLabels[row.tuitionInstallment]}</td>
                      <td>{row.dueDate}</td><td>{money(row.outstandingMinor)}</td>
                      <td>{dueStatus(row.dueDate, data.today)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {(filter.page > 1 || data.hasMore) && (
            <div className="finance-actions">
              <button className="outline-btn" disabled={filter.page === 1} onClick={() => setFilter({ ...filter, page: filter.page - 1 })}>Previous</button>
              <span>Page {filter.page}</span>
              <button className="outline-btn" disabled={!data.hasMore} onClick={() => setFilter({ ...filter, page: filter.page + 1 })}>Next</button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export function DailyCollections({ owner, compact = false, navigate }) {
  const [date, setDate] = useState(() => manilaDay.format(new Date()));
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const load = useCallback(() => date ? api.getDailyReport(date) : Promise.resolve(null), [date]);
  const report = useResource(load);
  const data = report.data;

  async function exportDaily() {
    setExporting(true);
    setExportError("");
    try {
      saveDailyReport(await api.downloadDailyReport(date), date);
    } catch (error) {
      setExportError(error.message);
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="finance-stack">
      {compact && (
        <div className="panel finance-panel finance-row">
          <div><h2>Student collections</h2><p>Open a student’s account to view charges, post a payment, or reprint a receipt.</p></div>
          <button className="primary-btn" onClick={() => navigate("Payments")}>Find a student</button>
        </div>
      )}
      <div className="panel finance-panel">
        <div className="finance-row">
          <div>
            <h2>{compact ? "Today’s collections" : "Daily collections"}</h2>
            <p>{owner ? "All cashiers" : "Your collections"} · Asia/Manila business date</p>
          </div>
          {compact ? <button className="outline-btn" onClick={() => navigate("Reports")}>View daily report</button> : (
            <div className="finance-actions">
              <label>Business date<input type="date" value={date} onChange={(event) => { setDate(event.target.value); setExportError(""); }} /></label>
              <button className="outline-btn" disabled={!data || exporting} onClick={exportDaily}>{exporting ? "Downloading…" : "Download CSV"}</button>
            </div>
          )}
        </div>
        {exportError && <p className="login-error" role="alert">{exportError}</p>}
        {!date ? <p>Choose a business date.</p> : !data ? <ResourceNotice resource={report} /> : (
          <>
            <div className="finance-totals">
              <div><span>Collected</span><strong>{money(data.totals.collectedMinor)}</strong></div>
              <div><span>Reversed</span><strong>{money(data.totals.reversedMinor)}</strong></div>
              <div><span>Net collections</span><strong>{money(data.totals.netMinor)}</strong></div>
            </div>
            {!compact && (data.groups.length === 0 ? <p>No payments or reversals for this date.</p> : (
              <div className="finance-table-wrap">
                <table className="finance-table">
                  <thead><tr><th>Cashier</th><th>Method</th><th>Collected</th><th>Reversed</th><th>Net</th></tr></thead>
                  <tbody>{data.groups.map((row) => (
                    <tr key={JSON.stringify([row.postedBy, row.method])}>
                      <td>{row.postedBy}</td><td>{row.method}</td><td>{money(row.collectedMinor)}</td>
                      <td>{money(row.reversedMinor)}</td><td>{money(row.netMinor)}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            ))}
          </>
        )}
      </div>
      {!compact && !!data?.rows.length && (
        <div className="panel finance-panel">
          <h3>Payments and approved reversals</h3>
          <ul className="finance-list">
            {data.rows.map((row) => <li key={`${row.paymentId}:${row.type}`}>
              <div><strong>{row.type === "collection" ? "Payment" : "Reversal"} · {money(row.amountMinor)} · {row.method}</strong>
                {row.studentName && <p>{[row.studentName, row.studentId, row.term, row.charge].filter(Boolean).join(" · ")}</p>}
                <p className="finance-reference">{row.receiptNumber} · {dateTime(row.at)} · {row.postedBy}</p></div>
              {row.decidedBy && <div><p>Approved by {row.decidedBy}</p>{row.reason && <p>{row.reason}</p>}</div>}
            </li>)}
          </ul>
        </div>
      )}
      {!compact && owner && <TuitionBalances />}
    </section>
  );
}

export function ReversalQueue() {
  const queue = useResource(api.getReversals);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  return (
    <section className="finance-stack">
      <div className="panel finance-panel">
        <h2>Pending reversals</h2>
        <p>Review each request before changing a balance.</p>
        {!queue.data ? <ResourceNotice resource={queue} /> : queue.data.length === 0 ? <p>No pending reversals.</p> : (
          <ul className="finance-list">{queue.data.map((row) => (
            <li key={row.paymentId}>
              <div><b>{row.enrollment.name} · {row.charge} · {money(row.amountMinor)}</b>
                <p>{row.reason}</p><p>Requested by {row.requestedBy} · {dateTime(row.requestedAt)}</p></div>
              <button className="outline-btn" onClick={() => setSelected(row)}>Review</button>
            </li>
          ))}</ul>
        )}
      </div>
      {notice && <p className="account-message" role="status">{notice}</p>}
      {selected && <DataForm key={selected.paymentId} title={`Review reversal for ${selected.enrollment.name}`}
        submitLabel="Save decision" onCancel={() => setSelected(null)} onSubmit={async ({ status, note }) => {
          await api.reviewReversal(selected.paymentId, status, note);
          setNotice(status === "approved" ? "Reversal approved. The charge balance has reopened." : "Reversal rejected.");
          setSelected(null);
          queue.refresh();
        }}>
        <label>Decision<select name="status"><option value="approved">Approve</option><option value="rejected">Reject</option></select></label>
        <Field label="Decision note (required when rejecting)" name="note" maxLength={300} required={false} />
      </DataForm>}
    </section>
  );
}

const partnerActions = {
  inventory: { submitted: [["approve", "Approve"], ["reject", "Reject"]], approved: [["settle", "Mark settled"]] },
  faculty: { submitted: [["review", "Mark reviewed"]] }
};

export function PartnerInbox() {
  const inbox = useResource(api.getPartnerItems);
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState("");
  return (
    <section className="finance-stack">
      <div className="panel finance-panel">
        <h2>Partner submissions</h2>
        <p>Review the latest Inventory payables and approved Faculty workload snapshots.</p>
        {!inbox.data ? <ResourceNotice resource={inbox} /> : inbox.data.length === 0 ? <p>No partner submissions yet.</p> : (
          <ul className="finance-list">{inbox.data.map((item) => (
            <li key={item._id}>
              <div>
                <b>{item.partner === "inventory" ? "Inventory payable" : "Faculty workload"} · {item.externalId}</b>
                <p>{item.partner === "inventory"
                  ? `${money(item.details.amountMinor)} · Order ${item.details.approvedOrderRef} · Received ${item.details.receivingRef}`
                  : `${item.details.employeeRef} · ${item.details.period} · ${item.details.approvedHoursHundredths / 100} hours`}</p>
                <span className="cashier-status">{item.status}</span>
                {item.partner === "inventory" && (
                  <details className="finance-reversal-history"><summary>Received items · {item.details.vendorRef}</summary>
                    {item.details.items.map((row, index) => <p key={index}>{row.itemRef} · {row.quantity} × {money(row.unitCostMinor)}</p>)}
                  </details>
                )}
                {item.decisions.length > 0 && (
                  <details className="finance-reversal-history"><summary>Review history</summary>
                    {item.decisions.map((row, index) => <p key={index}>{row.status} · {row.actor} · {dateTime(row.at)}{row.reference ? ` · ${row.reference}` : ""}</p>)}
                  </details>
                )}
              </div>
              <div className="finance-actions">
                {partnerActions[item.partner]?.[item.status]?.map(([action, label]) => (
                  <button key={action} className="outline-btn" onClick={() => setSelected({ item, action, label })}>{label}</button>
                ))}
              </div>
            </li>
          ))}</ul>
        )}
      </div>
      {notice && <p className="account-message" role="status">{notice}</p>}
      {selected && <DataForm key={`${selected.item._id}:${selected.action}`}
        title={`${selected.label} · ${selected.item.externalId}`} submitLabel={selected.label}
        onCancel={() => setSelected(null)} onSubmit={async ({ reference }) => {
          const item = await api.updatePartnerItem(selected.item._id, selected.action, reference);
          setNotice(`Submission marked ${item.status}.`);
          setSelected(null);
          inbox.refresh();
        }}>
        <Field label={selected.action === "settle" ? "Disbursement reference" : "Review note"} name="reference"
          maxLength={200} required={["settle", "reject"].includes(selected.action)} />
      </DataForm>}
    </section>
  );
}
