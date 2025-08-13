const Fees = require("../models/feesSchema");
const Student = require("../models/studentSchema");
const asyncHandler = require("express-async-handler");

// @desc    Get all fees records
// @route   GET /api/fees
// @access  Private
const getAllFees = asyncHandler(async (req, res) => {
  const fees = await Fees.find()
    .populate(
      "payments.student",
      "admissionNumber firstName lastName gradeLevel"
    )
    .lean();

  if (!fees?.length) {
    return res.status(404).json({ message: "No fees records found." });
  }

  res.json(fees);
});

// @desc    Get fee record by ID
// @route   GET /api/fees/:id
// @access  Private
const getFeeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const fee = await Fees.findById(id)
    .populate(
      "payments.student",
      "admissionNumber firstName lastName gradeLevel"
    )
    .lean();

  if (!fee) {
    return res.status(404).json({ message: "Fee record not found." });
  }

  res.json(fee);
});

// @desc    Create a new fee record and assign to matching students
// @route   POST /api/fees
// @access  Private
const createFee = asyncHandler(async (req, res) => {
  const { name, gradeLevel, academicYear, term, amount, dueDate, notes } =
    req.body;

  if (
    !name ||
    !gradeLevel ||
    !academicYear ||
    !term ||
    amount == null ||
    !dueDate
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided." });
  }

  // 1️⃣ Create the fee
  const fee = await Fees.create({
    name,
    gradeLevel,
    academicYear,
    term,
    amount,
    dueDate,
    notes,
  });

  // 2️⃣ Find all students with the same grade level
  const students = await Student.find({ gradeLevel });

  if (students.length) {
    // 3️⃣ Add this fee to each matching student
    await Student.updateMany({ gradeLevel }, { $addToSet: { fees: fee._id } });
  }

  res.status(201).json({
    message: `Fee created and assigned to ${students.length} student(s).`,
    feeId: fee._id,
  });
});

// @desc    Update fee record
// @route   PATCH /api/fees
// @access  Private
const updateFee = asyncHandler(async (req, res) => {
  const { id, name, gradeLevel, academicYear, term, amount, dueDate, notes } =
    req.body;

  if (!id) {
    return res.status(400).json({ message: "Fee ID is required." });
  }

  const fee = await Fees.findById(id);

  if (!fee) {
    return res.status(404).json({ message: "Fee record not found." });
  }

  const gradeLevelChanged = gradeLevel && gradeLevel !== fee.gradeLevel;

  fee.name = name ?? fee.name;
  fee.gradeLevel = gradeLevel ?? fee.gradeLevel;
  fee.academicYear = academicYear ?? fee.academicYear;
  fee.term = term ?? fee.term;
  fee.amount = amount ?? fee.amount;
  fee.dueDate = dueDate ?? fee.dueDate;
  fee.notes = notes ?? fee.notes;

  const updated = await fee.save();

  // If grade level changed, update student assignments
  if (gradeLevelChanged) {
    await Student.updateMany({ fees: fee._id }, { $pull: { fees: fee._id } });
    await Student.updateMany(
      { gradeLevel: updated.gradeLevel },
      { $addToSet: { fees: updated._id } }
    );
  }

  res.json({
    message: "Fee record updated successfully.",
    updatedFee: updated,
  });
});

// @desc    Delete fee record and remove from students
// @route   DELETE /api/fees
// @access  Private
const deleteFee = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Fee ID is required." });
  }

  const fee = await Fees.findById(id);

  if (!fee) {
    return res.status(404).json({ message: "Fee record not found." });
  }

  await Student.updateMany({ fees: fee._id }, { $pull: { fees: fee._id } });
  await fee.deleteOne();

  res.json({ message: "Fee record deleted successfully." });
});

// @desc    Record a payment for a student
// @route   POST /api/fees/:id/pay
// @access  Private
const recordPayment = asyncHandler(async (req, res) => {
  const { id } = req.params; // fee ID
  const { studentId, paidAmount, paymentMethod, transactionId, remarks } =
    req.body;

  if (!studentId || paidAmount == null) {
    return res
      .status(400)
      .json({ message: "Student ID and paid amount are required." });
  }

  const fee = await Fees.findById(id);
  if (!fee) {
    return res.status(404).json({ message: "Fee record not found." });
  }

  // Check if student already paid for this fee
  const existingPayment = fee.payments.find(
    (p) => p.student.toString() === studentId
  );
  if (existingPayment) {
    return res
      .status(400)
      .json({ message: "Student has already paid this fee." });
  }

  // Add new payment
  fee.payments.push({
    student: studentId,
    paidAmount,
    paymentDate: new Date(),
    paymentMethod,
    transactionId,
    remarks,
  });

  await fee.save();

  res.json({ message: "Payment recorded successfully.", fee });
});

// @desc    Get unpaid fees for a student
// @route   GET /api/fees/unpaid/:studentId
// @access  Private
const getUnpaidFeesForStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const fees = await Fees.find({ gradeLevel: { $exists: true } }).lean();
  const unpaid = fees.filter(
    (fee) => !fee.payments.some((p) => p.student.toString() === studentId)
  );

  res.json(unpaid);
});

module.exports = {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
  recordPayment,
  getUnpaidFeesForStudent,
};
