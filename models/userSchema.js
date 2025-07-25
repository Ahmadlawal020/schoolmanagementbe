const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Identification
    userId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    otherNames: String,
    title: {
      type: String,
      enum: ["Mr", "Mrs", "Miss", "Dr", "Prof"],
    },

    // Role & Status
    role: {
      type: [String],
      required: true,
      enum: ["Admin", "Teacher", "Parent", "Other"],
    },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Sick", "Suspended", "Retired"],
      default: "Active",
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true, select: false },
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,

    // Staff-specific
    department: String,
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    permissions: [
      {
        module: String,
        canView: Boolean,
        canEdit: Boolean,
        canDelete: Boolean,
      },
    ],

    qualifications: [
      {
        title: { type: String },
        type: {
          type: String,
          enum: [
            "Degree",
            "Diploma",
            "Certificate",
            "License",
            "Award",
            "Other",
          ],
        },
        institution: { type: String },
        year: { type: Number },
      },
    ],

    // Parent-specific
    children: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        relationship: {
          type: String,
          enum: ["Father", "Mother", "Guardian", "Other"],
        },
      },
    ],
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
      canPickup: Boolean,
    },
    hasCustody: { type: Boolean, default: true },
    medicalConsent: { type: Boolean, default: true },
    occupation: String,

    // Contact
    phone: String,
    alternatePhone: String,
    address: String,

    // Personal Info
    dateOfBirth: Date,
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    maritalStatus: String,
    bloodGroup: String,

    // Preferences
    preferredLanguage: { type: String, default: "English" },
    receiveSMS: { type: Boolean, default: true },
    receiveEmail: { type: Boolean, default: true },

    // Status
    isActive: { type: Boolean, default: true },

    // Audit fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
