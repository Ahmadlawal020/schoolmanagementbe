const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

// @route   GET /api/students
// @desc    Get all students
router.get("/", studentController.getAllStudents);

// @route   GET /api/students/:id
// @desc    Get student by ID
router.get("/:id", studentController.getStudentById);

// @route   POST /api/students
// @desc    Create a new student
router.post("/", studentController.createStudent);

// @route   PATCH /api/students
// @desc    Update student
router.patch("/", studentController.updateStudent);

// @route   DELETE /api/students
// @desc    Delete student
router.delete("/", studentController.deleteStudent);

module.exports = router;
