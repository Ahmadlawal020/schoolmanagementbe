const mongoose = require("mongoose");

const feesSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    gradeLevel: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true },
    note: { type: String },
    term: {
      type: String,
      required: true,
      enum: ["First", "Second", "Third", "Summer", "Winter"],
    },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    payments: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        paidAmount: { type: Number, required: true, min: 0 },
        paymentDate: { type: Date, default: Date.now },
        paymentMethod: {
          type: String,
          enum: ["cash", "credit_card", "bank_transfer", "upi", "other"],
          default: "cash",
        },
        transactionId: { type: String }, // optional for tracking
        remarks: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fees", feesSchema);
