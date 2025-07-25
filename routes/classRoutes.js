const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");

// Optional: You can add authentication or role-based access middleware here
// const verifyToken = require("../middleware/verifyToken");
// const checkRole = require("../middleware/checkRole");

// @route   GET /api/classes
// @desc    Get all classes
// @access  Private
router.get("/", classController.getAllClasses);

// @route   GET /api/classes/teacher/:teacherId
// @desc    Get all classes by class teacher ID
// @access  Private
router.get("/teacher/:teacherId", classController.getClassesByTeacherId);

// @route   GET /api/classes/:id
// @desc    Get class by ID
// @access  Private
router.get("/:id", classController.getClassById);

// @route   POST /api/classes
// @desc    Create a new class
// @access  Private
router.post("/", classController.createClass);

// @route   PATCH /api/classes
// @desc    Update a class
// @access  Private
router.patch("/", classController.updateClass);

// @route   DELETE /api/classes
// @desc    Delete a class
// @access  Private
router.delete("/", classController.deleteClass);

module.exports = router;
