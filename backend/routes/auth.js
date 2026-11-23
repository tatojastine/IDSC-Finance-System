const express = require("express");
const bcrypt = require("bcrypt");
const { createHash, randomBytes } = require("node:crypto");
const mongoose = require("mongoose");
const CashierAccount = require("../models/CashierAccount");

const router = express.Router();
const cookieName = "idsc_finance_session";
const cookieOptions = { httpOnly: true, sameSite: "lax", path: "/" };
const sessionDuration = 8 * 60 * 60 * 1000;
const rememberDuration = 7 * 24 * 60 * 60 * 1000;
const ownerSlot = 0;
const cashierSlots = [1, 2];
const dummyHash = bcrypt.hashSync(randomBytes(32).toString("hex"), 12);

const CashierSession = mongoose.model("CashierSession", new mongoose.Schema({
  _id: String,
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  version: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, expires: 0 }
}));

const digest = (value) => createHash("sha256").update(value).digest("hex");

function credentials(body) {
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      password.length < 12 || Buffer.byteLength(password) > 72) {
    return null;
  }
  return { email, password };
}

function sessionKey(req) {
  const cookies = (req.headers.cookie ?? "").split(";");
  const cookie = cookies.find((entry) => entry.trimStart().startsWith(cookieName + "="));
  const token = cookie?.trim().slice(cookieName.length + 1);
  return /^[a-f0-9]{64}$/.test(token) ? digest(token) : null;
}

function publicAccount(account) {
  return {
    id: String(account._id),
    email: account.email,
    role: account.cashierSlot === ownerSlot ? "owner" : "cashier",
    status: account.status ?? "active"
  };
}

async function requireAccount(req, res, next) {
  const key = sessionKey(req);
  const session = key && await CashierSession.findOne({
    _id: key, expiresAt: { $gt: new Date() }
  }).lean();
  const account = session && await CashierAccount.findById(session.userId).lean();
  if (!account || (account.status ?? "active") !== "active" ||
      (account.sessionVersion ?? 0) !== (session.version ?? 0)) {
    return res.status(401).json({ message: "Sign in to continue." });
  }

  res.set("Cache-Control", "no-store");
  req.account = publicAccount(account);
  next();
}

function requireOwner(req, res, next) {
  if (req.account.role !== "owner") {
    return res.status(403).json({ message: "Only the owner can manage cashier accounts." });
  }
  next();
}

// Bound repeated attempts against the local sign-in forms.
const attempts = new Map();
const windowMs = 15 * 60 * 1000;
setInterval(() => {
  for (const [key, entry] of attempts) {
    if (entry.expires <= Date.now()) attempts.delete(key);
  }
}, windowMs).unref();

function limitAttempts(req, res, next) {
  const key = req.ip + req.path;
  const now = Date.now();
  let entry = attempts.get(key);
  if (!entry || entry.expires <= now) {
    entry = { count: 0, expires: now + windowMs };
    attempts.set(key, entry);
  }
  if (entry.count >= 15) {
    res.set("Retry-After", String(Math.ceil((entry.expires - now) / 1000)));
    return res.status(429).json({ message: "Too many attempts. Try again later." });
  }
  entry.count += 1;
  next();
}

router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

const inputMessage = "Use a valid email and a password of at least 12 characters and at most 72 bytes.";
const ownerExists = () => CashierAccount.exists({ cashierSlot: ownerSlot });
const newRecoveryCode = () => randomBytes(24).toString("base64url");

router.get("/setup", async (req, res) => {
  const [owner, cashierCount] = await Promise.all([
    ownerExists(),
    CashierAccount.countDocuments({ cashierSlot: { $in: cashierSlots } })
  ]);
  res.json({ ownerRequired: !owner, cashierSlotsAvailable: cashierSlots.length - cashierCount });
});

router.post("/setup", limitAttempts, async (req, res) => {
  const input = credentials(req.body);
  if (!input) return res.status(400).json({ message: inputMessage });
  if (await ownerExists()) return res.status(409).json({ message: "The owner account already exists. Sign in to continue." });

  const recoveryCode = newRecoveryCode();
  try {
    const password = await bcrypt.hash(input.password, 12);
    const account = await CashierAccount.create({
      email: input.email, password, cashierSlot: ownerSlot, recoveryHash: digest(recoveryCode)
    });
    return res.status(201).json({ ...publicAccount(account), recoveryCode });
  } catch (error) {
    if (error.code === 11000) {
      const message = error.keyPattern?.email
        ? "That email is already registered. Use a different email for the owner."
        : "The owner account already exists. Sign in to continue.";
      return res.status(409).json({ message });
    }
    throw error;
  }
});

router.post("/register", limitAttempts, async (req, res) => {
  const input = credentials(req.body);
  if (!input) return res.status(400).json({ message: inputMessage });
  if (!await ownerExists()) return res.status(409).json({ message: "Create the owner account before registering cashiers." });

  const password = await bcrypt.hash(input.password, 12);
  const recoveryCode = newRecoveryCode();
  for (const cashierSlot of cashierSlots) {
    try {
      const account = await CashierAccount.create({
        email: input.email, password, cashierSlot, status: "pending", recoveryHash: digest(recoveryCode)
      });
      return res.status(201).json({ ...publicAccount(account), recoveryCode });
    } catch (error) {
      if (error.code !== 11000) throw error;
      if (error.keyPattern?.email) return res.status(409).json({ message: "That email is already registered." });
    }
  }
  return res.status(409).json({ message: "Both cashier slots are occupied." });
});

