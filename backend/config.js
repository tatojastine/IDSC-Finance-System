const path = require("node:path");
const { randomBytes } = require("node:crypto");

require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });

const hosted = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 5000);
const bindHost = process.env.FINANCE_BIND_HOST || (hosted ? "0.0.0.0" : "127.0.0.1");
const mongoUri = process.env.MONGODB_URI?.trim() || (hosted ? "" : "mongodb://127.0.0.1:27017/idsc_finance");

function hostedOrigin() {
  const value = process.env.APP_ORIGIN?.trim() || process.env.RENDER_EXTERNAL_URL?.trim();
  if (!value) throw new Error("Set APP_ORIGIN or RENDER_EXTERNAL_URL to the hosted HTTPS origin.");

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("APP_ORIGIN must be a valid HTTPS origin.");
  }
  if (url.protocol !== "https:" || (value !== url.origin && value !== url.origin + "/")) {
    throw new Error("APP_ORIGIN must be a valid HTTPS origin without a path.");
  }
  return url.origin;
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer from 1 to 65535.");
}
if (!mongoUri) throw new Error("Set MONGODB_URI to the hosted MongoDB connection string.");
const jwtSecret = process.env.JWT_SECRET?.trim();
if ((hosted || jwtSecret) && Buffer.byteLength(jwtSecret || "") < 32) {
  throw new Error("Set JWT_SECRET to a securely generated secret of at least 32 bytes.");
}

module.exports = {
  hosted,
  port,
  bindHost,
  mongoUri,
  publicOrigin: hosted ? hostedOrigin() : null,
  ownerSetupKey: process.env.OWNER_SETUP_KEY,
  jwtSecret: jwtSecret || randomBytes(32),
  frontendDir: path.join(__dirname, "..", "frontend", "dist")
};
