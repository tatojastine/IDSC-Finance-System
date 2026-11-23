# Faculty payroll

## Run a payroll period

1. Sign in as the owner and open **Faculty Payroll**. Create a draft using the exact period identifier on the approved workload, for example `2026-11`.
2. Review imported Faculty workloads under **Partner Records**. Once reviewed, they are available in the draft with the same period. If an approved workload arrived outside the Faculty API, use **Import approved workload** and retain its approval reference.
3. Add one line for each faculty member. Select the reviewed workload. The system uses the approved Personnel rate when there is a matching employee and period. Otherwise, enter the approved hourly rate, faculty name, and approval reference. Record any separately approved additions or deductions with their reasons.
4. Check the totals. Edit or remove draft lines as needed. **Finalize run** locks the lines and releases totals and payment allocations to the authorized partner endpoints. Open a faculty member’s **View payslip** to review or print it.
5. Once the external payment batch completes, record its settlement reference. The owner can do this in the app, or the Disbursement system can acknowledge it through the API. Finance checks the batch amount against the finalized net total and stores the settlement reference and actor.

## Calculation and scope

| Field | Rule |
|---|---|
| Base pay | Approved hours multiplied by the hourly rate, rounded to the nearest centavo with half rounded up |
| Gross pay | Base pay plus approved additions |
| Net pay | Gross pay minus approved deductions |
| Approval | Finance keeps the workload reference, compensation approval reference, source, and draft/finalization actors |
| Access | Only the owner can open payroll screens or inspect payroll lines and payslips |
| Adjustments | Additions and deductions are entered as approved amounts. Each nonzero adjustment requires a reason, and deductions cannot exceed gross pay. |

For example, **12.50 hours × ₱500.00** produces **₱6,250.00** base pay. A ₱250.00 addition and a ₱100.00 deduction produce **₱6,400.00** net pay. This school-project workflow calculates hourly compensation. The school supplies approved tax, withholding, and other deduction amounts. Disbursement happens outside Finance. The settlement action records evidence of a completed batch.

There is one run per period and one line per employee in that run. Workload, rate, and adjustments are stored on the finalized line. Updates to draft amounts use a revision check. A finalized or settled run is locked. Any post-finalization correction requires an agreed school adjustment procedure.

## Integration ownership

All integration routes are relative to `/api/v1`. Each system uses its own server-side bearer token.

| System | Owns and exchanges | Access to payroll |
|---|---|---|
| **Faculty** | Approved teaching hours and stable workload references | `POST /integrations/faculty/workloads` and `GET /integrations/faculty/workloads/:reference` report the workload’s review status. |
| **Personnel / HR** | Stable employee references, names for payslips, and institution-approved hourly rates | `POST /integrations/personnel/payroll-rates` records the rate for one employee and period. |
| **Disbursement / Treasury** | Processing payment through the school’s approved channel and confirming batch settlement | `GET /integrations/disbursement/payroll-runs` lists released runs. `GET /integrations/disbursement/payroll-runs/:id` includes employee references and net amounts. `POST /integrations/disbursement/payroll-runs/:id/settlement` records the completed batch. |
| **Accounting** | Posting the payroll liability and reconciling settlement | `GET /integrations/accounting/payroll-runs` and `GET /integrations/accounting/payroll-runs/:id` return released aggregate amounts and settlement status. |

The Faculty workload and the Personnel rate must use the same employee reference and pay period. Identical Personnel submissions replay safely. The API rejects a changed submission using an occupied reference or an existing employee-period rate. Disbursement and Accounting endpoints only release finalized or settled runs. Disbursement receives net allocations by employee reference. Accounting receives run-level totals. Bank details stay with the system that actually pays.

## Example payloads

Faculty approved workload sent to `POST /integrations/faculty/workloads`

```json
{
  "externalId": "FAC-DEMO-01",
  "employeeRef": "EMP-DEMO-01",
  "period": "2026-11",
  "approvedHoursHundredths": 1250
}
```

Personnel hourly rate sent to `POST /integrations/personnel/payroll-rates`

```json
{
  "externalId": "HR-DEMO-01",
  "employeeRef": "EMP-DEMO-01",
  "displayName": "Fictional Faculty Member",
  "period": "2026-11",
  "hourlyRateMinor": 50000,
  "approvalRef": "RATE-APPROVAL-01"
}
```

Disbursement confirmation sent to `POST /integrations/disbursement/payroll-runs/:id/settlement`

```json
{
  "reference": "BATCH-DEMO-01",
  "amountMinor": 640000
}
```

In the example `640000` means ₱6,400.00. An identical settlement acknowledgment is safe to retry. The backend rejects a settlement for a draft, a mismatched amount, or a reference already used on another batch.

## Connect a local sandbox

Use the existing Faculty sandbox token. From the repository root, create separate Personnel, Disbursement, and Accounting tokens for a fresh local installation:

```powershell
node backend/scripts/create-integration-tokens.js 'C:\path\outside\repo\private-payroll-tokens.txt' --payroll
```

Restart the Finance backend after creating tokens. Only token hashes go into ignored `backend/.env`. Give each approved maintainer only their system’s token. This local setup accepts connections on loopback. Live integration still depends on confirmed partner API contracts, agreed employee and period identifiers, and secure test access.

See [local Swagger](http://localhost:5000/docs/) for the owner’s payroll endpoints and partner contracts. The backend tests exercise owner/cashier authorization, reviewed workload import, Personnel rate precedence, concurrent edits, rounding, finalization and settlement replay with fictional records.
