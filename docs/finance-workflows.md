# Finance workflow and partner API contracts

## Classroom demonstration

1. Sign in as the owner. Under **Students**, add a fictional enrollment such as `DEMO-001`, `2026-2027 T1`. Click **Add charge** next to the enrollment and add a ₱10,000 Tuition charge with reference `TUITION-DEMO-01`.
2. From an approved cashier account, click **Open account** on the student's row to go directly to their account in **Payments**. Record ₱4,000 in Cash, then open and print its receipt. Reopen the account after a refresh and confirm that ₱6,000 is outstanding.
3. Open **Reports** and choose the payment’s Philippine business date. The cashier sees their own collections. The owner can see all cashier and system collections, grouped by collector and method. **Download CSV** exports those totals.
4. Request a reversal with a reason. The balance stays the same while the request is pending. The owner approves or rejects it from **Reversals**. Approval reopens the charge balance, preserves the original payment, and reports the reversal on the approval date. The receipt is then marked reversed.

For an electronic payment, enter its payment reference. If the response is interrupted and the form is still open, retry using the same form. A repeated request ID and identical details return the existing receipt. The system rejects an amount greater than the unpaid charge.

The daily report has two authenticated API formats. Call `GET /api/v1/ledger/reports/daily?date=YYYY-MM-DD` for JSON in centavos, or `GET /api/v1/ledger/reports/daily.csv?date=YYYY-MM-DD` for a spreadsheet attachment in pesos. Both use the same Asia/Manila business date, totals, and owner/cashier access rules. Receipts are available as JSON from `GET /api/v1/ledger/payments/:id/receipt`. The web app renders the printable page from those stored details.

The printable Finance receipt records the school-project payment and references its ledger entry. An Inventory settlement records a status and disbursement reference. Faculty pay calculations and external settlement records are covered in the [Faculty Payroll guide](faculty-payroll.md).

## Partner access

Integration routes are under `/api/v1/integrations`. Each partner calls from its server with `Authorization: Bearer <its-own-token>`. Treat tokens like passwords. Keep them out of browsers and out of Git.

To create tokens for a fresh local install, run:

```powershell
node backend/scripts/create-integration-tokens.js 'C:\path\outside\repo\private-finance-tokens.txt'
```

Restart the backend after configuration. The script stores SHA-256 hashes in ignored `backend/.env` and prints no token values. Each partner has its own hash setting. An unconfigured partner receives HTTP 503. A wrong partner token receives 401. Keep the current port bound to loopback for a local demo. A real inter-system deployment needs agreed sandbox addresses, secure transport, assigned credentials, and a connectivity test against each partner system.

All money fields use Philippine centavos. A ₱400.00 payment is `40000`. Write endpoints return 201 for a new record, 200 for an accepted replay where applicable, 400 for invalid inputs, 404 for unknown state, and 409 for conflicts. Retain your source ID across retries. Avoid retrying permanent 400/409 conflicts without review.

## Registrar

Registrar owns student identity and confirmed enrollment. Finance creates one enrollment per student ID and academic term for billing. Registrar and Finance should agree on exact term IDs before connecting.

`POST /api/v1/integrations/registrar/enrollments`

```json
{
  "externalId": "REG-ENROLL-01",
  "studentId": "DEMO-001",
  "term": "2026-2027 T1",
  "name": "Demo Student",
  "program": "BSIT"
}
```

Owner adds charges using that enrollment. `GET /api/v1/integrations/registrar/students/DEMO-001/standing?term=2026-2027%20T1` returns `unassessed`, `outstanding`, or `settled` and the outstanding amount. Registrar decides how that status affects clearance. For the pilot, select a single enrollment source. A Registrar submission that conflicts with an existing enrollment is flagged for review.

## Cashier

`GET /api/v1/integrations/cashier/students/DEMO-001/charges?term=2026-2027%20T1` returns the charge IDs and their outstanding amounts.

`POST /api/v1/integrations/cashier/payments`

```json
{
  "requestId": "EXT-CASH-01",
  "chargeId": "<charge ID returned by Finance>",
  "operatorRef": "COUNTER-01",
  "amountMinor": 40000,
  "method": "Cash",
  "reference": ""
}
```

The same posting service handles UI and partner payments. The reply gives the payment ID, receipt number, status, and charge balance immediately after posting. Use the exact same key and details when the request times out. Supported methods are Cash, Bank Transfer, Online Payment, and Other. Non-cash methods require a reference. Each posting applies to one charge. Finance uses its own posting timestamp for reports.

## Library

`POST /api/v1/integrations/library/fines`

```json
{
  "studentId": "DEMO-001",
  "term": "2026-2027 T1",
  "reference": "LIB-FINE-01",
  "label": "Approved replacement fine",
  "amountMinor": 15000
}
```

`GET /api/v1/integrations/library/fines/LIB-FINE-01` returns the fine’s own settlement status and balance. When the charge is paid it becomes settled. An approved reversal reopens it. Library retains ownership of loans, returns, and clearance decisions.

## Inventory

`POST /api/v1/integrations/inventory/payables`

```json
{
  "externalId": "INV-PAYABLE-01",
  "approvedOrderRef": "PO-01",
  "receivingRef": "RECEIVE-01",
  "vendorRef": "VENDOR-01",
  "items": [{ "itemRef": "PAPER-A4", "quantity": 5, "unitCostMinor": 12500 }]
}
```

Finance calculates the amount from the received items. One receiving reference can create one payable. Owner reviews the order, receipt evidence, and amount in **Partner Records**, then approves or rejects it. An approved payable can be marked settled with its disbursement reference. `GET /api/v1/integrations/inventory/payables/INV-PAYABLE-01` returns status and decision reference. Inventory controls purchasing and stock movements.

## Faculty

`POST /api/v1/integrations/faculty/workloads`

```json
{
  "externalId": "FAC-WORKLOAD-01",
  "employeeRef": "FACULTY-DEMO-01",
  "period": "2026-2027 T1",
  "approvedHoursHundredths": 1250
}
```

`1250` represents 12.50 hours. The owner reviews the submitted snapshot under **Partner Records**. `GET /api/v1/integrations/faculty/workloads/FAC-WORKLOAD-01` returns review status. The reviewed snapshot can feed a draft in **Faculty Payroll** for the same period.

## How records are kept

The current Finance app reads and writes `/api/v1/ledger`. Each charge holds its payments, receipt references, and reversal decisions. A single document write with a revision check protects concurrent updates even on standalone MongoDB. The original assessment, payment, receipt, and report paths remain available for historical reads. Legacy write paths are disabled to keep new records in one workflow. Existing legacy records require reconciliation before migration to the current ledger.

Local integration tests create a disposable MongoDB database. Run them with:

```powershell
$env:FINANCE_TEST_MONGO = 'mongodb://127.0.0.1:27017'
npm.cmd --prefix backend test
```
