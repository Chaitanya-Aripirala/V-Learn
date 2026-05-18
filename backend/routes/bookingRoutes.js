import express from 'express';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a booking request
// @route   POST /api/bookings
router.post('/', protect, async (req, res) => {
  const { mentorId, courseId, topic, scheduledFor } = req.body;
  try {
    const booking = await Booking.create({
      student: req.user._id,
      mentor: mentorId,
      course: courseId,
      topic,
      scheduledFor
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get bookings for a mentor
// @route   GET /api/bookings/mentor
router.get('/mentor', protect, async (req, res) => {
  if (req.user.role !== 'mentor') return res.status(403).json({ message: 'Not authorized' });
  try {
    const bookings = await Booking.find({ mentor: req.user._id })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get bookings for a student
// @route   GET /api/bookings/student
router.get('/student', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user._id })
      .populate('mentor', 'name')
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id
router.put('/:id', protect, async (req, res) => {
  const { status, meetingLink } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // Only mentor of the booking can update it
    if (booking.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (status) booking.status = status;
    if (meetingLink !== undefined) booking.meetingLink = meetingLink;
    
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
