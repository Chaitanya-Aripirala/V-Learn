import express from 'express';
import Exam from '../models/Exam.js';
import Enrollment from '../models/Enrollment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'D';
};

// Get exams for a specific course
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const exams = await Exam.find({ course: req.params.courseId }).populate('submissions.user', 'name');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exams', error: error.message });
  }
});

// Mentor creates an exam
router.post('/', protect, async (req, res) => {
  if (req.user.role !== 'mentor') return res.status(403).json({ message: 'Only mentors can create exams' });
  
  const { courseId, name, link, duration, totalMarks, unlockAt } = req.body;
  try {
    const exam = new Exam({
      course: courseId,
      name,
      link,
      duration,
      totalMarks,
      unlockAt
    });
    const savedExam = await exam.save();
    res.status(201).json(savedExam);
  } catch (error) {
    res.status(400).json({ message: 'Error creating exam', error: error.message });
  }
});

// Update an exam
router.put('/:id', protect, async (req, res) => {
  if (req.user.role !== 'mentor') return res.status(403).json({ message: 'Not authorized' });
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(exam);
  } catch (error) {
    res.status(400).json({ message: 'Update failed', error: error.message });
  }
});

// Delete an exam
router.delete('/:id', protect, async (req, res) => {
  if (req.user.role !== 'mentor') return res.status(403).json({ message: 'Not authorized' });
  try {
    await Exam.findByIdAndDelete(req.params.id);
    res.json({ message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete exam', error: error.message });
  }
});

// Student submits score
router.post('/:id/submit', protect, async (req, res) => {
  const { score, userAnswers } = req.body; // userAnswers: [0, 1, 2...] indices
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    let numericScore = 0;

    // If student provides answers to questions, calculate score automatically
    if (userAnswers && Array.isArray(userAnswers) && exam.questions && exam.questions.length > 0) {
      exam.questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctOption) {
          numericScore += (exam.totalMarks / exam.questions.length);
        }
      });
      numericScore = Math.round(numericScore);
    } else {
      // Fallback to manually entered score if no answers provided (for external links)
      if (typeof score !== 'number' && typeof score !== 'string') {
        return res.status(400).json({ message: 'Score or Answers required' });
      }
      numericScore = Number(score);
    }

    if (Number.isNaN(numericScore) || numericScore < 0) {
      return res.status(400).json({ message: 'Invalid score result' });
    }

    if (exam.totalMarks && numericScore > exam.totalMarks) {
      return res.status(400).json({ message: `Score cannot exceed total marks (${exam.totalMarks})` });
    }

    const enrollment = await Enrollment.findOne({ user: req.user._id, course: exam.course });
    if (!enrollment) return res.status(403).json({ message: 'Only enrolled students can submit exam marks' });

    const percentage = exam.totalMarks ? Number(((numericScore / exam.totalMarks) * 100).toFixed(2)) : 0;
    const grade = calculateGrade(percentage);

    const existing = exam.submissions.find((s) => s.user.toString() === req.user._id.toString());
    if (existing) {
      existing.score = numericScore;
      existing.percentage = percentage;
      existing.grade = grade;
      existing.submittedAt = Date.now();
    } else {
      exam.submissions.push({
        user: req.user._id,
        userName: req.user.name,
        score: numericScore,
        percentage,
        grade,
      });
    }

    const existingEnrollmentScore = enrollment.examScores.find((e) => e.exam.toString() === exam._id.toString());
    if (existingEnrollmentScore) {
      existingEnrollmentScore.score = numericScore;
      existingEnrollmentScore.submittedAt = Date.now();
    } else {
      enrollment.examScores.push({
        exam: exam._id,
        score: numericScore,
      });
    }

    await Promise.all([exam.save(), enrollment.save()]);
    const updatedExam = await Exam.findById(exam._id).populate('submissions.user', 'name');
    res.status(200).json(updatedExam);
  } catch (error) {
    res.status(400).json({ message: 'Score submission failed', error: error.message });
  }
});

export default router;
