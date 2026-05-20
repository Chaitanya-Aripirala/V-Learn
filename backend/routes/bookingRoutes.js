import express from 'express';
import Booking from '../models/Booking.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a booking request (enrolled students only)
// @route   POST /api/bookings
router.post('/', protect, async (req, res) => {
  if (req.user.role === 'mentor') {
    return res.status(400).json({ message: 'Mentors cannot book sessions.' });
  }
  const { mentorId, courseId, topic, scheduledFor } = req.body;

  if (!topic?.trim() || !scheduledFor) {
    return res.status(400).json({ message: 'Topic and scheduled time are required.' });
  }

  try {
    // Verify the student is enrolled in this course
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to book a session.' });
    }

    // Verify mentor belongs to course
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.mentorId?.toString() !== mentorId) {
      return res.status(400).json({ message: 'This mentor is not assigned to the selected course.' });
    }

    const booking = await Booking.create({
      student: req.user._id,
      mentor: mentorId,
      course: courseId,
      topic,
      scheduledFor
    });

    const populated = await Booking.findById(booking._id)
      .populate('student', 'name email')
      .populate('mentor', 'name email')
      .populate('course', 'title');

    res.status(201).json(populated);
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
      .populate('mentor', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update booking status / meeting link (mentor only)
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

    const updated = await booking.save();
    const populated = await Booking.findById(updated._id)
      .populate('student', 'name email')
      .populate('mentor', 'name email')
      .populate('course', 'title');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Cancel a booking (student can cancel their own pending bookings)
// @route   DELETE /api/bookings/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending bookings can be cancelled.' });
    }

    booking.status = 'Cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;

