const mongoose = require("mongoose");

const attendanceStatus = ["Present", "Absent", "Late", "Excused"];

const studentMarkSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    status: {
      type: String,
      enum: attendanceStatus,
      required: true,
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    period: String, // e.g. “Period 1”, “08:00–08:40” (optional)

    records: {
      type: [studentMarkSchema],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // teacher or admin who entered the marks
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for the same session
attendanceSchema.index(
  { classId: 1, date: 1, subjectId: 1, period: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
