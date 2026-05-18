import express from 'express';
import Course from '../models/Course.js';
import { protect } from '../middleware/authMiddleware.js';


const router = express.Router();

// @desc    Fetch all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({});
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get recommended courses based on user branch + enrolled categories
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = req.user;
    const userBranch = String(user?.branch || '').trim();
    
    // Gather signals: branch + categories of enrolled courses
    const enrolledCategoryKeywords = [];
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
      const enrolledIds = user.enrolledCourses.map(e => e.course || e);
      const enrolledCourses = await Course.find({ _id: { $in: enrolledIds } }).select('category tags');
      enrolledCourses.forEach(c => {
        if (c.category) enrolledCategoryKeywords.push(c.category);
        if (c.tags) enrolledCategoryKeywords.push(...c.tags);
      });
    }

    const allKeywords = [...new Set([userBranch, ...enrolledCategoryKeywords].filter(Boolean))];
    
    let recommended = [];
    if (allKeywords.length > 0) {
      const orConditions = allKeywords.map(kw => {
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return [
          { category: { $regex: escaped, $options: 'i' } },
          { tags: { $regex: escaped, $options: 'i' } },
          { title: { $regex: escaped, $options: 'i' } },
        ];
      }).flat();
      
      const enrolledIds = (user.enrolledCourses || []).map(e => (e.course || e).toString());
      recommended = await Course.find({ 
        $or: orConditions,
        _id: { $nin: enrolledIds }
      }).sort({ rating: -1 }).limit(8);
    }
    
    // Pad with top-rated courses if not enough
    if (recommended.length < 4) {
      const excludeIds = recommended.map(c => c._id);
      const extra = await Course.find({ _id: { $nin: excludeIds } })
        .sort({ rating: -1 })
        .limit(8 - recommended.length);
      recommended = [...recommended, ...extra];
    }

    res.json(recommended);
  } catch (error) {
    console.error('SERVER ERROR IN RECOMMENDATIONS:', error);
    res.status(500).json({ message: 'Error generating recommendations: ' + error.message });
  }
});

// @desc    Get courses created by mentor
router.get('/mentor', protect, async (req, res) => {
  if (req.user.role !== 'mentor') return res.status(403).json({ message: 'Not authorized as a mentor' });
  try {
    const courses = await Course.find({ mentorId: req.user._id });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Generate AI Summary for course
// @route   POST /api/courses/:id/summarize
router.post('/:id/summarize', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Mock AI Logic (Simulating an LLM response)
    const points = [
      `Master the core principles of ${course.title} through a hands-on curriculum.`,
      `Learn how to implement professional-grade ${course.category} architectures.`,
      `Comprehensive coverage of ${course.videos?.length || 0} expert-led video modules.`,
      `Understand the practical applications of ${course.description.split(' ').slice(0, 5).join(' ')}... in industry settings.`,
      `Prepare for real-world certification and project-based assessments.`
    ];

    const summary = points.join('\n');
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a course
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'mentor') return res.status(403).json({ message: 'Not authorized as a mentor' });
  const { title, description, category, tags, price, image, videos, resources, liveLink, schedule, duration, accessPeriod } = req.body;
  try {
    const course = new Course({
      title, description, category, tags, instructor: req.user.name || 'Anonymous Mentor', mentorId: req.user._id,
      price, image, videos: videos || [], resources, liveLink, schedule: schedule || [], 
      duration, accessPeriod, rating: 0, numReviews: 0,
    });
    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    console.error('Course Creation Error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Fetch, Update, Delete single course
router.route('/:id')
  .get(async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (course) res.json(course);
      else res.status(404).json({ message: 'Course not found' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .put(protect, async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (course) {
        if (course.mentorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
        Object.assign(course, req.body);
        const updatedCourse = await course.save();
        res.json(updatedCourse);
      } else {
        res.status(404).json({ message: 'Course not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .delete(protect, async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
      if (course) {
        if (course.mentorId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course removed' });
      } else {
        res.status(404).json({ message: 'Course not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
