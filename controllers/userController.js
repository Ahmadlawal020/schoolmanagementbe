const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").lean();

  if (!users?.length) {
    return res.status(404).json({ message: "No users found." });
  }

  res.json(users);
});

// @desc    Get all staff users (admins and teachers)
// @route   GET /api/users/staffs
// @access  Private
const getAllStaffs = asyncHandler(async (req, res) => {
  const staffRoles = ["Admin", "Teacher"];

  const users = await User.find({ role: { $in: staffRoles } })
    .select("-password")
    .lean();

  if (!users?.length) {
    return res.status(404).json({ message: "No staff users found." });
  }

  res.json(users);
});

// @desc    Get all parent users
// @route   GET /api/users/parents
// @access  Private
const getAllParents = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $in: ["Parent"] } })
    .select("-password")
    .lean();

  if (!users?.length) {
    return res.status(404).json({ message: "No parent users found." });
  }

  res.json(users);
});

// GET /api/departments
const getDepartments = async (req, res) => {
  try {
    const departments = await User.distinct("department", {
      department: { $ne: null },
    });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch departments" });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .select("-password")
    .populate(
      "children.studentId",
      "firstName lastName admissionNumber currentClass.grade"
    )
    .lean();

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.json(user);
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private
const createUser = asyncHandler(async (req, res) => {
  const {
    userId,
    firstName,
    lastName,
    email,
    password,
    role,
    title,
    phone,
    gender,
    department,
    subjects,
    children,
    permissions,
    isActive,
    employmentType,
    ...otherFields
  } = req.body;

  if (!userId || !firstName || !lastName || !email || !password || !role) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  const duplicateEmail = await User.findOne({ email }).lean().exec();
  if (duplicateEmail) {
    return res.status(409).json({ message: "Email already in use." });
  }

  const duplicateId = await User.findOne({ userId }).lean().exec();
  if (duplicateId) {
    return res.status(409).json({ message: "User ID already in use." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userObject = {
    userId,
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: Array.isArray(role) ? role : [role],
    title,
    phone,
    gender,
    department,
    subjects,
    children,
    permissions,
    isActive: typeof isActive === "boolean" ? isActive : true,
    ...otherFields,
  };

  const user = await User.create(userObject);

  if (!user) {
    return res.status(400).json({ message: "Invalid user data." });
  }

  res.status(201).json({
    message: `User ${user.firstName} ${user.lastName} created successfully.`,
  });
});

// @desc    Update user
// @route   PATCH /api/users
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const {
    id,
    userId,
    firstName,
    lastName,
    email,
    password,
    role,
    title,
    phone,
    alternatePhone,
    gender,
    department,
    relationship,
    subjects,
    children,
    permissions,
    qualifications,
    emergencyContact,
    hasCustody,
    medicalConsent,
    occupation,
    address,
    preferredLanguage,
    receiveSMS,
    receiveEmail,
    dateOfBirth,
    maritalStatus,
    bloodGroup,
    isActive,
    updatedBy,
    ...otherFields
  } = req.body;

  if (!id || !email) {
    return res.status(400).json({ message: "User ID and email are required." });
  }

  const user = await User.findById(id).exec();
  if (!user) return res.status(404).json({ message: "User not found." });

  const duplicateEmail = await User.findOne({ email }).lean().exec();
  if (duplicateEmail && duplicateEmail._id.toString() !== id) {
    return res.status(409).json({ message: "Email already in use." });
  }

  // Optional: Validate uniqueness of children
  if (children) {
    const ids = children.map((c) =>
      typeof c.studentId === "string" ? c.studentId : c.studentId.toString()
    );
    const uniqueChildIds = [...new Set(ids)];
    if (uniqueChildIds.length !== ids.length) {
      return res
        .status(400)
        .json({ message: "Duplicate child entries found." });
    }
  }

  user.userId = userId ?? user.userId;
  user.firstName = firstName ?? user.firstName;
  user.lastName = lastName ?? user.lastName;
  user.email = email;
  user.phone = phone ?? user.phone;
  user.alternatePhone = alternatePhone ?? user.alternatePhone;
  user.gender = gender ?? user.gender;
  user.department = department ?? user.department;
  user.relationship = relationship ?? user.relationship;
  user.title = title ?? user.title;
  user.subjects = subjects ?? user.subjects;
  user.children = children ?? user.children;
  user.permissions = permissions ?? user.permissions;
  user.qualifications = qualifications ?? user.qualifications;
  user.emergencyContact = emergencyContact ?? user.emergencyContact;
  user.hasCustody = hasCustody ?? user.hasCustody;
  user.medicalConsent = medicalConsent ?? user.medicalConsent;
  user.occupation = occupation ?? user.occupation;
  user.address = address ?? user.address;
  user.preferredLanguage = preferredLanguage ?? user.preferredLanguage;
  user.receiveSMS =
    typeof receiveSMS === "boolean" ? receiveSMS : user.receiveSMS;
  user.receiveEmail =
    typeof receiveEmail === "boolean" ? receiveEmail : user.receiveEmail;
  user.dateOfBirth = dateOfBirth ?? user.dateOfBirth;
  user.maritalStatus = maritalStatus ?? user.maritalStatus;
  user.bloodGroup = bloodGroup ?? user.bloodGroup;
  user.updatedBy = updatedBy ?? user.updatedBy;
  user.role = role ? (Array.isArray(role) ? role : [role]) : user.role;
  user.isActive = typeof isActive === "boolean" ? isActive : user.isActive;

  // ✅ Conditionally assign other dynamic fields
  for (const [key, value] of Object.entries(otherFields)) {
    if (value !== undefined) {
      user[key] = value;
    }
  }

  if (password) {
    user.password = await bcrypt.hash(password, 10);
  }

  user.updatedAt = new Date();

  const updated = await user.save();

  res.json({
    message: `User ${updated.firstName} ${updated.lastName} updated successfully.`,
  });
});

// @desc    Delete user
// @route   DELETE /api/users
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) return res.status(400).json({ message: "User ID required." });

  const user = await User.findById(id).exec();
  if (!user) return res.status(404).json({ message: "User not found." });

  await user.deleteOne();

  res.json({
    message: `User ${user.firstName} ${user.lastName} deleted successfully.`,
  });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllStaffs,
  getDepartments,
  getAllParents,
};
