const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    // Basic Info
    title: { type: String, required: true },
    description: { type: String },

    // Time & Duration
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    allDay: { type: Boolean, default: false },

    // Location
    location: { type: String },

    // Type & Category
    type: {
      type: String,
      enum: ["Academic", "Meeting", "Holiday", "Sports", "Cultural", "Other"],
      default: "Other",
    },
    tags: [String],

    // Audience
    visibleToRoles: {
      type: [String],
      enum: ["Admin", "Teacher", "Parent", "Other"],
      default: ["Admin", "Teacher", "Parent"],
    },

    // Participants
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Reminder & Notification
    reminders: [
      {
        timeBefore: { type: Number }, // in minutes
        method: { type: String, enum: ["Email", "SMS", "Push"] },
      },
    ],

    // Optional recurrence
    recurrence: {
      frequency: {
        type: String,
        enum: ["Daily", "Weekly", "Monthly", "Yearly"],
      },
      interval: { type: Number, default: 1 }, // every n days/weeks/etc.
      until: { type: Date },
    },

    // Status & Visibility
    status: {
      type: String,
      enum: ["Scheduled", "Cancelled", "Completed"],
      default: "Scheduled",
    },
    visibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public",
    },

    // Files / Attachments
    attachments: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],

    // Audit fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
