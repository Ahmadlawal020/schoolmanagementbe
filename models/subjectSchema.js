const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    gradeLevels: {
      type: [String], // e.g. ['Primary 3', 'Primary 4']
      required: true,
    },
    department: {
      type: String,
      default: "", // e.g. 'Sciences', 'Humanities'
    },
    teacherIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
      },
    ],

    academicYear: {
      type: String,
      required: true, // e.g., '2023/2024'
    },
    isCompulsory: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Optional: Indexes for faster queries
SubjectSchema.index({ academicYear: 1 });
SubjectSchema.index({ teacherIds: 1 });
SubjectSchema.index({ classIds: 1 });

module.exports = mongoose.model("Subject", SubjectSchema);
