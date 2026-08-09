const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all quizzes for a course (just titles, no questions) — any logged-in user
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { courseId: Number(req.params.courseId) },
      select: { id: true, title: true, passingScore: true },
    });
    res.json(quizzes);
  } catch (err) {
    console.error('Get quizzes error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET one quiz WITH its questions and answer options — for taking the quiz.
// Note: we hide isCorrect so the answer isn't leaked to the browser.
router.get('/:id', authenticate, async (req, res) => {
  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        questions: {
          include: {
            answers: {
              select: { id: true, text: true }, // hide isCorrect + explanation
            },
          },
        },
      },
    });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    console.error('Get quiz error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// CREATE a quiz with questions and answers in one request — admins/trainers only
router.post('/course/:courseId', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'), async (req, res) => {
  try {
    const { title, passingScore, questions } = req.body;
    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'title and at least one question are required' });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title,
        passingScore: passingScore ? Number(passingScore) : 60,
        courseId: Number(req.params.courseId),
        questions: {
          create: questions.map((q) => ({
            text: q.text,
            questionType: q.questionType || 'multiple_choice',
            answers: {
              create: (q.answers || []).map((a) => ({
                text: a.text,
                isCorrect: !!a.isCorrect,
                explanation: a.explanation || null,
              })),
            },
          })),
        },
      },
      include: { questions: { include: { answers: true } } },
    });

    res.status(201).json(quiz);
  } catch (err) {
    console.error('Create quiz error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// SUBMIT quiz answers and get a score — any logged-in user
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionId, answerId }]
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'answers array is required' });
    }

    // Load the correct answers from the database (never trust the browser)
    const quiz = await prisma.quiz.findUnique({
      where: { id: Number(req.params.id) },
      include: { questions: { include: { answers: true } } },
    });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let correct = 0;
    const total = quiz.questions.length;

    for (const question of quiz.questions) {
      const submitted = answers.find((a) => a.questionId === question.id);
      if (!submitted) continue;
      const chosen = question.answers.find((ans) => ans.id === submitted.answerId);
      if (chosen && chosen.isCorrect) correct++;
    }

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = score >= quiz.passingScore;
    
    // Save this attempt as a progress record
    await prisma.trainingProgress.create({
      data: {
        userId: req.user.userId,
        courseId: quiz.courseId,
        quizId: quiz.id,
        score,
        passed,
        status: 'completed',
      },
    });

    res.json({
      score,
      correct,
      total,
      passingScore: quiz.passingScore,
      passed,
    });

  } catch (err) {
    console.error('Submit quiz error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;