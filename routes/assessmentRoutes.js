const express = require("express");
const router = express.Router();
const {
  getAllAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentsByClassAndSubject,
  getOverallGradeByStudent,
} = require("../controllers/assessmentControllar");

// You can optionally add auth middleware
// const { protect } = require("../middleware/authMiddleware");
router.get(
  "/class/:classId/subject/:subjectId",
  getAssessmentsByClassAndSubject
);
router.get("/overall-grade/:studentId", getOverallGradeByStudent);
router.get("/", getAllAssessments);
router.get("/:id", getAssessmentById);
router.post("/", createAssessment);
router.patch("/", updateAssessment);
router.delete("/", deleteAssessment);

module.exports = router;
