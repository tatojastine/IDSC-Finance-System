# Finance staging on Render and MongoDB Atlas

Use this setup for a hosted classroom demo with fictional records. A single Render service serves the compiled React dashboard and the Express API on the same HTTPS origin. Atlas stores the demo records across service restarts.

## 1. Prepare Atlas

1. Create a staging cluster and a database user with read/write access to the Finance staging database, such as `idsc_finance_staging`.
2. Copy the Atlas driver connection string and set its database name to `idsc_finance_staging`. Keep the connection string private.
3. After creating the Render service, open **Connect → Outbound** in its dashboard. Add the listed ranges to the Atlas project’s IP access list. [Atlas connection guide](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/) · [Render outbound network guide](https://render.com/docs/outbound-ip-addresses)

## 2. Create the Render Web Service

In Render, choose **New → Web Service**, connect `tatojastine/IDSC-Finance-System` through GitHub, select `main`, and leave **Root Directory** blank. Render needs the root Dockerfile on that branch to build successfully. [Render Docker guide](https://render.com/docs/docker)

| Setting | Value |
|---|---|
| Runtime | Docker |
| Dockerfile Path | `./Dockerfile` |
| Docker Command | Leave blank to use the Dockerfile command |
| Auto-Deploy | Off. GitHub Actions starts deploys after tests. |
| Health Check Path | `/api/v1/ready` |
| `MONGODB_URI` | Your private Atlas driver connection string for the staging database |
| `JWT_SECRET` | A private random signing key of at least 32 bytes. Keep it stable across deploys. |
| `OWNER_SETUP_KEY` | Your private random first-run key, at least 32 characters |
| `APP_ORIGIN` | Set only if you use a custom HTTPS origin. Otherwise Finance uses Render’s `RENDER_EXTERNAL_URL`. |

The container uses Node 24, serves the built frontend and binds to `0.0.0.0`. Render's **Environment** settings hold the database URI and both keys. [Render environment variables](https://render.com/docs/environment-variables)

Run this command twice to generate two independent values, one for `OWNER_SETUP_KEY` and one for `JWT_SECRET`.

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep both keys and the owner password private. The server blocks first-run hosted owner creation when the setup key is missing or incorrect. Changing the JWT signing key requires everyone to sign in again.

## 3. Connect GitHub Actions

1. In GitHub, open **Settings → Secrets and variables → Actions**. Add the Render service’s Settings → Deploy Hook URL as the repository secret `RENDER_DEPLOY_HOOK_URL`. Add the service’s public HTTPS origin as the repository variable `FINANCE_LIVE_URL`. [Render deploy hooks](https://render.com/docs/deploy-hooks)
2. Protect `main` and require pull requests with one teammate approval and the `test` status check. Once the workflow has appeared in Actions, select the actual check in the branch rule. [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
3. Push the work branch, have a teammate review the PR, verify the PR test job, and merge. The resulting `main` run must show successful `test` and `deploy` jobs. The deploy job requests that exact tested commit and waits until the public readiness endpoint responds with its SHA. Add the working URL to the repository README through a reviewed PR.

If the first merge is needed to make the Dockerfile available to Render, the test job can pass before hosting exists. The deploy job will fail until the service and both GitHub values exist. Complete the setup, then use **Re-run failed jobs** on the latest `main` run.

## 4. Verify the hosted app

1. Visit the Render HTTPS URL. The browser should show **Create the owner account** on a fresh database. Enter the setup key and create the owner. Save the one-time recovery code privately. Once the owner exists, remove `OWNER_SETUP_KEY` from Render if desired and confirm the owner can still sign in after the service redeploys.
2. Visit `/api/v1/ready`. It should respond with `{"status":"ready"}`. A `503` indicates that Finance could not reach MongoDB. Use Render logs and check Atlas credentials and the IP access list.
3. Sign in as the owner, approve a fictional cashier, add a ₱10,000 charge, and record ₱4,000. Reopen the receipt and check that ₱6,000 remains due. Restart the service and check that the receipt, balance, and report are still present.
4. Finalize a fictional payroll run and open the payslip. Confirm the cashier account cannot open Faculty Payroll. After the owner signs in, open Swagger UI at `/docs/` and download its deployed contract from `/docs/openapi.yaml`.
5. Share the staging URL after those checks. The Render URL can be publicly reachable. Finance records require an active account and cashier requests require owner approval.

Local development still uses the Vite development server and the loopback database when those are the configured defaults. For a production-mode smoke test on your machine, build the frontend before running the backend suite with `FINANCE_TEST_MONGO`. That suite connects to a disposable database and tests protected owner setup, secure cookie headers, compiled assets, and the database readiness endpoint.
