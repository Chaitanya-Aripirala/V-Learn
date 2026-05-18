import mongoose from 'mongoose';

const otpSchema = mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    passwordHash: { type: String },
    profilePic: { type: String },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    type: { type: String, enum: ['signup', 'reset'], default: 'signup' },
  },
  { timestamps: true }
);

const Otp = mongoose.model('Otp', otpSchema);

export default Otp;
