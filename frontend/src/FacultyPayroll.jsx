import { useCallback, useEffect, useRef, useState } from "react";
import * as api from "./Api.js";
import { DataForm, Field, ResourceNotice } from "./FinanceForms.jsx";
import { dateTime, money, toCentavos, useResource } from "./financeUi.js";

const hours = (value) => (value / 100).toFixed(2);
const valueInPesos = (value) => value === undefined ? "" : (value / 100).toFixed(2);

function DraftLineForm({ run, workloads, editing, onCancel, onSaved }) {
  const [workloadId, setWorkload] = useState(editing?.workloadId ?? "");
  const selectable = workloads.filter((row) => editing
    ? row.employeeRef === editing.employeeRef
    : !run.lines.some((line) => line.employeeRef === row.employeeRef));
  const selected = selectable.find((row) => row.id === workloadId);
  const rate = selected?.personnelRate;
  return (
    <DataForm title={editing ? "Edit faculty payroll line" : "Add faculty payroll line"}
      submitLabel="Save payroll line" onCancel={onCancel} onSubmit={async (data) => {
        if (!selected) throw new Error("Choose a reviewed faculty workload.");
        const body = {
          workloadId, revision: run.revision, lineId: editing?._id,
          additionsMinor: toCentavos(data.additions || "0", "Additions"),
          additionNote: data.additionNote,
          deductionsMinor: toCentavos(data.deductions || "0", "Deductions"),
          deductionNote: data.deductionNote
        };
        if (!rate) Object.assign(body, {
          displayName: data.displayName, hourlyRateMinor: toCentavos(data.hourlyRate, "Hourly rate"),
          rateApprovalRef: data.rateApproval
        });
        await api.savePayrollLine(run.id, body);
        onSaved("Payroll line saved.");
      }}>
      <label>Reviewed workload
        <select value={workloadId} onChange={(event) => setWorkload(event.target.value)} required>
          <option value="">Choose a reviewed workload</option>
          {selectable.map((row) => <option key={row.id} value={row.id}>
            {row.employeeRef} · {hours(row.approvedHoursHundredths)} hours · {row.reference}
          </option>)}
        </select>
      </label>
      {selected && (rate
        ? <p>{rate.displayName} · {money(rate.hourlyRateMinor)} per hour · Personnel approval {rate.approvalRef}</p>
        : <div className="finance-fields" key={workloadId}>
          <Field label="Faculty name" name="displayName" maxLength={140} defaultValue={editing?.displayName} />
          <Field label="Approved hourly rate (PHP)" name="hourlyRate" inputMode="decimal" maxLength={11}
            defaultValue={valueInPesos(editing?.hourlyRateMinor)} />
          <Field label="Rate approval reference" name="rateApproval" defaultValue={editing?.rateApprovalRef} maxLength={80} />
        </div>
      )}
      <Field label="Approved additions (PHP)" name="additions" inputMode="decimal" maxLength={11}
        required={false} defaultValue={valueInPesos(editing?.additionsMinor)} />
      <Field label="Addition reason, if any" name="additionNote" required={false} maxLength={200} defaultValue={editing?.additionNote} />
      <Field label="Approved deductions (PHP)" name="deductions" inputMode="decimal" maxLength={11}
        required={false} defaultValue={valueInPesos(editing?.deductionsMinor)} />
      <Field label="Deduction reason, if any" name="deductionNote" required={false} maxLength={200} defaultValue={editing?.deductionNote} />
    </DataForm>
  );
}

function Payslip({ run, line, close }) {
  const card = useRef(null);
  useEffect(() => { card.current.scrollIntoView({ block: "nearest" }); }, []);
  return (
    <section ref={card} className="panel finance-receipt" aria-label="Faculty payslip">
      <div className="receipt-body">
        <p className="eyebrow">IDSC Finance</p>
        <h2>Faculty payslip</h2>
        <p><strong>{line.displayName}</strong> · {line.employeeRef}</p>
        <p className="cashier-status">{run.status}</p>
        <dl>
          <dt>Payroll period</dt><dd>{run.period}</dd>
          <dt>Approved workload</dt><dd>{hours(line.hoursHundredths)} hours · {line.workloadRef}</dd>
          <dt>Approved rate</dt><dd>{money(line.hourlyRateMinor)} per hour · {line.rateApprovalRef}</dd>
          <dt>Base pay</dt><dd>{money(line.baseMinor)}</dd>
          <dt>Additions</dt><dd>{money(line.additionsMinor)}{line.additionNote && ` · ${line.additionNote}`}</dd>
          <dt>Gross pay</dt><dd>{money(line.grossMinor)}</dd>
          <dt>Deductions</dt><dd>{money(line.deductionsMinor)}{line.deductionNote && ` · ${line.deductionNote}`}</dd>
          <dt>Net pay</dt><dd><strong>{money(line.netMinor)}</strong></dd>
          {run.settlement && <><dt>Settlement reference</dt><dd>{run.settlement.reference}</dd></>}
        </dl>
      </div>
      <div className="finance-actions receipt-actions">
        <button className="primary-btn" onClick={() => window.print()}>Print payslip</button>
        <button className="outline-btn" onClick={close}>Close payslip</button>
      </div>
    </section>
  );
}

