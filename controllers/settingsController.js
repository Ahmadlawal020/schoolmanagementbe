const Settings = require("../models/settingsSchema");
const Class = require("../models/classSchema");
const asyncHandler = require("express-async-handler");

const getSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne()
    .populate("updatedBy", "firstName lastName email")
    .lean();

  if (!settings) {
    return res.status(404).json({ message: "No settings found." });
  }

  res.json(settings);
});

const createSettings = asyncHandler(async (req, res) => {
  const { academicYear, terms, activeTerm } = req.body.academic || {};

  if (!academicYear) {
    return res.status(400).json({ message: "Academic year is required." });
  }

  const existing = await Settings.findOne().lean().exec();
  if (existing) {
    return res
      .status(409)
      .json({ message: "Settings already exist. Use update instead." });
  }

  const settingsObject = {
    academic: {
      academicYear,
      terms: terms || [],
      activeTerm: activeTerm || null,
    },
    updatedBy: req.user?._id || null,
  };

  const newSettings = await Settings.create(settingsObject);

  if (!newSettings) {
    return res.status(400).json({ message: "Invalid settings data." });
  }

  res.status(201).json(newSettings);
});

// const updateSettings = asyncHandler(async (req, res) => {
//   const settings = await Settings.findOne().exec();

//   if (!settings) {
//     return res.status(404).json({ message: "Settings not found." });
//   }

//   if (req.body.academic) {
//     const { academicYear, terms, activeTerm } = req.body.academic;

//     if (academicYear) {
//       settings.academic.academicYear = academicYear;
//     }
//     if (terms) {
//       settings.academic.terms = terms;
//     }
//     if (activeTerm) {
//       settings.academic.activeTerm = activeTerm;
//     }
//   }

//   settings.updatedBy = req.user?._id || settings.updatedBy;

//   const updatedSettings = await settings.save();

//   res.json(updatedSettings);
// });

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne().exec();

  if (!settings) {
    return res.status(404).json({ message: "Settings not found." });
  }

  let academicYearChanged = false;
  let newAcademicYear;

  if (req.body.academic) {
    const { academicYear, terms, activeTerm } = req.body.academic;

    if (academicYear && academicYear !== settings.academic.academicYear) {
      academicYearChanged = true;
      newAcademicYear = academicYear;
      settings.academic.academicYear = academicYear;
    }
    if (terms) settings.academic.terms = terms;
    if (activeTerm) settings.academic.activeTerm = activeTerm;
  }

  settings.updatedBy = req.user?._id || settings.updatedBy;

  const updatedSettings = await settings.save();

  // 🔹 Only run class status update if academic year changed
  if (academicYearChanged) {
    const newYearStart = parseInt(newAcademicYear.split("-")[0], 10);

    // Fetch classes whose academic year start is less than the new year start
    const classesToUpdate = await Class.find({
      status: "Active",
    }).lean();

    const idsToUpdate = classesToUpdate
      .filter((cls) => {
        const classYearStart = parseInt(cls.academicYear.split("-")[0], 10);
        return classYearStart < newYearStart;
      })
      .map((cls) => cls._id);

    if (idsToUpdate.length > 0) {
      await Class.updateMany(
        { _id: { $in: idsToUpdate } },
        { $set: { status: "Inactive" } }
      );
    }
  }

  res.json(updatedSettings);
});

const deleteSettings = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne().exec();

  if (!settings) {
    return res.status(404).json({ message: "Settings not found." });
  }

  await settings.deleteOne();

  res.json({ message: "Settings deleted successfully." });
});

module.exports = {
  getSettings,
  createSettings,
  updateSettings,
  deleteSettings,
};
