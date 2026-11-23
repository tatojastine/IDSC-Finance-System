const mongoose = require("mongoose");
const { Schema } = mongoose;

const enrollmentSchema = new Schema({
  studentId: { type: String, required: true },
  term: { type: String, required: true },
  name: { type: String, required: true },
  program: { type: String, required: true },
  source: { type: String, required: true },
  externalId: String
}, { timestamps: true });
enrollmentSchema.index({ studentId: 1, term: 1 }, { unique: true });
enrollmentSchema.index({ source: 1, externalId: 1 }, {
  unique: true, partialFilterExpression: { externalId: { $type: "string" } }
});

const reversalSchema = new Schema({
  reason: String,
  status: { type: String, enum: ["pending", "approved", "rejected"] },
  requestedAt: Date,
  requestedBy: String,
  decidedAt: Date,
  decidedBy: String,
  decisionNote: String
}, { _id: false });

const paymentSchema = new Schema({
  _id: String,
  key: String,
  fingerprint: String,
  amountMinor: Number,
  method: String,
  reference: String,
  postedAt: Date,
  postedBy: String,
  postedActorId: String,
  studentName: String,
  balanceAfterMinor: Number,
  reversals: [reversalSchema]
});

const chargeSchema = new Schema({
  enrollmentId: { type: Schema.Types.ObjectId, ref: "FinanceEnrollment", required: true, index: true },
  label: String,
  amountMinor: Number,
  source: String,
  reference: String,
  createdBy: String,
  key: { type: String, required: true, unique: true },
  payments: [paymentSchema],
  revision: { type: Number, default: 0 }
}, { timestamps: true });
chargeSchema.index({ "payments.key": 1 }, {
  unique: true, partialFilterExpression: { "payments.key": { $type: "string" } }
});
chargeSchema.index({ "payments._id": 1 });
chargeSchema.index({ "payments.postedAt": 1 });
chargeSchema.index({ "payments.reversals.decidedAt": 1 });

const partnerItemSchema = new Schema({
  partner: { type: String, enum: ["inventory", "faculty"], required: true },
  externalId: { type: String, required: true },
  details: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ["submitted", "approved", "settled", "rejected", "reviewed"], default: "submitted" },
  decisions: [{ status: String, actor: String, at: Date, reference: String, _id: false }]
}, { timestamps: true });
partnerItemSchema.index({ partner: 1, externalId: 1 }, { unique: true });
partnerItemSchema.index({ partner: 1, "details.receivingRef": 1 }, {
  unique: true, partialFilterExpression: { partner: "inventory" }
});

module.exports = {
  Enrollment: mongoose.model("FinanceEnrollment", enrollmentSchema),
  Charge: mongoose.model("FinanceCharge", chargeSchema),
  PartnerItem: mongoose.model("FinancePartnerItem", partnerItemSchema)
};
