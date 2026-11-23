# Finance staging on Render and MongoDB Atlas

Use this setup for a hosted classroom demo with fictional records. A single Render service serves the compiled React dashboard and the Express API on the same HTTPS origin. Atlas stores the demo records across service restarts.

## 1. Prepare Atlas

1. Create a staging cluster and a database user with read/write access to the Finance staging database, such as `idsc_finance_staging`.
2. Copy the Atlas driver connection string and set its database name to `idsc_finance_staging`. Keep the connection string private.
3. After creating the Render service, open **Connect → Outbound** in its dashboard. Add the listed ranges to the Atlas project’s IP access list. [Atlas connection guide](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/) · [Render outbound network guide](https://render.com/docs/outbound-ip-addresses)

## 2. Create the Render Web Service

In Render, choose **New → Web Service**, select `tatojastine/IDSC-Finance-System` and branch `main`, and leave **Root Directory** blank. The updated hosting commit must be present on that branch. [Render Web Services](https://render.com/docs/web-services)

| Setting | Value |
|---|---|
| Runtime | Node |
| Build Command | `npm ci --prefix backend && npm ci --prefix frontend --include=dev && npm run build --prefix frontend` |
| Start Command | `node backend/server.js` |
| Health Check Path | `/api/v1/ready` |
| `NODE_VERSION` | `24.21.0`, the version used for local verification |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your private Atlas driver connection string for the staging database |
| `OWNER_SETUP_KEY` | Your private random first-run key, at least 32 characters |
| `APP_ORIGIN` | Set only if you use a custom HTTPS origin. Otherwise Finance uses Render’s `RENDER_EXTERNAL_URL`. |

Render provides `PORT` to the application. Production mode binds to `0.0.0.0`. The frontend’s public API path stays `/api/v1`. Render’s **Environment** settings are the place for the database URI and the setup key. [Render environment variables](https://render.com/docs/environment-variables) · [Render Node versions](https://render.com/docs/node-version)

Generate the owner setup key locally with Node and paste it into Render’s environment settings:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

The key is separate from the owner password. Keep both values private. The server blocks first-run hosted owner creation when the key is missing or incorrect.

## 3. Verify the hosted app

1. Visit the Render HTTPS URL. The browser should show **Create the owner account** on a fresh database. Enter the setup key and create the owner. Save the one-time recovery code privately. Once the owner exists, remove `OWNER_SETUP_KEY` from Render if desired and confirm the owner can still sign in after the service redeploys.
2. Visit `/api/v1/ready`. It should respond with `{"status":"ready"}`. A `503` indicates that Finance could not reach MongoDB. Use Render logs and check Atlas credentials and the IP access list.
3. Sign in as the owner, approve a fictional cashier, add a ₱10,000 charge, and record ₱4,000. Reopen the receipt and check that ₱6,000 remains due. Restart the service and check that the receipt, balance, and report are still present.
4. Finalize a fictional payroll run and open the payslip. Confirm the cashier account cannot open Faculty Payroll. The hosted Swagger UI at `/docs/` is available after the owner signs in.
5. Share the staging URL after those checks. The Render URL can be publicly reachable. Finance records require an active account and cashier requests require owner approval.

Local development still uses the Vite development server and the loopback database when those are the configured defaults. For a production-mode smoke test on your machine, build the frontend before running the backend suite with `FINANCE_TEST_MONGO`. That suite connects to a disposable database and tests protected owner setup, secure cookie headers, compiled assets, and the database readiness endpoint.
