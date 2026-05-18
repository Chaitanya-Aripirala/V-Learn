import mongoose from 'mongoose';

const examSchema = mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  duration: String,
  totalMarks: Number,
  unlockAt: Date,
  questions: [
    {
      questionText: String,
      options: [String],
      correctOption: Number, // Index of the correct option
    }
  ],
  submissions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userName: String,
      score: Number,
      submittedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
