import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get user cart
router.get('/', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart');
  if (user) res.json(user.cart);
  else res.status(404).json({ message: 'User not found' });
});

// @desc    Add course to cart
router.post('/', protect, async (req, res) => {
  const { courseId } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    if (user.cart.some(id => id.toString() === courseId)) return res.status(400).json({ message: 'Course already in cart' });
    if (user.enrolledCourses.some(id => id.toString() === courseId)) return res.status(400).json({ message: 'Already enrolled' });

    user.cart.push(courseId);
    await user.save();
    const populatedUser = await User.findById(user._id).populate('cart');
    res.json(populatedUser.cart);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Remove course from cart
router.delete('/:courseId', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.cart = user.cart.filter(id => id.toString() !== req.params.courseId);
    await user.save();
    const populatedUser = await User.findById(user._id).populate('cart');
    res.json(populatedUser.cart);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

export default router;
