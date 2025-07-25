const mongoose = require("mongoose");
const { Schema } = mongoose;

const studentSchema = new Schema(
  {
    // Core Identification
    admissionNumber: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    middleName: { type: String }, // Optional
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    nationality: { type: String },
    religion: { type: String },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    photo: { type: String }, // URL to stored image

    // Parent/Guardian Info
    primaryContact: {
      name: { type: String, required: true },
      relationship: { type: String, required: true },
      phone: { type: String, required: true },
      email: {
        type: String,
      },
    },
    emergencyContacts: [
      {
        name: { type: String },
        relationship: { type: String },
        phone: { type: String },
      },
    ],

    // Address
    address: {
      street: { type: String },
      city: { type: String, required: true },
    },

    // Academic Info
    currentClass: {
      grade: { type: String, required: true },
      section: { type: String },
      rollNumber: { type: String },
      house: { type: String },
    },
    admissionDate: { type: Date, required: true },
    previousSchool: { type: String },
    academicHistory: [
      {
        year: { type: String },
        class: { type: String },
        result: { type: String },
        remarks: { type: String },
      },
    ],

    // Health
    allergies: { type: [String], default: [] },
    medicalConditions: { type: [String], default: [] },
    vaccinationRecords: [
      {
        name: { type: String },
        date: { type: Date },
      },
    ],
    disability: { type: String },
    emergencyInstructions: { type: String },

    // System Info
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended", "Graduated", "Transferred"],
      default: "Active",
    },
    isActive: { type: Boolean, default: true },
    archived: { type: Boolean, default: false },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    lastModifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
