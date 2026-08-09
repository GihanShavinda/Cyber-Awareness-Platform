const express = require('express');
const prisma = require('../config/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET the logged-in user's own progress records
router.get('/me', authenticate, async (req, res) => {
  try {
    const progress = await prisma.trainingProgress.findMany({
      where: { userId: req.user.userId },
      include: { course: { select: { title: true } } },
      orderBy: { completedAt: 'desc' },
    });
    res.json(progress);
  } catch (err) {
    console.error('Get progress error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;