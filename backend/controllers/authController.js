import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { otpTemplate, welcomeTemplate, resetPasswordTemplate } from '../utils/emailTemplates.js';

// @desc    Register a new mentor (instantly verified, no OTP)
// @route   POST /api/auth/mentor/register
// @access  Public
export const registerMentor = async (req, res) => {
  const { name, email, mobileNumber, password, bankDetails } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      mobileNumber,
      password,
      role: 'mentor',
      bankDetails: bankDetails || {},
      isVerified: true, // Auto-verify mentor
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        bankDetails: user.bankDetails,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP (stubbed/bypassed)
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res) => {
  res.json({ message: 'OTP send bypassed' });
};

// @desc    Verify OTP (stubbed/bypassed)
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  res.json({ message: 'OTP verification bypassed' });
};

// @desc    Register a new student (instantly verified, no OTP)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, branch } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      branch,
      role: 'user',
      isVerified: true, // Auto-verify student
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        enrolledCourses: user.enrolledCourses,
        cart: user.cart,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobileNumber: user.mobileNumber,
        bankDetails: user.bankDetails,
        enrolledCourses: user.enrolledCourses,
        cart: user.cart,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password - send reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.passwordResetOtp = { code: otpCode, expiresAt: otpExpires };
    await user.save();
    console.log(`[PASSWORD RESET OTP] Forgot password reset for ${user.email}. OTP: ${otpCode}`);
    sendEmail({
      email: user.email,
      subject: 'Password Reset OTP',
      html: resetPasswordTemplate(otpCode),
    }).catch(err => console.error('Error sending email:', err));
    res.json({ message: 'Password reset OTP sent' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.passwordResetOtp) {
      return res.status(400).json({ message: 'Invalid request' });
    }
    if (user.passwordResetOtp.code === otp && user.passwordResetOtp.expiresAt > Date.now()) {
      user.password = newPassword; // pre-save hook will hash
      user.passwordResetOtp = undefined;
      await user.save();
      res.json({ message: 'Password has been reset successfully' });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




