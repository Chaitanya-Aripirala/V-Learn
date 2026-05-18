import mongoose from 'mongoose';

const doubtSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      default: '',
    },
    aiAnswer: {
      type: String,
      default: '',
    },
    answerBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    answeredAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'answered'],
      default: 'pending',
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Doubt = mongoose.model('Doubt', doubtSchema);

export default Doubt;
