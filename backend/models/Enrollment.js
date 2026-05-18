import mongoose from 'mongoose';

const enrollmentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
    },
    progress: {
      type: Number,
      default: 0,
    },
    completedVideos: [
      {
        type: String,
      }
    ],
    examScores: [
      {
        exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
        score: Number,
        submittedAt: { type: Date, default: Date.now }
      }
    ],
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
