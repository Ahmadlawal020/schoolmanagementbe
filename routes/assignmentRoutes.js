const express = require("express");
const router = express.Router();
const {
  createAssignment,
  submitAssignment,
  reviewSubmission,
  getAssignmentsByClass,
  getAssignmentById,
  getAllAssignments,
  deleteAssignment,
  getAssignmentsByTeacher,
  getAssignmentsByStudentId,
} = require("../controllers/assignmentController");

// Create a new assignment
router.post("/", createAssignment);

// Get all assignments
router.get("/", getAllAssignments);

router.get("/student/:studentId", getAssignmentsByStudentId);

// Student submits an assignment
router.post("/:id/submit", submitAssignment);

// Teacher reviews a submission
router.patch("/:id/review/:studentId", reviewSubmission);

// Get all assignments for a class
router.get("/class/:classId", getAssignmentsByClass);

router.get("/teacher/:teacherId", getAssignmentsByTeacher);

// Get a single assignment
router.get("/:id", getAssignmentById);

// Delete an assignment
router.delete("/:id", deleteAssignment);

module.exports = router;
