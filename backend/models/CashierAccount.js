const mongoose = require("mongoose");

const cashierAccountSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  cashierSlot: { type: Number, required: true, enum: [0, 1, 2], unique: true },
  status: { type: String, enum: ["pending", "active", "inactive"], default: "active" },
  recoveryHash: { type: String, select: false },
  sessionVersion: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("CashierAccount", cashierAccountSchema);
