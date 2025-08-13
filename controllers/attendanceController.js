const Attendance = require("../models/attendanceSchema");
const Student = require("../models/studentSchema");
const Class = require("../models/classSchema");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");

// @desc    Record attendance for a class
// @route   POST /api/attendance
// @access  Private (e.g., teacher, admin)
const createAttendance = asyncHandler(async (req, res) => {
  const { classId, date, period, records, recordedBy } = req.body;

  if (!classId || !date || !records || !recordedBy) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Prevent duplicate attendance
  const existing = await Attendance.findOne({ classId, date, period });
  if (existing) {
    return res
      .status(409)
      .json({ message: "Attendance already recorded for this session" });
  }

  const attendance = await Attendance.create({
    classId,
    date,
    period,
    records,
    recordedBy,
  });

  if (!attendance) {
    return res.status(500).json({ message: "Failed to record attendance" });
  }

  res
    .status(201)
    .json({ message: "Attendance recorded successfully", attendance });
});

// @desc    Get attendance for a class by date
// @route   GET /api/attendance/class/:classId/date/:date
// @access  Private
const getAttendanceByClassAndDate = asyncHandler(async (req, res) => {
  const { classId, date } = req.params;

  const attendance = await Attendance.find({ classId, date })
    .populate("records.studentId", "firstName lastName admissionNumber")
    .populate("recordedBy", "firstName lastName");

  if (!attendance.length) {
    return res
      .status(404)
      .json({ message: "No attendance found for this class/date" });
  }

  res.json(attendance);
});

// @desc    Get a student's attendance summary
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getStudentAttendanceSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const records = await Attendance.find({ "records.studentId": studentId });

  const summary = {
    Present: 0,
    Absent: 0,
    Late: 0,
    Excused: 0,
  };

  for (const att of records) {
    const rec = att.records.find((r) => r.studentId.toString() === studentId);
    if (rec) summary[rec.status]++;
  }

  res.json({ studentId, summary });
});
// @desc    Get attendance by ID
// @route   GET /api/attendance/:id
// @access  Private
const getAttendanceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attendance = await Attendance.findById(id)
    .populate("classId", "className")
    .populate("records.studentId", "firstName lastName admissionNumber")
    .populate("recordedBy", "firstName lastName");

  if (!attendance) {
    return res.status(404).json({ message: "Attendance record not found" });
  }

  res.json(attendance);
});
// @desc    Update attendance record
// @route   PATCH /api/attendance/:id
// @access  Private
const updateAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { records, period } = req.body;

  const attendance = await Attendance.findById(id);
  if (!attendance)
    return res.status(404).json({ message: "Attendance not found" });

  if (records) attendance.records = records;
  if (period) attendance.period = period;

  const updated = await attendance.save();
  res.json({ message: "Attendance updated", updated });
});

// @desc    Delete attendance
// @route   DELETE /api/attendance/:id
// @access  Private
const deleteAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attendance = await Attendance.findById(id);
  if (!attendance)
    return res.status(404).json({ message: "Attendance not found" });

  await attendance.deleteOne();
  res.json({ message: "Attendance deleted successfully" });
});

const getClassAttendance = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
    return res
      .status(400)
      .json({ message: "Invalid or missing class ID parameter" });
  }

  const attendance = await Attendance.find({ classId })
    .populate("classId", "className grade section")
    .populate("recordedBy", "firstName lastName")
    .sort({ date: -1, createdAt: -1 });

  res.json({ success: true, data: attendance });
});

module.exports = {
  createAttendance,
  getAttendanceByClassAndDate,
  getStudentAttendanceSummary,
  updateAttendance,
  deleteAttendance,
  getAttendanceById,
  getClassAttendance,
};
