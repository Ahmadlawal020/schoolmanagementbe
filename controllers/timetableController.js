// const Timetable = require("../models/TimeTableSchema");
// const asyncHandler = require("express-async-handler");

// // 🧾 Get all timetables (optionally filter by className)
// const getAllTimetables = asyncHandler(async (req, res) => {
//   const filter = req.query.className ? { className: req.query.className } : {};
//   const timetables = await Timetable.find(filter)
//     .populate("schedule.periods.subject")
//     .lean();

//   if (!timetables.length) {
//     return res.status(404).json({ message: "No timetables found." });
//   }
//   res.json(timetables);
// });

// // 📘 Get one timetable by ID
// const getTimetableById = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const tt = await Timetable.findById(id)
//     .populate("schedule.periods.subject")
//     .lean();
//   if (!tt) {
//     return res.status(404).json({ message: "Timetable not found." });
//   }
//   res.json(tt);
// });

// // ➕ Create new timetable
// const createTimetable = asyncHandler(async (req, res) => {
//   const { className, schedule } = req.body;
//   if (!className || !Array.isArray(schedule) || schedule.length === 0) {
//     return res.status(400).json({ message: "Missing required data." });
//   }

//   // Optional: ensure only Monday–Friday and no duplicates:
//   const days = schedule.map((d) => d.day);
//   const uniqueDays = new Set(days);
//   if (
//     uniqueDays.size !== days.length ||
//     [...uniqueDays].some(
//       (d) =>
//         ![
//           "Monday",
//           "Tuesday",
//           "Wednesday",
//           "Thursday",
//           "Friday",
//           "Saturday",
//           "Sunday",
//         ].includes(d)
//     )
//   ) {
//     return res
//       .status(400)
//       .json({ message: "Schedule must contain unique weekdays Mon–Fri." });
//   }

//   const tt = await Timetable.create({ className, schedule });
//   res.status(201).json({
//     message: `Timetable for ${tt.className} created.`,
//     id: tt._id,
//   });
// });

// // ✏️ Update an existing timetable
// const updateTimetable = asyncHandler(async (req, res) => {
//   const { id, className, schedule } = req.body;
//   if (!id || !className || !Array.isArray(schedule)) {
//     return res
//       .status(400)
//       .json({ message: "ID, className and schedule required." });
//   }

//   const tt = await Timetable.findById(id).exec();
//   if (!tt) return res.status(404).json({ message: "Timetable not found." });

//   tt.className = className;
//   tt.schedule = schedule;
//   tt.updatedAt = Date.now();

//   await tt.save();
//   res.json({ message: `Timetable ${tt.className} updated.` });
// });

// // 🗑️ Delete a timetable
// const deleteTimetable = asyncHandler(async (req, res) => {
//   const { id } = req.body;
//   if (!id) return res.status(400).json({ message: "ID required." });

//   const tt = await Timetable.findById(id).exec();
//   if (!tt) return res.status(404).json({ message: "Timetable not found." });

//   await tt.deleteOne();
//   res.json({ message: `Timetable for ${tt.className} deleted.` });
// });

// module.exports = {
//   getAllTimetables,
//   getTimetableById,
//   createTimetable,
//   updateTimetable,
//   deleteTimetable,
// };

const Timetable = require("../models/TimeTableSchema");
const asyncHandler = require("express-async-handler");

// 🧾 Get all timetables (optionally filter by class ID)
const getAllTimetables = asyncHandler(async (req, res) => {
  const filter = req.query.class ? { class: req.query.class } : {};

  const timetables = await Timetable.find(filter)
    .populate("class")
    .populate("schedule.periods.subject")
    .lean();

  if (!timetables.length) {
    return res.status(404).json({ message: "No timetables found." });
  }

  res.json(timetables);
});

// 📘 Get one timetable by ID
const getTimetableById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tt = await Timetable.findById(id)
    .populate("class")
    .populate("schedule.periods.subject")
    .lean();

  if (!tt) {
    return res.status(404).json({ message: "Timetable not found." });
  }

  res.json(tt);
});

// ➕ Create new timetable
const createTimetable = asyncHandler(async (req, res) => {
  const { class: classId, schedule } = req.body;

  if (!classId || !Array.isArray(schedule) || schedule.length === 0) {
    return res.status(400).json({ message: "Missing required data." });
  }

  // Check for existing timetable for the class
  const existing = await Timetable.findOne({ class: classId });
  if (existing) {
    return res
      .status(400)
      .json({ message: "Timetable already exists for this class." });
  }

  // Validate unique and valid days
  const days = schedule.map((d) => d.day);
  const uniqueDays = new Set(days);
  const allowedDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (uniqueDays.size !== days.length) {
    return res
      .status(400)
      .json({ message: "Duplicate days found in schedule." });
  }

  const invalidDays = days.filter((d) => !allowedDays.includes(d));
  if (invalidDays.length > 0) {
    return res.status(400).json({
      message: "Invalid days found in schedule.",
      invalidDays,
    });
  }

  // Validate periods
  for (const daySchedule of schedule) {
    if (!daySchedule.periods || !Array.isArray(daySchedule.periods)) {
      return res.status(400).json({
        message: `Invalid periods for ${daySchedule.day}`,
      });
    }

    for (const period of daySchedule.periods) {
      if (!period.startTime || !period.endTime || !period.subject) {
        return res.status(400).json({
          message: `Period in ${daySchedule.day} is missing required fields`,
        });
      }
    }
  }

  const tt = await Timetable.create({ class: classId, schedule });
  res.status(201).json({
    message: `Timetable for class created.`,
    id: tt._id,
  });
});

// ✏️ Update existing timetable
const updateTimetable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { class: classId, schedule } = req.body;

  if (!id || !classId || !Array.isArray(schedule)) {
    return res
      .status(400)
      .json({ message: "ID, class, and schedule are required." });
  }

  const tt = await Timetable.findById(id);
  if (!tt) return res.status(404).json({ message: "Timetable not found." });

  // Validate days (same as create)
  const days = schedule.map((d) => d.day);
  const uniqueDays = new Set(days);
  const allowedDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  if (uniqueDays.size !== days.length) {
    return res
      .status(400)
      .json({ message: "Duplicate days found in schedule." });
  }

  const invalidDays = days.filter((d) => !allowedDays.includes(d));
  if (invalidDays.length > 0) {
    return res.status(400).json({
      message: "Invalid days found in schedule.",
      invalidDays,
    });
  }

  // Validate periods
  for (const daySchedule of schedule) {
    if (!daySchedule.periods || !Array.isArray(daySchedule.periods)) {
      return res.status(400).json({
        message: `Invalid periods for ${daySchedule.day}`,
      });
    }

    for (const period of daySchedule.periods) {
      if (!period.startTime || !period.endTime || !period.subject) {
        return res.status(400).json({
          message: `Period in ${daySchedule.day} is missing required fields`,
        });
      }
    }
  }

  tt.class = classId;
  tt.schedule = schedule;

  const updatedTimetable = await tt.save();

  // Populate the references before returning
  const populatedTimetable = await Timetable.findById(updatedTimetable._id)
    .populate("class")
    .populate("schedule.periods.subject")
    .lean();

  res.json({
    message: `Timetable updated.`,
    timetable: populatedTimetable,
  });
});

// 🗑️ Delete timetable
const deleteTimetable = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) return res.status(400).json({ message: "ID is required." });

  const tt = await Timetable.findById(id);
  if (!tt) return res.status(404).json({ message: "Timetable not found." });

  await tt.deleteOne();
  res.json({ message: `Timetable deleted.` });
});

module.exports = {
  getAllTimetables,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
};
