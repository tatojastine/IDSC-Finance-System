const { Schema, model } = require("mongoose");

const rateSchema = new Schema({
  externalId: { type: String, required: true, unique: true },
  employeeRef: { type: String, required: true },
  displayName: { type: String, required: true },
  period: { type: String, required: true },
  hourlyRateMinor: { type: Number, required: true },
  approvalRef: { type: String, required: true }
}, { timestamps: true });
rateSchema.index({ employeeRef: 1, period: 1 }, { unique: true });

const lineSchema = new Schema({
  workloadId: { type: Schema.Types.ObjectId, required: true },
  workloadRef: { type: String, required: true },
  employeeRef: { type: String, required: true },
  displayName: { type: String, required: true },
  hoursHundredths: { type: Number, required: true },
  hourlyRateMinor: { type: Number, required: true },
  rateSource: { type: String, enum: ["finance", "personnel"], required: true },
  rateApprovalRef: { type: String, required: true },
  baseMinor: Number,
  additionsMinor: Number,
  additionNote: String,
  deductionsMinor: Number,
  deductionNote: String,
  grossMinor: Number,
  netMinor: Number,
  preparedBy: String,
  preparedAt: Date
});

const runSchema = new Schema({
  period: { type: String, required: true, unique: true },
  status: { type: String, enum: ["draft", "finalized", "settled"], default: "draft", index: true },
  lines: [lineSchema],
  revision: { type: Number, default: 0 },
  createdBy: String,
  finalizedAt: Date,
  finalizedBy: String,
  settlement: new Schema({
    reference: String,
    amountMinor: Number,
    recordedAt: Date,
    recordedBy: String
  }, { _id: false })
}, { timestamps: true });
runSchema.index({ "settlement.reference": 1 }, {
  unique: true, partialFilterExpression: { "settlement.reference": { $type: "string" } }
});

module.exports = {
  PayrollRate: model("FacultyPayrollRate", rateSchema),
  PayrollRun: model("FacultyPayrollRun", runSchema)
};
