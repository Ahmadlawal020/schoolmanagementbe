const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllStaffs,
  getDepartments,
  getAllParents,
  getStudentsByUserId,
} = require("../controllers/userController");

// GET /api/users/staffs → getAllStaffs
router.get("/staffs", getAllStaffs);

router.get("/parents", getAllParents);
router.get("/departments", getDepartments);

// Main route for CRUD on users
router
  .route("/")
  .get(getAllUsers)
  .post(createUser)
  .patch(updateUser)
  .delete(deleteUser);

router.get("/children/:userId", getStudentsByUserId);

// GET /api/users/:id → get single user
router.route("/:id").get(getUserById);

module.exports = router;