function PayrollRunPanel({ run, edit, viewSlip, refresh }) {
  const draft = run.status === "draft";
  return (
    <section className="panel finance-panel">
      <div className="finance-row">
        <div><h2>{run.period}</h2><span className="cashier-status">{run.status}</span></div>
        <div className="finance-actions">
          <button className="outline-btn" onClick={refresh}>Refresh run</button>
          {draft && <button className="outline-btn" onClick={() => edit({ kind: "workload" })}>Import approved workload</button>}
          {draft && <button className="primary-btn" onClick={() => edit({ kind: "line" })}>Add payroll line</button>}
          {draft && run.lines.length > 0 && <button className="outline-btn" onClick={() => edit({ kind: "finalize" })}>Finalize run</button>}
          {run.status === "finalized" && <button className="primary-btn" onClick={() => edit({ kind: "settle" })}>Record settlement</button>}
        </div>
      </div>
      {run.finalizedAt && <p>Finalized by {run.finalizedBy} · {dateTime(run.finalizedAt)}</p>}
      {run.settlement && <p>Settlement {run.settlement.reference} · {dateTime(run.settlement.recordedAt)} · {run.settledBy}</p>}
      <div className="finance-totals">
        <div><span>Faculty</span><strong>{run.totals.facultyCount}</strong></div>
        <div><span>Gross pay</span><strong>{money(run.totals.grossMinor)}</strong></div>
        <div><span>Deductions</span><strong>{money(run.totals.deductionsMinor)}</strong></div>
        <div><span>Net pay</span><strong>{money(run.totals.netMinor)}</strong></div>
      </div>
      {run.lines.length === 0 ? <p>No faculty payroll lines yet.</p> : (
        <div className="finance-table-wrap">
          <table className="finance-table">
            <thead><tr><th>Faculty</th><th>Hours</th><th>Gross</th><th>Deductions</th><th>Net</th><th>Actions</th></tr></thead>
            <tbody>{run.lines.map((line) => (
              <tr key={line._id}>
                <td><strong>{line.displayName}</strong><p>{line.employeeRef}</p></td>
                <td>{hours(line.hoursHundredths)}</td><td>{money(line.grossMinor)}</td>
                <td>{money(line.deductionsMinor)}</td><td>{money(line.netMinor)}</td>
                <td><div className="finance-actions">{draft ? (
                  <>
                    <button className="outline-btn" onClick={() => edit({ kind: "line", line })}>Edit</button>
                    <button className="outline-btn" onClick={() => edit({ kind: "remove", line })}>Remove</button>
                  </>
                ) : <button className="outline-btn" onClick={() => viewSlip(line)}>View payslip</button>}</div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function FacultyPayroll() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState("");
  const [form, setForm] = useState(null);
  const [payslip, setPayslip] = useState(null);
  const [notice, setNotice] = useState("");
  const loadList = useCallback(() => api.listPayrollRuns(page), [page]);
  const loadRun = useCallback(() => selected ? api.getPayrollRun(selected) : Promise.resolve(null), [selected]);
  const loadWorkloads = useCallback(() => selected ? api.getPayrollWorkloads(selected) : Promise.resolve([]), [selected]);
  const list = useResource(loadList);
  const detail = useResource(loadRun);
  const workloads = useResource(loadWorkloads);
  const run = detail.data;
  const cancel = () => setForm(null);

  function open(id) {
    setSelected(id);
    setForm(null);
    setPayslip(null);
    setNotice("");
  }

  function changeForm(next) {
    setPayslip(null);
    setForm(next);
  }

  function done(message) {
    setForm(null);
    setNotice(message);
    detail.refresh();
    list.refresh();
    workloads.refresh();
  }

  return (
    <div className="finance-stack">
      <section className="panel finance-panel">
        <div className="finance-row">
          <div><h2>Faculty payroll runs</h2><p>Prepare pay from reviewed Faculty workloads for each pay period.</p></div>
          <button className="primary-btn" onClick={() => changeForm({ kind: "create" })}>Create payroll run</button>
        </div>
        {!list.data ? <ResourceNotice resource={list} /> : list.data.rows.length === 0 ? <p>No payroll runs yet.</p> : (
          <ul className="finance-list">
            {list.data.rows.map((row) => (
              <li key={row.id}>
                <div><strong>{row.period}</strong><p>{row.status} · {row.totals.facultyCount} faculty · {money(row.totals.netMinor)} net</p></div>
                <button className="outline-btn" onClick={() => open(row.id)} aria-pressed={selected === row.id}>Open run</button>
              </li>
            ))}
          </ul>
        )}
        {(page > 1 || list.data?.hasMore) && (
          <div className="finance-actions">
            <button className="outline-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span>Page {page}</span>
            <button className="outline-btn" disabled={!list.data?.hasMore} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        )}
      </section>
      {notice && <p className="account-message" role="status">{notice}</p>}
      {form?.kind === "create" && <DataForm title="Create a draft payroll run" submitLabel="Create draft" onCancel={cancel}
        onSubmit={async ({ period }) => {
          const created = await api.createPayrollRun(period);
          open(created.id);
          list.refresh();
          setNotice("Draft payroll run created.");
        }}>
        <p>Use the exact period identifier supplied with the Faculty workloads, such as 2026-11.</p>
        <Field label="Payroll period" name="period" maxLength={80} />
      </DataForm>}
      {run && form?.kind === "workload" && (
        <DataForm title="Import previously approved workload" submitLabel="Import workload" onCancel={cancel}
          onSubmit={async ({ approvedHours, ...fields }) => {
            await api.importPayrollWorkload(run.id, { ...fields, approvedHoursHundredths: toCentavos(approvedHours, "Approved hours") });
            done("Approved workload imported.");
          }}>
          <p>Use this for approved Faculty records received outside the API. Period {run.period} is applied automatically.</p>
          <Field label="Faculty employee reference" name="employeeRef" maxLength={80} />
          <Field label="Workload reference" name="reference" maxLength={80} />
          <Field label="Workload approval reference" name="approvalRef" maxLength={80} />
          <Field label="Approved hours" name="approvedHours" inputMode="decimal" maxLength={7} />
        </DataForm>
      )}
      {run && form?.kind === "line" && (workloads.data ? (
        <DraftLineForm key={form.line?._id ?? "new"} run={run} workloads={workloads.data} editing={form.line}
          onCancel={cancel} onSaved={done} />
      ) : <ResourceNotice resource={workloads} />)}
      {run && form?.kind === "remove" && (
        <DataForm title={`Remove the draft line for ${form.line.displayName}?`} submitLabel="Remove draft line" onCancel={cancel}
          onSubmit={async () => { await api.removePayrollLine(run.id, form.line._id, run.revision); done("Draft line removed."); }}>
          <p>The approved source workload stays available.</p>
        </DataForm>
      )}
      {run && form?.kind === "finalize" && (
        <DataForm title={`Finalize payroll for ${run.period}?`} submitLabel="Confirm finalization" onCancel={cancel}
          onSubmit={async () => { await api.finalizePayroll(run.id, run.revision); done("Payroll finalized. Payslips are available."); }}>
          <p>Review {run.totals.facultyCount} faculty and {money(run.totals.netMinor)} in net pay. Finalization locks all payroll amounts.</p>
        </DataForm>
      )}
      {run && form?.kind === "settle" && (
        <DataForm title="Record a completed payroll settlement" submitLabel="Save settlement record" onCancel={cancel}
          onSubmit={async ({ reference }) => {
            await api.recordPayrollSettlement(run.id, { reference, amountMinor: run.totals.netMinor });
            done("Settlement recorded.");
          }}>
          <p>Use the reference from the completed external disbursement for {money(run.totals.netMinor)}.</p>
          <Field label="External settlement reference" name="reference" maxLength={80} />
        </DataForm>
      )}
      {run && payslip && <Payslip key={payslip._id} run={run} line={payslip} close={() => setPayslip(null)} />}
      {selected && (run
        ? <PayrollRunPanel run={run} edit={changeForm} viewSlip={(line) => { cancel(); setPayslip(line); }}
          refresh={() => { cancel(); detail.refresh(); workloads.refresh(); }} />
        : <ResourceNotice resource={detail} />)}
    </div>
  );
}
