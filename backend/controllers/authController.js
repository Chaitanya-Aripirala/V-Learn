import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { otpTemplate, welcomeTemplate, resetPasswordTemplate } from '../utils/emailTemplates.js';

// @desc    Register a new mentor (sends OTP email)
// @route   POST /api/auth/mentor/register
// @access  Public
export const registerMentor = async (req, res) => {
  const { name, email, mobileNumber, password, bankDetails } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP (6 digits, expires in 5 minutes)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      mobileNumber,
      password,
      role: 'mentor',
      bankDetails: bankDetails || {},
      otp: { code: otpCode, expiresAt: otpExpires },
    });

    if (user) {
      // Send OTP email
      await sendEmail({
        email: user.email,
        subject: 'Mentor Verification OTP',
        html: otpTemplate(otpCode),
      });
      res.status(201).json({
        message: 'Registration successful. Please verify your email with the OTP sent.',
        email: user.email,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP (if needed)
// @route   POST /api/auth/send-otp
// @access  Public
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.otp = { code: otpCode, expiresAt: otpExpires };
    await user.save();
    await sendEmail({
      email: user.email,
      subject: 'Your OTP Code',
      html: otpTemplate(otpCode),
    });
    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP for mentor registration
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.otp && user.otp.code === code && user.otp.expiresAt > Date.now()) {
      user.isVerified = true;
      user.otp = undefined;
      await user.save();
      await sendEmail({
        email: user.email,
        subject: 'Welcome to V-Learn',
        html: welcomeTemplate(user.name),
      });
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new student (sends OTP email)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, branch } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP (6 digits, expires in 5 minutes)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      branch,
      role: 'user',
      otp: { code: otpCode, expiresAt: otpExpires },
    });

    if (user) {
      // Send OTP email
      await sendEmail({
        email: user.email,
        subject: 'Signup Verification OTP',
        html: otpTemplate(otpCode),
      });
      res.status(201).json({
        message: 'Registration successful. Please verify your email with the OTP sent.',
        email: user.email,
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
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email first', requiresVerification: true });
      }
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
    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP',
      html: resetPasswordTemplate(otpCode),
    });
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




