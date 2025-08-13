const Subject = require("../models/subjectSchema");
const asyncHandler = require("express-async-handler");

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getAllSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find().lean();

  if (!subjects?.length) {
    return res.status(404).json({ message: "No subjects found." });
  }

  res.json(subjects);
});

// @desc    Get subject by ID
// @route   GET /api/subjects/:id
// @access  Private
const getSubjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subject = await Subject.findById(id).lean();

  if (!subject) {
    return res.status(404).json({ message: "Subject not found." });
  }

  res.json(subject);
});

// @desc    Get all subjects assigned to a specific teacher
// @route   GET /api/subjects/teacher/:teacherId
// @access  Private
const getSubjectsByTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;

  if (!teacherId) {
    return res.status(400).json({ message: "Teacher ID is required." });
  }

  const subjects = await Subject.find({ teacherIds: teacherId }).lean();

  if (!subjects.length) {
    return res
      .status(404)
      .json({ message: "No subjects found for this teacher." });
  }

  res.json(subjects);
});

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
const createSubject = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    description,
    gradeLevels,
    department,
    teacherIds,

    isCompulsory,
  } = req.body;

  if (!name || !code || !gradeLevels) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  const duplicate = await Subject.findOne({ code }).lean().exec();
  if (duplicate) {
    return res.status(409).json({ message: "Subject code already exists." });
  }

  const subject = await Subject.create({
    name,
    code,
    description,
    gradeLevels,
    department,
    teacherIds,
    isCompulsory,
  });

  if (!subject) {
    return res.status(400).json({ message: "Invalid subject data." });
  }

  res.status(201).json({ message: `Subject ${name} created successfully.` });
});

// @desc    Update subject
// @route   PATCH /api/subjects
// @access  Private
const updateSubject = asyncHandler(async (req, res) => {
  const {
    id,
    name,
    code,
    description,
    gradeLevels,
    department,
    teacherIds,
    isCompulsory,
  } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Subject ID is required." });
  }

  const subject = await Subject.findById(id).exec();
  if (!subject) {
    return res.status(404).json({ message: "Subject not found." });
  }

  // Prevent duplicate subject codes
  if (code) {
    const duplicate = await Subject.findOne({ code }).lean().exec();
    if (duplicate && duplicate._id.toString() !== id) {
      return res.status(409).json({ message: "Subject code already in use." });
    }
  }

  subject.name = name ?? subject.name;
  subject.code = code ?? subject.code;
  subject.description = description ?? subject.description;
  subject.gradeLevels = gradeLevels ?? subject.gradeLevels;
  subject.department = department ?? subject.department;
  subject.teacherIds = Array.isArray(teacherIds)
    ? teacherIds
    : subject.teacherIds;
  subject.isCompulsory =
    typeof isCompulsory === "boolean" ? isCompulsory : subject.isCompulsory;

  const updated = await subject.save();

  res.json({
    message: `Subject ${updated.name} updated successfully.`,
  });
});

// @desc    Delete subject
// @route   DELETE /api/subjects
// @access  Private
const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ message: "Subject ID required." });

  const subject = await Subject.findById(id).exec();
  if (!subject) return res.status(404).json({ message: "Subject not found." });

  await subject.deleteOne();

  res.json({ message: `Subject ${subject.name} deleted successfully.` });
});

// @desc    Get all subjects by department
// @route   GET /api/subjects/department/:department
// @access  Private
const getSubjectsByDepartment = asyncHandler(async (req, res) => {
  const { department } = req.params;

  const subjects = await Subject.find({ department }).lean();

  if (!subjects?.length) {
    return res
      .status(404)
      .json({ message: "No subjects found for this department." });
  }

  res.json(subjects);
});

module.exports = {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByDepartment,
  getSubjectsByTeacher,
};
