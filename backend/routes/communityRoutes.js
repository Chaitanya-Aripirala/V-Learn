import express from 'express';
import CommunityMessage from '../models/CommunityMessage.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get course community messages
router.get('/:courseId', protect, async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isEnrolled = await Enrollment.findOne({ user: userId, course: courseId });
    const isMentor = course.mentorId && course.mentorId.toString() === userId.toString();

    if (!isEnrolled && !isMentor) return res.status(403).json({ message: 'Not authorized' });

    const messages = await CommunityMessage.find({ course: courseId })
      .populate('sender', 'name profilePic role')
      .sort('createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching community messages', error: error.message });
  }
});

// @desc    Send a message to the course community
router.post('/', protect, async (req, res) => {
  const { courseId, message, attachments } = req.body;
  const userId = req.user._id;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isEnrolled = await Enrollment.findOne({ user: userId, course: courseId });
    const isMentor = course.mentorId && course.mentorId.toString() === userId.toString();

    if (!isEnrolled && !isMentor) return res.status(403).json({ message: 'Not authorized' });

    if (!message?.trim() && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ message: 'Please provide a message or attachment' });
    }

    const sanitizedAttachments = (attachments || []).map((file) => ({
      url: file.url,
      name: file.name,
      contentType: file.contentType || ''
    }));

    const communityMessage = new CommunityMessage({ course: courseId, sender: userId, message: message || '', attachments: sanitizedAttachments });
    const savedMessage = await communityMessage.save();
    const populatedMessage = await CommunityMessage.findById(savedMessage._id).populate('sender', 'name profilePic role');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Failed to send community message', error: error.message });
  }
});

export default router;
