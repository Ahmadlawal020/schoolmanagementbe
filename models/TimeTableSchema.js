const mongoose = require("mongoose");

// Period schema: subject is referenced by ObjectId from "Subject"
const PeriodSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
});

// Each day’s schedule
const DayScheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
  },
  periods: {
    type: [PeriodSchema],
    default: [],
  },
});

const TimetableSchema = new mongoose.Schema({
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
    // unique: true,
  },
  schedule: {
    type: [DayScheduleSchema],
    required: true,
  },
});

const Timetable = mongoose.model("Timetable", TimetableSchema);
module.exports = Timetable;
