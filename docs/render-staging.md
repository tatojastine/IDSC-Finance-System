# Set up Finance on Render and MongoDB Atlas

Use this guide to deploy a new classroom demo with its own database. If you already have an account on the [existing Finance site](https://idsc-finance-system.onrender.com/), open the site and sign in. Start with the [VS Code instructions](../README.md#run-finance-in-vs-code) to run Finance on your own computer.

## 1. Prepare the database in MongoDB Atlas

1. Create an Atlas cluster and a database user with read and write access to a database such as `idsc_finance_staging`.
2. In Atlas, open **Connect → Drivers**. Copy the connection string, replace the password placeholder with the database user's password, and set the database name in the URI. Keep the full connection string private. [Atlas connection guide](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/)
3. When the Render service is available, find its outbound IP ranges and add them to the Atlas project's **Network Access** list. This lets Render reach your database. [Render outbound network guide](https://render.com/docs/outbound-ip-addresses)

## 2. Create the Render Web Service

1. In Render, choose **New → Web Service**, select your GitHub copy of this repository, and choose the `main` branch.
2. Select **Docker** for the runtime. Leave **Root Directory** and **Docker Command** blank and use `./Dockerfile` as the Dockerfile path. Set **Health Check Path** to `/api/v1/ready`.
3. Add the environment variables below. Once the service is created, you can find these settings under **Environment** in the service's sidebar.

| Key | What to enter |
|---|---|
| `MONGODB_URI` | Your Atlas connection string from step 1. |
| `JWT_SECRET` | A private random value generated with the command below. The server uses it to sign sessions. Keep it stable across deploys. |
| `OWNER_SETUP_KEY` | A second random value generated separately. This is the value you enter to create the first owner. |
| `APP_ORIGIN` | Your public HTTPS origin if you use a custom domain. For a standard Render URL, the app reads Render's `RENDER_EXTERNAL_URL`. |

Run this command in a terminal with Node.js installed. Run it once for `JWT_SECRET` and a second time for `OWNER_SETUP_KEY`. Each run prints a new 64-character value.

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Keep the connection string and both generated values private. Save the new service and wait until its first deployment is live. If you are setting up an existing service, follow [Create a key if the variable is missing](#create-a-key-if-the-variable-is-missing). [Render environment variables](https://render.com/docs/configure-environment-variables)

## 3. Connect GitHub Actions

1. In Render, open the service's **Settings** and copy its **Deploy Hook** URL. In GitHub, open the repository's **Settings → Secrets and variables → Actions**. Add the hook URL as the secret `RENDER_DEPLOY_HOOK_URL` and the public Render URL as the variable `FINANCE_LIVE_URL`. [Render deploy hooks](https://render.com/docs/deploy-hooks)
2. Set Render **Auto-Deploy** to **Off** so the workflow controls releases after testing.
3. Protect `main` with pull requests, one teammate approval, and the required `test` check. After a reviewed merge, look under **Actions** for successful **test** and **deploy** jobs. The deploy job verifies that the tested commit is online and can reach MongoDB.
4. If the workflow ran before you saved the hook and URL, open the latest failed `main` run and select **Re-run failed jobs** after adding both values.

## 4. Create the first owner

### Copy the existing key from Render

Use these steps when Finance shows **Create the owner account**, including after a database reset. The key is stored in Render separately from the database.

1. Sign in to the [Render dashboard](https://dashboard.render.com/) using an account with access to your Finance service.
2. Open **idsc-finance-system** for the classroom site. For your own deployment, select the service whose public URL matches your Finance site.
3. Click **Environment** in the service sidebar. Under **Environment Variables**, find the row named `OWNER_SETUP_KEY`.
4. Click **Copy value** in that row. The dots in the **Value** column mean Render is hiding the key on screen. **Copy value** copies the full key.
5. Return to the Finance site and paste it into **Owner setup key**. Enter your email and a password of at least 12 characters, then click **Create owner account**.
6. Save the recovery code shown after registration. Use it with **Forgot password?**. For ordinary sign-in, use your email and password.

### Create a key if the variable is missing

1. Open a terminal with Node.js installed and run this command. Copy the 64-character value it prints.

   ```powershell
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

2. Open the Finance service in Render and choose **Environment**. Under **Environment Variables**, click **Edit** if shown, then **Add variable**.
3. Enter `OWNER_SETUP_KEY` in **Key** and paste the generated value into **Value**. Choose **Save and deploy**. If this is a new service, finish creating it with the new variable.
4. Wait for the service to finish deploying. Return to **Create the owner account** and follow the steps above with the saved value. Keep the value in Render and out of GitHub and chat.

### If you get stuck

| What you see | What to do |
|---|---|
| **Enter the valid owner setup key** | Check you opened the matching Render service and clicked **Copy value** on the `OWNER_SETUP_KEY` row. Paste the copied value again. If the key was just added or changed, wait for the deploy to finish. |
| **The host must configure the owner setup key** | Ask the Render service administrator to save a key of at least 32 characters and deploy the change. The command above generates 64 characters. |
| You cannot open the Render service | Ask the person who manages hosting to complete first-owner setup. |
| **Sign in to Finance** | An owner already exists. Use the account's email and password. |

## 5. Check that it works

1. Open `/api/v1/ready` on your public Render URL. It should return `{"status":"ready"}`. A 503 means the database is unavailable. Check the Atlas connection string and IP access list, then check the Render logs.
2. Sign in as owner. If you are testing cashier registration, register with a fictional cashier account and approve it in **Cashier Accounts**.
3. In the demo database, add a fictional charge and record a partial payment. Reopen the receipt and verify the remaining balance.
4. While signed in as owner, open `/docs/` for Swagger UI. The deployed contract is also available at `/docs/openapi.yaml`.
