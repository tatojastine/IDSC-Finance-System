const { createHash, randomBytes } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const destination = process.argv[2] && path.resolve(process.argv[2]);
const mode = process.argv[3];
if (mode && mode !== "--payroll") {
  console.error("Use --payroll to create the three payroll integration tokens.");
  process.exit(1);
}
const backend = path.resolve(__dirname, "..");
const repo = path.dirname(backend);
const relative = destination && path.relative(repo, destination);
if (!destination || (!relative.startsWith(".." + path.sep) && !path.isAbsolute(relative))) {
  console.error("Pass a private output filename outside the repository.");
  process.exit(1);
}

const config = path.join(backend, ".env");
const current = fs.existsSync(config) ? fs.readFileSync(config, "utf8") : "";
const partners = mode === "--payroll"
  ? ["PERSONNEL", "DISBURSEMENT", "ACCOUNTING"]
  : ["REGISTRAR", "CASHIER", "LIBRARY", "INVENTORY", "FACULTY"];
if (partners.some((partner) => new RegExp(`^\\s*(?:export\\s+)?FINANCE_${partner}_TOKEN_HASH\\s*=`, "m").test(current))) {
  console.error("One or more token hashes in this group are already configured.");
  process.exit(1);
}

const tokens = partners.map((partner) => [partner, randomBytes(32).toString("base64url")]);
const hashes = tokens.map(([partner, token]) =>
  `FINANCE_${partner}_TOKEN_HASH=${createHash("sha256").update(token).digest("hex")}`);
const lines = [
  "PRIVATE — IDSC Finance local integration tokens",
  "Share only the relevant token with an approved maintainer. Never embed a token in browser code.",
  "",
  ...tokens.map(([partner, token]) => `${partner}: ${token}`),
  ""
];
fs.writeFileSync(destination, lines.join("\n"), { flag: "wx", mode: 0o600 });
fs.appendFileSync(config, "\n" + hashes.join("\n") + "\n", { mode: 0o600 });
console.log(`${partners.length} local integration tokens were created. Restart the Finance backend.`);
