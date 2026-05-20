import express from 'express';
import Doubt from '../models/Doubt.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Create a new doubt
// @route   POST /api/doubts
router.post('/', protect, async (req, res) => {
  if (req.user.role === 'mentor') {
    return res.status(400).json({ message: 'Mentors cannot ask doubts.' });
  }

  const { mentorId, courseId, question } = req.body;

  if (!question?.trim()) {
    return res.status(400).json({ message: 'Please provide a question.' });
  }

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Verify the student is enrolled in this course
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to ask doubts.' });
    }

    const mentorToAssign = mentorId || course.mentorId;
    if (!mentorToAssign) return res.status(400).json({ message: 'Mentor must be assigned to the course.' });

    const mentor = await User.findById(mentorToAssign);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(400).json({ message: 'Invalid mentor for this doubt.' });
    }

    if (!course.mentorId || course.mentorId.toString() !== mentor._id.toString()) {
      return res.status(400).json({ message: 'This mentor is not assigned to the selected course.' });
    }

    const aiAnswer = `I've analyzed your question: "${question}". While your mentor reviews it, consider revisiting the related lesson in the course. If you still need help, your mentor will reply shortly.`;

    const doubt = await Doubt.create({
      student: req.user._id,
      mentor: mentor._id,
      course: courseId,
      question,
      aiAnswer,
    });

    const populatedDoubt = await Doubt.findById(doubt._id)
      .populate('mentor', 'name email')
      .populate('student', 'name email')
      .populate('course', 'title');

    res.status(201).json(populatedDoubt);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create doubt', error: error.message });
  }
});

// @desc    Get doubts for a mentor
// @route   GET /api/doubts/mentor
router.get('/mentor', protect, async (req, res) => {
  if (req.user.role !== 'mentor') return res.status(403).json({ message: 'Not authorized' });
  try {
    const doubts = await Doubt.find({ mentor: req.user._id })
      .populate('student', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get doubts for a student
// @route   GET /api/doubts/student
router.get('/student', protect, async (req, res) => {
  try {
    const doubts = await Doubt.find({ student: req.user._id })
      .populate('mentor', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get doubts for a student by course
// @route   GET /api/doubts/student/course/:courseId
router.get('/student/course/:courseId', protect, async (req, res) => {
  try {
    const doubts = await Doubt.find({ student: req.user._id, course: req.params.courseId })
      .populate('mentor', 'name email')
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Answer a doubt
// @route   PUT /api/doubts/:id/answer
router.put('/:id/answer', protect, async (req, res) => {
  if (req.user.role !== 'mentor') return res.status(403).json({ message: 'Not authorized' });
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });

    if (doubt.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not assigned to answer this doubt' });
    }

    doubt.answer = req.body.answer;
    doubt.answerBy = req.user._id;
    doubt.answeredAt = Date.now();
    doubt.status = 'answered';
    doubt.isResolved = true;

    const updatedDoubt = await doubt.save();
    const populatedDoubt = await Doubt.findById(updatedDoubt._id)
      .populate('mentor', 'name email')
      .populate('student', 'name email')
      .populate('course', 'title');
    res.json(populatedDoubt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
