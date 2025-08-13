const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    assessmentType: {
      type: String,
      enum: ["Test", "Assignment", "Project", "Exam", "Quiz"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    scoredMarks: {
      type: Number,
      required: true,
    },
    comments: {
      type: String,
    },
    term: {
      type: String,
      enum: ["First", "Second", "Third", "Summer", "Winter"],
      required: true,
    },
    academicYear: {
      type: String,
      required: true, // e.g., '2024/2025'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Optional indexes
assessmentSchema.index({ student: 1, subject: 1, academicYear: 1 });

module.exports = mongoose.model("Assessment", assessmentSchema);
