import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    enrolledCourses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        expiresAt: Date
      },
    ],
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
    branch: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'mentor'],
      default: 'user',
    },
    mobileNumber: {
      type: String,
      default: '',
    },
    bankDetails: {
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    passwordResetOtp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profilePic: {
      type: String,
      default: '',
    },

  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;