router.post("/login", limitAttempts, async (req, res) => {
  const input = credentials(req.body);
  const account = input && await CashierAccount.findOne({ email: input.email }).select("+password").lean();
  const matches = await bcrypt.compare(input?.password ?? "", account?.password ?? dummyHash);
  if (!account || !matches) return res.status(401).json({ message: "Email or password is incorrect." });
  if (account.status === "pending") {
    return res.status(403).json({ message: "Your cashier account is waiting for the owner’s approval." });
  }
  if (account.status === "inactive") {
    return res.status(403).json({ message: "Your cashier account is inactive. Contact the owner." });
  }

  const previousKey = sessionKey(req);
  if (previousKey) await CashierSession.deleteOne({ _id: previousKey });
  const token = randomBytes(32).toString("hex");
  const remember = req.body.remember === true;
  const duration = remember ? rememberDuration : sessionDuration;
  await CashierSession.create({
    _id: digest(token), userId: account._id, version: account.sessionVersion ?? 0,
    expiresAt: new Date(Date.now() + duration)
  });
  attempts.delete(req.ip + req.path);
  res.cookie(cookieName, token, remember ? { ...cookieOptions, maxAge: duration } : cookieOptions);
  return res.json(publicAccount(account));
});

router.get("/session", requireAccount, (req, res) => res.json(req.account));

router.post("/reset-password", limitAttempts, async (req, res) => {
  const input = credentials(req.body);
  const code = typeof req.body?.recoveryCode === "string" ? req.body.recoveryCode.trim() : "";
  if (!input || !/^[a-zA-Z0-9_-]{32}$/.test(code)) {
    return res.status(400).json({ message: "Enter your email, recovery code, and a new password of at least 12 characters." });
  }
  const recoveryCode = newRecoveryCode();
  const password = await bcrypt.hash(input.password, 12);
  const account = await CashierAccount.findOneAndUpdate(
    { email: input.email, recoveryHash: digest(code) },
    { $set: { password, recoveryHash: digest(recoveryCode) }, $inc: { sessionVersion: 1 } }
  );
  if (!account) return res.status(400).json({ message: "The email or recovery code is incorrect." });
  res.clearCookie(cookieName, cookieOptions);
  return res.json({ recoveryCode });
});

router.post("/recovery-code", requireAccount, limitAttempts, async (req, res) => {
  const input = credentials({ email: req.account.email, password: req.body?.password });
  const account = await CashierAccount.findById(req.account.id).select("+password").lean();
  if (!input || !account || !await bcrypt.compare(input.password, account.password)) {
    return res.status(401).json({ message: "The current password is incorrect." });
  }
  const recoveryCode = newRecoveryCode();
  const result = await CashierAccount.updateOne(
    { _id: account._id, password: account.password },
    { $set: { recoveryHash: digest(recoveryCode) } }
  );
  if (!result.matchedCount) return res.status(409).json({ message: "Your password changed. Try again." });
  return res.json({ recoveryCode });
});

router.use("/cashiers", requireAccount, requireOwner);

router.get("/cashiers", async (req, res) => {
  const cashiers = await CashierAccount.find({ cashierSlot: { $in: cashierSlots } }).sort("cashierSlot").lean();
  res.json(cashiers.map(publicAccount));
});

router.patch("/cashiers/:id", async (req, res) => {
  const transitions = {
    approve: { from: ["pending"], to: "active" },
    activate: { from: ["inactive"], to: "active" },
    deactivate: { from: ["active", null], to: "inactive" }
  };
  const action = req.body?.action;
  const transition = typeof action === "string" && Object.hasOwn(transitions, action)
    ? transitions[action] : null;
  if (!mongoose.isObjectIdOrHexString(req.params.id) || !transition) {
    return res.status(400).json({ message: "Invalid cashier or action." });
  }
  const cashier = await CashierAccount.findOneAndUpdate({
    _id: req.params.id, cashierSlot: { $in: cashierSlots }, status: { $in: transition.from }
  }, {
    $set: { status: transition.to }, $inc: { sessionVersion: 1 }
  }, { returnDocument: "after" });
  if (!cashier) return res.status(409).json({ message: "The cashier has changed or this action is unavailable." });
  return res.json(publicAccount(cashier));
});

router.delete("/cashiers/:id", async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ message: "Invalid cashier." });
  }
  const result = await CashierAccount.deleteOne({ _id: req.params.id, cashierSlot: { $in: cashierSlots } });
  if (!result.deletedCount) return res.status(404).json({ message: "Cashier account not found." });
  return res.status(204).end();
});

router.post("/logout", async (req, res) => {
  const key = sessionKey(req);
  if (key) await CashierSession.deleteOne({ _id: key });
  res.clearCookie(cookieName, cookieOptions).status(204).end();
});

module.exports = { router, requireAccount, CashierSession };
