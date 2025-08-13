const Class = require("../models/classSchema");
const asyncHandler = require("express-async-handler");

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
const getAllClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find()
    .populate("classTeacher", "firstName lastName")
    .populate("students", "firstName lastName admissionNumber")
    .populate("subjects", "name")
    .lean();

  if (!classes?.length) {
    return res.status(404).json({ message: "No classes found." });
  }

  res.json(classes);
});

// @desc    Get class by ID
// @route   GET /api/classes/:id
// @access  Private
const getClassById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const classData = await Class.findById(id)
    .populate("classTeacher", "firstName lastName")
    .populate(
      "students",
      "firstName lastName admissionNumber photo middleName currentClass"
    )

    .populate(
      "subjects",
      "name code isCompulsory department teacherIds academicYear"
    )

    .lean();

  if (!classData) {
    return res.status(404).json({ message: "Class not found." });
  }

  res.json(classData);
});

const createClass = asyncHandler(async (req, res) => {
  const {
    className,
    grade,
    section,
    academicYear,
    classTeacher,
    roomNumber,
    maxCapacity,
    status,
    students = [],
    subjects = [],
  } = req.body;

  if (!className || !grade || !academicYear || !classTeacher) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  // ✅ Check for same name + same academic year
  const duplicate = await Class.findOne({
    className,
    academicYear,
  })
    .lean()
    .exec();

  if (duplicate) {
    return res.status(409).json({
      message:
        "A class with this name already exists in the same academic year.",
    });
  }

  const classObject = {
    className,
    grade,
    section,
    academicYear,
    classTeacher,
    roomNumber,
    maxCapacity,
    status,
    students,
    subjects,
  };

  const newClass = await Class.create(classObject);

  if (!newClass) {
    return res.status(400).json({ message: "Invalid class data." });
  }

  res.status(201).json({
    message: `Class ${newClass.className} created successfully.`,
  });
});

// @desc    Update a class
// @route   PATCH /api/classes
// @access  Private
const updateClass = asyncHandler(async (req, res) => {
  const { id, className, grade, academicYear, classTeacher, ...updateData } =
    req.body;

  if (!id) {
    return res.status(400).json({ message: "Class ID is required." });
  }

  const classData = await Class.findById(id).exec();
  if (!classData) {
    return res.status(404).json({ message: "Class not found." });
  }

  if (
    (className && className !== classData.className) ||
    (academicYear && academicYear !== classData.academicYear)
  ) {
    const duplicate = await Class.findOne({
      className: className || classData.className,
      academicYear: academicYear || classData.academicYear,
      _id: { $ne: id },
    })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({
        message:
          "A class with this name already exists in the same academic year.",
      });
    }
  }

  classData.grade = grade ?? classData.grade;
  classData.academicYear = academicYear ?? classData.academicYear;
  classData.classTeacher = classTeacher ?? classData.classTeacher;

  Object.assign(classData, updateData);
  classData.updatedAt = new Date();

  const updatedClass = await classData.save();

  res.json({
    message: `Class ${updatedClass.className} updated successfully.`,
  });
});

// @desc    Delete a class
// @route   DELETE /api/classes
// @access  Private
const deleteClass = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Class ID is required." });
  }

  const classData = await Class.findById(id).exec();
  if (!classData) {
    return res.status(404).json({ message: "Class not found." });
  }

  await classData.deleteOne();

  res.json({ message: `Class ${classData.className} deleted successfully.` });
});

// @desc    Get all classes by class teacher ID
// @route   GET /api/classes/teacher/:teacherId
// @access  Private
const getClassesByTeacherId = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;

  if (!teacherId) {
    return res.status(400).json({ message: "Teacher ID is required." });
  }

  const classes = await Class.find({ classTeacher: teacherId })
    .populate("classTeacher", "firstName lastName email") // optional
    .populate("students", "firstName lastName admissionNumber")
    .populate("subjects", "name teacherIds")
    .lean();

  if (!classes.length) {
    return res
      .status(404)
      .json({ message: "No classes found for this teacher." });
  }

  res.json(classes);
});

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassesByTeacherId,
};
