const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    studentId: {
      type: String,
      required: true,
      trim: true
    },

    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assessment",
      required: true
    },

    amountPaid: {
      type: Number,
      required: true,
      min: 0
    },

    paymentDate: {
      type: Date,
      required: true,
      default: Date.now
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

    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    processedBy: {
      type: String,
      required: true,
      trim: true
    },

    remarks: {
      type: String,
      trim: true
    },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Partially Paid", "Pending", "Cancelled"],
      default: "Paid"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Payment", paymentSchema);