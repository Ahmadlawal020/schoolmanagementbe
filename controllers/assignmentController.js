const Assignment = require("../models/assignmentSchema");
const Assessment = require("../models/assessmentSchema");
const asyncHandler = require("express-async-handler");
const Class = require("../models/classSchema");

// Create new assignment
const createAssignment = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    format,
    attachments,
    classId,
    subjectId,
    teacherId,
    dueDate,
    academicYear,
  } = req.body;

  if (
    !title ||
    !description ||
    !format ||
    !classId ||
    !subjectId ||
    !teacherId ||
    !dueDate ||
    !academicYear
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided." });
  }

  const assignment = await Assignment.create({
    title,
    description,
    format,
    attachments,
    classId,
    subjectId,
    teacherId,
    dueDate,
    academicYear,
  });

  res.status(201).json({
    message: "Assignment created successfully.",
    assignmentId: assignment._id,
  });
});

// Get all assignments
const getAllAssignments = asyncHandler(async (req, res) => {
  const assignments = await Assignment.find()
    .populate({
      path: "classId",
      populate: {
        path: "students",
        select: "_id",
      },
    })
    .populate("subjectId", "name code")
    .populate("teacherId", "firstName lastName")
    .populate("submissions.studentId", "firstName lastName admissionNumber")
    .populate("submissions.teacherFeedback.assessmentId");

  if (!assignments.length) {
    return res.status(404).json({ message: "No assignments found." });
  }

  res.status(200).json(assignments);
});

// Get assignments by teacher
const getAssignmentsByTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;

  const assignments = await Assignment.find({ teacherId })
    .populate({
      path: "classId",
      populate: {
        path: "students",
        select: "_id",
      },
    })
    .populate("subjectId", "name code")
    .populate("teacherId", "firstName lastName")
    .populate("submissions.studentId", "firstName lastName admissionNumber")
    .populate("submissions.teacherFeedback.assessmentId");

  if (!assignments.length) {
    return res
      .status(404)
      .json({ message: "No assignments found for this teacher." });
  }

  res.status(200).json(assignments);
});

// Get assignments by class
const getAssignmentsByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  const assignments = await Assignment.find({ classId })
    .populate({
      path: "classId",
      select: "className grade section academicYear students",
      populate: {
        path: "students",
        select: "firstName lastName admissionNumber",
      },
    })
    .populate("subjectId", "name code")
    .populate("teacherId", "firstName lastName")
    .populate("submissions.studentId", "firstName lastName admissionNumber")
    .populate("submissions.teacherFeedback.assessmentId");

  if (!assignments.length) {
    return res
      .status(404)
      .json({ message: "No assignments found for this class." });
  }

  res.status(200).json(assignments);
});

const getAssignmentsByStudentId = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required." });
  }

  // Step 1: Find classes where the student is enrolled
  const classes = await Class.find({ students: studentId }).select("_id");

  if (!classes.length) {
    return res
      .status(404)
      .json({ message: "Student is not assigned to any class." });
  }

  const classIds = classes.map((cls) => cls._id);

  // Step 2: Find assignments for those classes
  const assignments = await Assignment.find({ classId: { $in: classIds } })
    .populate("classId", "className grade section academicYear")
    .populate("subjectId", "name code")
    .populate("teacherId", "firstName lastName")
    .populate("submissions.studentId", "firstName lastName admissionNumber")
    .populate("submissions.teacherFeedback.assessmentId");

  if (!assignments.length) {
    return res
      .status(404)
      .json({ message: "No assignments found for this student." });
  }

  // Step 3: Filter to include only this student's submission (if exists)
  const filteredAssignments = assignments.map((assignment) => {
    const studentSubmission = assignment.submissions.find(
      (sub) => sub.studentId && sub.studentId._id.toString() === studentId
    );

    return {
      ...assignment.toObject(),
      submissions: studentSubmission ? [studentSubmission] : [],
    };
  });

  res.status(200).json(filteredAssignments);
});

// Get assignment by ID
const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate({
      path: "classId",
      select: "className grade section academicYear students",
      populate: {
        path: "students",
        select: "firstName lastName admissionNumber",
      },
    })
    .populate("subjectId", "name code")
    .populate("teacherId", "firstName lastName")
    .populate("submissions.studentId", "firstName lastName admissionNumber")
    .populate("submissions.teacherFeedback.assessmentId");

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found" });
  }

  res.status(200).json(assignment);
});

// Submit assignment (by student)
const submitAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId, textResponse, imageUrls, pdfUrls } = req.body;

  if (!studentId) {
    return res.status(400).json({ message: "Student ID is required." });
  }

  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found." });
  }

  let submission = assignment.submissions.find(
    (s) => s.studentId.toString() === studentId.toString()
  );

  if (submission) {
    submission.content = { textResponse, imageUrls, pdfUrls };
    submission.submittedAt = new Date();
    submission.status = "Submitted";
  } else {
    assignment.submissions.push({
      studentId,
      content: { textResponse, imageUrls, pdfUrls },
      status: "Submitted",
    });
  }

  await assignment.save();
  res.status(200).json({ message: "Assignment submitted successfully." });
});

// Review submission (by teacher)
const reviewSubmission = asyncHandler(async (req, res) => {
  const { id, studentId } = req.params;
  const { scoredMarks, totalMarks, comments, grade, term, teacherId } =
    req.body;

  if (!teacherId) {
    return res.status(400).json({ message: "Teacher ID is required." });
  }

  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found." });
  }

  const submission = assignment.submissions.find(
    (s) => s.studentId.toString() === studentId.toString()
  );

  if (!submission) {
    return res
      .status(404)
      .json({ message: "Submission not found for this student." });
  }

  const assessment = await Assessment.findOneAndUpdate(
    {
      student: studentId,
      subject: assignment.subjectId,
      classId: assignment.classId,
      academicYear: assignment.academicYear,
      assessmentType: "Assignment",
      title: assignment.title,
    },
    {
      $set: {
        totalMarks,
        scoredMarks,
        comments,
        term,
        date: new Date(),
        createdBy: teacherId,
      },
    },
    { upsert: true, new: true }
  );

  submission.status = "Reviewed";
  submission.teacherFeedback = {
    comments,
    grade,
    scoredMarks,
    totalMarks,
    reviewedAt: new Date(),
    assessmentId: assessment._id,
  };

  await assignment.save();

  res.status(200).json({
    message: "Submission reviewed and assessment updated.",
    assessment,
  });
});

// Delete assignment
const deleteAssignment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found." });
  }

  await assignment.deleteOne();
  res.status(200).json({ message: "Assignment deleted successfully." });
});

module.exports = {
  createAssignment,
  getAllAssignments,
  getAssignmentsByTeacher,
  getAssignmentsByClass,
  getAssignmentById,
  submitAssignment,
  reviewSubmission,
  deleteAssignment,
  getAssignmentsByStudentId,
};
