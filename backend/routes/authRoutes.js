import express from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { protect } from '../middleware/authMiddleware.js';

import { registerMentor, registerUser, verifyOTP, loginUser, sendOtp, forgotPassword, resetPassword, googleAuth } from '../controllers/authController.js';
import { validateMentorSignup } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Student signup flow
router.post('/register', registerUser);
// Mentor signup flow
router.post('/mentor/register', validateMentorSignup, registerMentor);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);

// Profile routes
router.route('/profile')
  .get(protect, async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        mobileNumber: user.mobileNumber,
        bankDetails: user.bankDetails,
        isVerified: user.isVerified,
        profilePic: user.profilePic,
        enrolledCourses: user.enrolledCourses,
        cart: user.cart,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  })
  .put(protect, async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.mobileNumber = req.body.mobileNumber || user.mobileNumber;
        user.bankDetails = req.body.bankDetails || user.bankDetails;
        user.profilePic = req.body.profilePic || user.profilePic;
        if (req.body.password) user.password = req.body.password;
        const updatedUser = await user.save();
        res.json({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          mobileNumber: updatedUser.mobileNumber,
          bankDetails: updatedUser.bankDetails,
          isVerified: updatedUser.isVerified,
          profilePic: updatedUser.profilePic,
          token: generateToken(updatedUser._id),
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

export default router;
