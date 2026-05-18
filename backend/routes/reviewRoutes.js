import express from 'express';
import Review from '../models/Review.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all reviews for a specific course
router.get('/:courseId', async (req, res) => {
  try {
    const feedbackList = await Review.find({ course: req.params.courseId })
      .populate('user', 'name')
      .populate('replies.user', 'name');
    res.json(feedbackList);
  } catch (err) {
    res.status(500).json({ message: "Can't get reviews right now" });
  }
});

// Post a new review
router.post('/', protect, async (req, res) => {
  const { rating, comment, courseId } = req.body;
  
  // check if course exists
  const targetCourse = await Course.findById(courseId);
  if (!targetCourse) return res.status(404).json({ message: 'Course not found' });

  // check if user already gave feedback
  const doneBefore = await Review.findOne({ user: req.user._id, course: courseId });
  if (doneBefore) return res.status(400).json({ message: 'You already reviewed this course' });

  const newFeedback = new Review({
    user: req.user._id,
    course: courseId,
    rating: Number(rating),
    comment: comment
  });

  await newFeedback.save();

  // update the course stats (rating and count)
  const allReviews = await Review.find({ course: courseId });
  targetCourse.numReviews = allReviews.length;
  let total = 0;
  allReviews.forEach(r => total += r.rating);
  targetCourse.rating = total / allReviews.length;

  await targetCourse.save();
  res.status(201).json({ message: 'Thanks for your feedback!' });
});

// Reply to a student's review (New Feature)
router.post('/:reviewId/reply', protect, async (req, res) => {
  const { replyText } = req.body;
  
  try {
    const mainReview = await Review.findById(req.params.reviewId);
    if (!mainReview) return res.status(404).json({ message: 'Review not found' });

    // add the reply to the list
    const newReply = {
      user: req.user._id,
      name: req.user.name,
      comment: replyText
    };

    mainReview.replies.push(newReply);
    await mainReview.save();

    res.status(201).json(mainReview);
  } catch (error) {
    res.status(400).json({ message: 'Error adding reply' });
  }
});

export default router;
