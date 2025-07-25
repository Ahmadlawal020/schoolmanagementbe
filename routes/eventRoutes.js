const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");

router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);
router.post("/", eventController.createEvent);
router.patch("/", eventController.updateEvent);
router.delete("/", eventController.deleteEvent);

module.exports = router;
