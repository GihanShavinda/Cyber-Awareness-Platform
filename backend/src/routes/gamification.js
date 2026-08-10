const express = require('express');
const prisma = require('../config/prisma');
const { authenticate } = require('../middleware/auth');
const { calculateGameStats } = require('../utils/gamification');

const router = express.Router();

// GET the logged-in user's own game stats (points, level, badges)
router.get('/me', authenticate, async (req, res) => {
  try {
    const progress = await prisma.trainingProgress.findMany({
      where: { userId: req.user.userId },
    });
    const events = await prisma.simulationEvent.findMany({
      where: { userId: req.user.userId },
    });

    const stats = calculateGameStats(progress, events);
    res.json(stats);
  } catch (err) {
    console.error('Game stats error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET the leaderboard — all users ranked by points
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        progress: true,
      },
    });
    const allEvents = await prisma.simulationEvent.findMany();

    const ranked = users
      .map((u) => {
        const userEvents = allEvents.filter((e) => e.userId === u.id);
        const stats = calculateGameStats(u.progress, userEvents);
        return {
          id: u.id,
          name: u.name,
          points: stats.points,
          level: stats.level,
          badgeCount: stats.badges.length,
        };
      })
      .sort((a, b) => b.points - a.points); // highest points first

    res.json(ranked);
  } catch (err) {
    console.error('Leaderboard error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;