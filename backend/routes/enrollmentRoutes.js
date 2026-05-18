import express from 'express';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Payment from '../models/Payment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user enrollments
router.get('/', protect, async (req, res) => {
  const enrollments = await Enrollment.find({ user: req.user._id }).populate('course', 'title image instructor');
  res.json(enrollments);
});

// @desc    Enroll in a course
router.post('/', protect, async (req, res) => {
  const { courseId } = req.body;
  const alreadyEnrolled = await Enrollment.findOne({ user: req.user._id, course: courseId });
  if (alreadyEnrolled) return res.status(400).json({ message: 'Already enrolled' });

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  // Calculate expiry date if accessPeriod is set (e.g., "30" for 30 days)
  let expiresAt = null;
  if (course.accessPeriod && !isNaN(course.accessPeriod)) {
    const days = parseInt(course.accessPeriod);
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + days);
  }

  const enrollment = new Enrollment({ user: req.user._id, course: courseId, expiresAt });
  await enrollment.save();

  const user = await User.findById(req.user._id);
  user.enrolledCourses.push({ course: courseId, expiresAt });
  await user.save();

  await Course.findByIdAndUpdate(courseId, { $inc: { numStudents: 1 } });

  // Create payment record to reflect in mentor earnings & student payment history
  const payment = new Payment({
    user: req.user._id,
    course: courseId,
    razorpayOrderId: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    amount: course.price || 0,
    status: 'completed',
  });
  await payment.save();

  res.status(201).json(enrollment);
});

// @desc    Mark video as completed
router.put('/:courseId/video-complete', protect, async (req, res) => {
  const { videoId } = req.body;
  try {
    const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId }).populate('course');
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    if (!enrollment.completedVideos.includes(videoId)) {
      enrollment.completedVideos.push(videoId);
      
      // Calculate progress %
      const totalVideos = enrollment.course.videos?.length || 1;
      enrollment.progress = Math.round((enrollment.completedVideos.length / totalVideos) * 100);
      
      await enrollment.save();
    }
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get completed courses (Certificates)
router.get('/certificates', protect, async (req, res) => {
  try {
    const completions = await Enrollment.find({ user: req.user._id, progress: { $gte: 80 } })
      .populate('course', 'title image instructor mentorId')
      .populate('examScores.exam', 'name totalMarks');
    res.json(completions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get analytics for student dashboard
router.get('/stats', protect, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course', 'title')
      .populate('examScores.exam', 'name totalMarks');

    // Prepare chart data
    const progressData = enrollments.map(e => ({
      name: e.course?.title || 'Unknown',
      progress: e.progress,
    }));

    const examData = enrollments.flatMap(e => 
      e.examScores.map(es => ({
        name: es.exam?.name || 'Exam',
        score: es.score,
        total: es.exam?.totalMarks || 100,
        percentage: es.exam?.totalMarks ? Math.round((es.score / es.exam.totalMarks) * 100) : 0,
        date: new Date(es.submittedAt).toLocaleDateString(),
      }))
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ progressData, examData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
