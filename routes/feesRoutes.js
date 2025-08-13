const express = require("express");
const router = express.Router();
const {
  getAllFees,
  getFeeById,
  createFee,
  updateFee,
  deleteFee,
  recordPayment,
  getUnpaidFeesForStudent,
} = require("../controllers/feesControllers");

// @route   GET /api/fees
// @desc    Get all fees
router.get("/", getAllFees);

// @route   GET /api/fees/:id
// @desc    Get fee by ID
router.get("/:id", getFeeById);

// @route   POST /api/fees
// @desc    Create new fee
router.post("/", createFee);

// @route   PATCH /api/fees
// @desc    Update fee
router.patch("/", updateFee);

// @route   DELETE /api/fees
// @desc    Delete fee
router.delete("/", deleteFee);

// @route   POST /api/fees/:id/pay
// @desc    Record payment for a specific student
router.post("/:id/pay", recordPayment);

// @route   GET /api/fees/unpaid/:studentId
// @desc    Get all unpaid fees for a specific student
router.get("/unpaid/:studentId", getUnpaidFeesForStudent);

module.exports = router;
