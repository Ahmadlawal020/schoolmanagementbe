const express = require("express");
const router = express.Router();
const {
  getAllTimetables,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetablesByTeacher,
} = require("../controllers/timetableController");

// Routes for all timetables
router
  .route("/")
  .get(getAllTimetables) // GET /api/timetables
  .post(createTimetable); // POST /api/timetables

// Routes for a specific timetable by ID

router.get("/teacher/:teacherId", getTimetablesByTeacher);
router
  .route("/:id")
  .get(getTimetableById) // GET /api/timetables/:id
  .patch(updateTimetable) // ✅ PATCH /api/timetables/:id
  .delete(deleteTimetable); // ✅ DELETE /api/timetables/:id

module.exports = router;
