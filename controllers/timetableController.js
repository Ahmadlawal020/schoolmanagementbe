const Timetable = require("../models/TimeTableSchema");
const Subject = require("../models/subjectSchema");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
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

// // 🧑‍🏫 Get timetables by teacher ID
// const getTimetablesByTeacher = asyncHandler(async (req, res) => {
//   const { teacherId } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(teacherId)) {
//     return res.status(400).json({ message: "Invalid teacher ID." });
//   }

//   // First, find all subjects taught by this teacher
//   const subjects = await Subject.find({ teacherIds: teacherId }).lean();

//   if (!subjects.length) {
//     return res.status(404).json({
//       message: "No subjects found for this teacher.",
//       suggestion: "This teacher may not be assigned to any subjects yet.",
//     });
//   }

//   const subjectIds = subjects.map((subject) => subject._id);

//   // Then find all timetables that have these subjects in their periods
//   const timetables = await Timetable.find({
//     "schedule.periods.subject": { $in: subjectIds },
//   })
//     .populate("class")
//     .populate("schedule.periods.subject")
//     .lean();

//   if (!timetables.length) {
//     return res.status(404).json({
//       message: "No timetables found for this teacher.",
//       suggestion:
//         "The subjects assigned to this teacher may not be scheduled in any timetable yet.",
//     });
//   }

//   // Format the response to make it more teacher-centric
//   const formattedTimetables = timetables.map((timetable) => {
//     const teacherSchedule = timetable.schedule
//       .map((day) => {
//         const teacherPeriods = day.periods.filter((period) =>
//           subjectIds.includes(period.subject._id.toString())
//         );

//         return {
//           day: day.day,
//           periods: teacherPeriods,
//         };
//       })
//       .filter((day) => day.periods.length > 0);

//     return {
//       class: timetable.class,
//       schedule: teacherSchedule,
//     };
//   });

//   res.json({
//     teacherId,
//     subjects: subjects.map((s) => ({ _id: s._id, name: s.name, code: s.code })),
//     timetables: formattedTimetables,
//   });
// });

// 🧑‍🏫 Get timetables by teacher ID
const getTimetablesByTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    return res.status(400).json({ message: "Invalid teacher ID." });
  }

  // 1️⃣ Find all subjects this teacher is assigned to
  const subjects = await Subject.find({ teacherIds: teacherId }).lean();

  if (!subjects.length) {
    return res.status(404).json({
      message: "No subjects found for this teacher.",
      suggestion: "This teacher may not be assigned to any subjects yet.",
    });
  }

  const subjectIds = subjects.map((subject) => subject._id.toString());

  // 2️⃣ Find all timetables that might contain these subjects
  const timetables = await Timetable.find({
    "schedule.periods.subject": { $in: subjectIds },
  })
    .populate("class")
    .populate("schedule.periods.subject")
    .lean();

  if (!timetables.length) {
    return res.status(404).json({
      message: "No timetables found for this teacher.",
      suggestion:
        "The subjects assigned to this teacher may not be scheduled in any timetable yet.",
    });
  }

  // 3️⃣ Format the response to show only relevant periods for this teacher
  const formattedTimetables = timetables.map((timetable) => {
    const teacherSchedule = timetable.schedule
      .map((day) => {
        const teacherPeriods = day.periods.filter((period) =>
          subjectIds.includes(period.subject._id.toString())
        );

        return {
          day: day.day,
          periods: teacherPeriods.map((period) => ({
            time: `${period.startTime} - ${period.endTime}`,
            subject: {
              _id: period.subject._id,
              name: period.subject.name,
              code: period.subject.code,
            },
            room: timetable.class.roomNumber || "Not specified",
          })),
        };
      })
      .filter((day) => day.periods.length > 0);

    return {
      class: {
        _id: timetable.class._id,
        name: timetable.class.className,
        grade: timetable.class.grade,
        section: timetable.class.section,
        roomNumber: timetable.class.roomNumber,
      },
      schedule:
        teacherSchedule.length > 0
          ? teacherSchedule
          : [{ day: "No scheduled periods", periods: [] }],
    };
  });

  // 4️⃣ Send response
  res.json({
    teacherId,
    subjects: subjects.map((s) => ({
      _id: s._id,
      name: s.name,
      code: s.code,
    })),
    timetables: formattedTimetables,
  });
});

module.exports = {
  getAllTimetables,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetablesByTeacher,
};
