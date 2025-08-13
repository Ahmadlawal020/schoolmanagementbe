const Student = require("../models/studentSchema");
const asyncHandler = require("express-async-handler");

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getAllStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().lean();

  if (!students?.length) {
    return res.status(404).json({ message: "No students found." });
  }

  res.json(students);
});

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await Student.findById(id).lean();

  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }

  res.json(student);
});

// @desc    Create a new student
// @route   POST /api/students
// @access  Private
const createStudent = asyncHandler(async (req, res) => {
  const {
    admissionNumber,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    gradeLevel, // changed from currentClass
    admissionDate,
    primaryContact,
    address,
    ...otherFields
  } = req.body;

  // Basic required field checks
  if (
    !admissionNumber ||
    !firstName ||
    !lastName ||
    !dateOfBirth ||
    !gender ||
    !gradeLevel || // updated validation
    !admissionDate ||
    !primaryContact?.name ||
    !primaryContact?.relationship ||
    !primaryContact?.phone ||
    !address?.city
  ) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  const duplicate = await Student.findOne({ admissionNumber }).lean().exec();
  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Admission number already exists." });
  }

  const studentObject = {
    admissionNumber,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    gradeLevel, // replaced currentClass
    admissionDate,
    primaryContact,
    address,
    ...otherFields,
  };

  const student = await Student.create(studentObject);

  if (!student) {
    return res.status(400).json({ message: "Invalid student data." });
  }

  res.status(201).json({
    message: `Student ${student.firstName} ${student.lastName} created successfully.`,
  });
});

// @desc    Update a student
// @route   PATCH /api/students
// @access  Private
const updateStudent = asyncHandler(async (req, res) => {
  const { id, admissionNumber, firstName, lastName, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Student ID is required." });
  }

  const student = await Student.findById(id).exec();
  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }

  // Check for duplicate admission number
  if (admissionNumber && admissionNumber !== student.admissionNumber) {
    const duplicate = await Student.findOne({ admissionNumber }).lean().exec();
    if (duplicate) {
      return res
        .status(409)
        .json({ message: "Admission number already exists." });
    }
    student.admissionNumber = admissionNumber;
  }

  student.firstName = firstName ?? student.firstName;
  student.lastName = lastName ?? student.lastName;

  Object.assign(student, updateData);
  student.updatedAt = new Date();

  const updatedStudent = await student.save();

  res.json({
    message: `Student ${updatedStudent.firstName} ${updatedStudent.lastName} updated successfully.`,
  });
});

// @desc    Delete a student
// @route   DELETE /api/students
// @access  Private
const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Student ID is required." });
  }

  const student = await Student.findById(id).exec();
  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }

  await student.deleteOne();

  res.json({
    message: `Student ${student.firstName} ${student.lastName} deleted successfully.`,
  });
});

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
