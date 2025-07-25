const Event = require("../models/eventSchema");
const asyncHandler = require("express-async-handler");

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .populate("organizer", "firstName lastName email")
    .populate("attendees", "firstName lastName email")
    .lean();

  if (!events?.length) {
    return res.status(404).json({ message: "No events found." });
  }

  res.json(events);
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate("organizer", "firstName lastName email")
    .populate("attendees", "firstName lastName email")
    .lean();

  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  res.json(event);
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    startDateTime,
    endDateTime,
    allDay,
    location,
    type,
    tags,
    visibleToRoles,
    organizer,
    attendees,
    reminders,
    recurrence,
    status,
    visibility,
    attachments,
    createdBy,
  } = req.body;

  if (!title || !startDateTime || !endDateTime) {
    return res.status(400).json({ message: "Required fields missing." });
  }

  const newEvent = await Event.create({
    title,
    description,
    startDateTime,
    endDateTime,
    allDay,
    location,
    type,
    tags,
    visibleToRoles,
    organizer,
    attendees,
    reminders,
    recurrence,
    status,
    visibility,
    attachments,
    createdBy,
  });

  if (!newEvent) {
    return res.status(400).json({ message: "Invalid event data." });
  }

  res
    .status(201)
    .json({ message: `Event '${newEvent.title}' created successfully.` });
});

// @desc    Update an event
// @route   PATCH /api/events
// @access  Private
const updateEvent = asyncHandler(async (req, res) => {
  const { id, ...updateData } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Event ID is required." });
  }

  const event = await Event.findById(id).exec();
  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  Object.assign(event, updateData);
  event.updatedAt = new Date();

  const updatedEvent = await event.save();

  res.json({ message: `Event '${updatedEvent.title}' updated successfully.` });
});

// @desc    Delete an event
// @route   DELETE /api/events
// @access  Private
const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Event ID is required." });
  }

  const event = await Event.findById(id).exec();
  if (!event) {
    return res.status(404).json({ message: "Event not found." });
  }

  await event.deleteOne();

  res.json({ message: `Event '${event.title}' deleted successfully.` });
});

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
