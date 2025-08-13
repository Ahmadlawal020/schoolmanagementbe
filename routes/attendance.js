const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");

// Create and get attendance records
router.post("/", attendanceController.createAttendance);
router.get(
  "/class/:classId/date/:date",
  attendanceController.getAttendanceByClassAndDate
);
router.get(
  "/student/:studentId",
  attendanceController.getStudentAttendanceSummary
);
// Get attendance for specific class
router.get("/class/:classId", attendanceController.getClassAttendance);
// Single attendance record operations
router.get("/:id", attendanceController.getAttendanceById); // NEW ROUTE
router.patch("/:id", attendanceController.updateAttendance);
router.delete("/:id", attendanceController.deleteAttendance);

module.exports = router;
