const Assessment = require("../models/assessmentSchema");
const asyncHandler = require("express-async-handler");

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Private
const getAllAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find()
    .populate("student", "firstName lastName admissionNumber")
    .populate("subject", "name code")
    .populate("classId", "className grade section")
    .lean();

  if (!assessments?.length) {
    return res.status(404).json({ message: "No assessments found." });
  }

  res.json(assessments);
});

// @desc    Get assessment by ID
// @route   GET /api/assessments/:id
// @access  Private
const getAssessmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const assessment = await Assessment.findById(id)
    .populate("student", "firstName lastName admissionNumber")
    .populate("subject", "name code")
    .populate("classId", "className grade section")
    .lean();

  if (!assessment) {
    return res.status(404).json({ message: "Assessment not found." });
  }

  res.json(assessment);
});

// @desc    Create new assessment
// @route   POST /api/assessments
// @access  Private
const createAssessment = asyncHandler(async (req, res) => {
  const {
    student,
    subject,
    classId,
    assessmentType,
    title,
    date,
    totalMarks,
    scoredMarks,
    comments,
    term,
    academicYear,
    createdBy,
  } = req.body;

  if (
    !student ||
    !subject ||
    !classId ||
    !assessmentType ||
    !title ||
    !totalMarks ||
    !scoredMarks ||
    !term ||
    !academicYear
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided." });
  }

  const assessment = await Assessment.create({
    student,
    subject,
    classId,
    assessmentType,
    title,
    date: date || new Date(),
    totalMarks,
    scoredMarks,
    comments,
    term,
    academicYear,
    createdBy,
  });

  res.status(201).json({
    message: "Assessment created successfully.",
    assessmentId: assessment._id,
  });
});

// @desc    Get assessments by Class and Subject
// @route   GET /api/assessments/class/:classId/subject/:subjectId
// @access  Private
const getAssessmentsByClassAndSubject = asyncHandler(async (req, res) => {
  const { classId, subjectId } = req.params;

  const assessments = await Assessment.find({
    classId,
    subject: subjectId,
  })
    .populate("student", "firstName lastName admissionNumber")
    .lean();

  if (!assessments.length) {
    return res.status(404).json({ message: "No assessments found." });
  }

  res.json(assessments);
});

// @desc    Get assessments by Subject ID
// @route   GET /api/assessments/subject/:subjectId
// @access  Private
const getAssessmentsBySubjectId = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;

  if (!subjectId) {
    return res.status(400).json({ message: "Subject ID is required." });
  }

  const assessments = await Assessment.find({ subject: subjectId })
    .populate("student", "firstName lastName admissionNumber")
    .populate("subject", "name code")
    .populate("classId", "className grade section")
    .lean();

  if (!assessments || assessments.length === 0) {
    return res
      .status(404)
      .json({ message: "No assessments found for this subject." });
  }

  res.json(assessments);
});

// @desc    Update assessment
// @route   PATCH /api/assessments
// @access  Private
const updateAssessment = asyncHandler(async (req, res) => {
  const {
    id,
    student,
    subject,
    classId,
    assessmentType,
    title,
    date,
    totalMarks,
    scoredMarks,
    comments,
    term,
    academicYear,
    createdBy,
  } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Assessment ID is required." });
  }

  const assessment = await Assessment.findById(id);
  if (!assessment) {
    return res.status(404).json({ message: "Assessment not found." });
  }

  // Update fields
  assessment.student = student ?? assessment.student;
  assessment.subject = subject ?? assessment.subject;
  assessment.classId = classId ?? assessment.classId;
  assessment.assessmentType = assessmentType ?? assessment.assessmentType;
  assessment.title = title ?? assessment.title;
  assessment.date = date ?? assessment.date;
  assessment.totalMarks = totalMarks ?? assessment.totalMarks;
  assessment.scoredMarks = scoredMarks ?? assessment.scoredMarks;
  assessment.comments = comments ?? assessment.comments;
  assessment.term = term ?? assessment.term;
  assessment.academicYear = academicYear ?? assessment.academicYear;
  assessment.createdBy = createdBy ?? assessment.createdBy;

  const updated = await assessment.save();

  res.json({
    message: "Assessment updated successfully.",
    updatedAssessment: updated,
  });
});

// @desc    Delete assessment
// @route   DELETE /api/assessments
// @access  Private
const deleteAssessment = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id)
    return res.status(400).json({ message: "Assessment ID is required." });

  const assessment = await Assessment.findById(id);
  if (!assessment)
    return res.status(404).json({ message: "Assessment not found." });

  await assessment.deleteOne();

  res.json({ message: "Assessment deleted successfully." });
});

// @desc    Get overall grade for a student (Nigerian grading system)
// @route   GET /api/assessments/overall-grade/:studentId
// @access  Private
const getOverallGradeByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required." });
  }

  // Fetch all assessments for the student
  const assessments = await Assessment.find({ student: studentId }).lean();

  if (!assessments.length) {
    return res
      .status(404)
      .json({ message: "No assessments found for this student." });
  }

  // Calculate totals
  let totalMarksSum = 0;
  let scoredMarksSum = 0;

  assessments.forEach((a) => {
    totalMarksSum += a.totalMarks;
    scoredMarksSum += a.scoredMarks;
  });

  const percentage = ((scoredMarksSum / totalMarksSum) * 100).toFixed(2);

  // Nigerian grading system
  let grade, remark;
  if (percentage >= 70) {
    grade = "A";
    remark = "Excellent";
  } else if (percentage >= 60) {
    grade = "B";
    remark = "Very Good";
  } else if (percentage >= 50) {
    grade = "C";
    remark = "Good";
  } else if (percentage >= 45) {
    grade = "D";
    remark = "Fair";
  } else if (percentage >= 40) {
    grade = "E";
    remark = "Pass";
  } else {
    grade = "F";
    remark = "Fail";
  }

  res.json({
    studentId,
    totalMarks: totalMarksSum,
    scoredMarks: scoredMarksSum,
    percentage: `${percentage}%`,
    grade,
    remark,
  });
});

module.exports = {
  getAllAssessments,
  getAssessmentById,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentsBySubjectId,
  getAssessmentsByClassAndSubject,
  getOverallGradeByStudent,
};
