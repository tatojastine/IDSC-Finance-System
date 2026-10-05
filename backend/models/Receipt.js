const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    paymentId: {
      type: String,
      required: true,
      trim: true
    },

    studentId: {
      type: String,
      required: true,
      trim: true
    },

    studentName: {
      type: String,
      required: true,
      trim: true
    },

    paymentDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    amountPaid: {
      type: Number,
      required: true,
      min: 0
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Bank Transfer", "Online Payment", "Other"],
      required: true
    },

    referenceNumber: {
      type: String,
      trim: true
    },

    previousBalance: {
      type: Number,
      required: true,
      min: 0
    },

    remainingBalance: {
      type: Number,
      required: true,
      min: 0
    },

    processedBy: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Receipt", receiptSchema);