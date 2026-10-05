const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      trim: true
    },

    academicYear: {
      type: String,
      required: true,
      trim: true
    },

    semester: {
      type: String,
      required: true,
      trim: true
    },

    tuitionFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    miscellaneousFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    laboratoryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    registrationFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    libraryFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    otherFees: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    discounts: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    scholarshipFinancialAssistance: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    totalAssessment: {
      type: Number,
      default: 0,
      min: 0
    },

    dueDate: {
      type: Date,
      required: true
    },

    assessmentStatus: {
      type: String,
      enum: ["Unpaid", "Partially Paid", "Paid", "Overdue"],
      default: "Unpaid"
    }
  },
  {
    timestamps: true
  }
);

// Calculate Total Assessment automatically
assessmentSchema.pre("save", function () {
  const totalFees =
    this.tuitionFee +
    this.miscellaneousFee +
    this.laboratoryFee +
    this.registrationFee +
    this.libraryFee +
    this.otherFees;

  this.totalAssessment = Math.max(
    0,
    totalFees - this.discounts
  );
});

module.exports = mongoose.model("Assessment", assessmentSchema);