# IDSC Finance System

The Finance module for the IDSC College Management System. It records student charges, tuition installments, payments, receipts, reversals, and collection reports. The owner can also manage cashier access, review partner submissions, and prepare faculty payroll. The app uses React, an Express API, and MongoDB.

## Use the live site

1. Open the [live Finance site](https://idsc-finance-system.onrender.com/).
2. If you already have an account, sign in with your email and password. The live classroom site already has an owner.
3. If you need cashier access and a slot is available, choose **Register as a cashier**. Ask the owner to approve your request under **Cashier Accounts**. You can sign in when your account is active.

Use **Forgot password?** with the recovery code you saved when you registered. If you are still signed in, you can generate a replacement under **Settings** using your current password.

## Run Finance in VS Code

You need **Git**, **VS Code**, **Node.js 24** with npm, and **MongoDB**. The steps below use Docker Desktop to run MongoDB. If MongoDB is already running on your computer at port 27017, use it and skip the Docker command.

1. Open PowerShell and run these commands. If you already cloned the repository, open that folder in VS Code instead.

   ```powershell
   git clone https://github.com/tatojastine/IDSC-Finance-System.git
   cd IDSC-Finance-System
   code .
   ```

   If `code` is unavailable, open VS Code and choose **File → Open Folder**, then pick **IDSC-Finance-System**.

2. In VS Code, choose **Terminal → New Terminal**. Start Docker Desktop, wait until it is running, then start the local database. This command creates the database container the first time.

   ```powershell
   docker run -d --name idsc-finance-mongo -p 127.0.0.1:27017:27017 -v idsc-finance-local-data:/data/db mongo:8.0.16
   ```

   Next time, use `docker start idsc-finance-mongo` if the container is stopped. The named volume keeps local records between restarts.

3. From the project folder, start the backend. Leave this terminal running.

   ```powershell
   npm.cmd --prefix backend ci
   node backend/server.js
   ```

   Visit [local database readiness](http://localhost:5000/api/v1/ready). When the server and database are connected, it shows `{"status":"ready"}`.

4. Open a second VS Code terminal in the project folder and start the frontend. Leave both terminals running.

   ```powershell
   npm.cmd --prefix frontend ci
   npm.cmd --prefix frontend run dev
   ```

5. Open the **Local** URL printed by Vite. On a fresh local database, choose **Create the owner account**. Enter an email and a password of at least 12 characters, then save the recovery code privately. Local development mode skips the owner setup key. If you see **Sign in to Finance**, the database already has an owner.

Run the two install commands again when the corresponding dependencies change. On an ordinary restart, start the database, backend, and frontend. The default local database is `idsc_finance` on `127.0.0.1:27017`. It is separate from the hosted database when you use the defaults.

## Set up the first owner on a new hosted site

Use the [Render and MongoDB Atlas setup guide](docs/render-staging.md) to deploy your own copy. Then follow [Create the first owner](docs/render-staging.md#4-create-the-first-owner) to generate and enter the **Owner setup key**.

- The person managing Render generates the key and stores it privately in the service's **Environment** settings under `OWNER_SETUP_KEY`.
- On the new site's **Create the owner account** screen, enter the same value along with your email and password. Save the recovery code displayed after setup.
- The setup key is only for creating the first hosted owner. After that, use your email and password to sign in and your recovery code if you forget your password.

## Guides and API

- [System and Developer Handbook](docs/finance-system-handbook.md) explains the features, roles, architecture, and developer responsibilities.
- [Finance workflows and partner APIs](docs/finance-workflows.md) covers payments, receipts, reversals, reports, and partner request examples.
- [Faculty Payroll guide](docs/faculty-payroll.md) explains workloads, payroll runs, payslips, and settlement.
- [Shared gateway agreements](docs/integration-agreements.md) tracks partner coordination and live test evidence. The documented Finance-side tests use fictional data.
- [OpenAPI contract](backend/openapi.yaml) lists endpoints and request formats. Open [local Swagger UI](http://localhost:5000/docs/) with the backend running. On the [hosted Swagger UI](https://idsc-finance-system.onrender.com/docs/), sign in as the owner first.
- [Backend framework decision](docs/decisions/framework.md) explains the Node.js and Express choice.
