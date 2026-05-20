import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Exam from '../models/Exam.js';

const router = express.Router();

// @desc    Get student analytics dashboard data
// @route   GET /api/analytics/student
// @access  Private (Student only)
router.get('/student', protect, async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can view these analytics' });
  }

  try {
    // 1. Fetch all enrollments for this student
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course', 'title category')
      .populate({
        path: 'examScores.exam',
        select: 'name totalMarks course',
        populate: { path: 'course', select: 'category' }
      });

    let totalCourses = enrollments.length;
    let totalCompletedVideos = 0;
    
    // Performance data over time for Line Chart
    let performanceTimeline = [];
    
    // Category performance mapping
    let categoryStats = {}; // { 'Development': { totalScore: 0, maxScore: 0, count: 0 } }

    enrollments.forEach(enr => {
      totalCompletedVideos += (enr.completedVideos?.length || 0);

      // Aggregate exam scores
      if (enr.examScores && enr.examScores.length > 0) {
        enr.examScores.forEach(es => {
          if (!es.exam) return;
          
          const percentage = es.exam.totalMarks ? (es.score / es.exam.totalMarks) * 100 : es.score; // Fallback to raw score if no totalMarks
          
          // Add to timeline
          performanceTimeline.push({
            date: new Date(es.submittedAt),
            score: Math.round(percentage),
            examName: es.exam.name
          });

          // Aggregate by category
          const cat = es.exam.course?.category || enr.course?.category || 'General';
          if (!categoryStats[cat]) {
            categoryStats[cat] = { totalPercentage: 0, count: 0 };
          }
          categoryStats[cat].totalPercentage += percentage;
          categoryStats[cat].count += 1;
        });
      }
    });

    // Sort timeline by date
    performanceTimeline.sort((a, b) => a.date - b.date);
    
    // Format timeline for Recharts (e.g. "Jan 12")
    const formattedTimeline = performanceTimeline.map(item => ({
      date: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Score: item.score,
      name: item.examName
    }));

    // Calculate Strong/Weak areas
    let strongAreas = [];
    let weakAreas = [];
    
    for (const [cat, data] of Object.entries(categoryStats)) {
      const avg = data.totalPercentage / data.count;
      if (avg >= 70) {
        strongAreas.push({ subject: cat, score: Math.round(avg) });
      } else {
        weakAreas.push({ subject: cat, score: Math.round(avg) });
      }
    }

    // Sort by score
    strongAreas.sort((a, b) => b.score - a.score);
    weakAreas.sort((a, b) => a.score - b.score); // Lowest first

    res.json({
      overview: {
        totalCourses,
        totalCompletedVideos,
        examsTaken: performanceTimeline.length,
        averageScore: performanceTimeline.length > 0 
          ? Math.round(performanceTimeline.reduce((acc, curr) => acc + curr.score, 0) / performanceTimeline.length) 
          : 0
      },
      timeline: formattedTimeline,
      strongAreas,
      weakAreas
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
});

export default router;
