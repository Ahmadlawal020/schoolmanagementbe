const mongoose = require("mongoose");
const { Schema } = mongoose;

const assignmentSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    format: {
      type: [String],
      enum: ["Text", "Image", "PDF"],
      required: true,
    },
    attachments: {
      textContent: { type: String },
      imageUrls: [{ type: String }],
      pdfUrls: [{ type: String }],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },

    submissions: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Student",
          required: true,
        },
        submittedAt: { type: Date, default: Date.now },
        content: {
          textResponse: { type: String },
          imageUrls: [{ type: String }],
          pdfUrls: [{ type: String }],
        },
        status: {
          type: String,
          enum: ["Submitted", "Pending", "Reviewed"],
          default: "Submitted",
        },
        teacherFeedback: {
          comments: { type: String },
          grade: { type: String },
          scoredMarks: { type: Number },
          totalMarks: { type: Number },
          reviewedAt: { type: Date },
          assessmentId: {
            // links to Assessment collection
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assessment",
          },
        },
      },
    ],
  },
  { timestamps: true }
);

assignmentSchema.index({ classId: 1, subjectId: 1, academicYear: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
