const express = require("express");
const router = express.Router();
const subjectController = require("../controllers/subjectController");

// Get all subjects
router.get("/", subjectController.getAllSubjects);

// Get all subjects assigned to a specific teacher
router.get("/teacher/:teacherId", subjectController.getSubjectsByTeacher);

// Get all subjects by department
router.get(
  "/department/:department",
  subjectController.getSubjectsByDepartment
);

// Get subject by ID - keep last
router.get("/:id", subjectController.getSubjectById);

// Create subject
router.post("/", subjectController.createSubject);

// Update subject
router.patch("/", subjectController.updateSubject);

// Delete subject
router.delete("/", subjectController.deleteSubject);

module.exports = router;
