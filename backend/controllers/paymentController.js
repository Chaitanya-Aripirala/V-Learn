import Payment from '../models/Payment.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

// @desc    Create Mock Order (Direct Payment Bypass)
// @route   POST /api/payments/order
// @access  Private
export const createOrder = async (req, res) => {
  const { courseId } = req.body;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Save payment record as completed
    const payment = new Payment({
      user: req.user._id,
      course: courseId,
      razorpayOrderId: orderId,
      amount: course.price,
      status: 'completed',
    });

    await payment.save();

    res.status(201).json({ id: orderId, amount: course.price, currency: 'INR' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Order creation failed' });
  }
};

// @desc    Verify Payment Signature (Direct Enrollment Bypass)
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  const { courseId } = req.body;

  try {
    // Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (alreadyEnrolled) {
      return res.status(200).json({ message: 'Already enrolled', success: true });
    }

    // Enroll student
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found', success: false });
    }
    
    const accessDays = parseInt(course.accessPeriod) || 365;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + accessDays);

    const enrollment = new Enrollment({
      user: req.user._id,
      course: courseId,
      expiresAt,
    });

    await enrollment.save();

    await User.findByIdAndUpdate(req.user._id, {
      $push: { enrolledCourses: { course: courseId, expiresAt } },
    });

    course.numStudents = (course.numStudents || 0) + 1;
    await course.save();

    res.status(200).json({ 
      message: 'Enrollment successful',
      success: true 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Enrollment failed' });
  }
};

// @desc    Get Mentor Earnings
// @route   GET /api/payments/mentor/earnings
// @access  Private/Mentor
export const getMentorEarnings = async (req, res) => {
  try {
    // Find courses created by this mentor
    const myCourses = await Course.find({ mentorId: req.user._id });
    const myCourseIds = myCourses.map(c => c._id);

    // Find successful payments for these courses
    const payments = await Payment.find({
      course: { $in: myCourseIds },
      status: 'completed'
    }).populate('user', 'name email').populate('course', 'title price');

    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);
    const totalEnrollments = payments.length;

    res.json({
      totalRevenue,
      totalEnrollments,
      payments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch earnings' });
  }
};

// @desc    Get Student Payment History
// @route   GET /api/payments/student/history
// @access  Private
export const getStudentPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user._id,
      status: 'completed'
    }).populate('course', 'title image price');

    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};

// @desc    Mock Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public
export const handleWebhook = async (req, res) => {
  res.status(200).send('OK');
};
