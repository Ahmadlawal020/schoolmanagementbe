const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    grade: {
      type: String,
      required: true,
    },
    section: {
      type: String,
    },
    academicYear: {
      type: String,
      required: true,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomNumber: {
      type: String,
    },
    maxCapacity: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Graduated"],
      default: "Active",
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
  },
  { timestamps: true }
);

// Optional indexing for performance
// classSchema.index({ academicYear: 1 });
// classSchema.index({ classTeacher: 1 });

module.exports = mongoose.model("Class", classSchema);
