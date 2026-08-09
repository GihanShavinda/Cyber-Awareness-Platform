const express = require('express');
const prisma = require('../config/prisma');
const { authenticate } = require('../middleware/auth');
const { calculateRisk } = require('../utils/riskEngine');

const router = express.Router();

// GET the logged-in user's risk profile
// router.get('/me', authenticate, async (req, res) => {
//   try {
//     const progress = await prisma.trainingProgress.findMany({
//       where: { userId: req.user.userId },
//       include: { course: { select: { title: true, category: true } } },
//     });

//     const risk = calculateRisk(progress);
//     res.json(risk);
//   } catch (err) {
//     console.error('Risk calc error:', err.message);
//     res.status(500).json({ message: 'Something went wrong' });
//   }
// });

router.get('/me', authenticate, async (req, res) => {
  try {
    const progress = await prisma.trainingProgress.findMany({
      where: { userId: req.user.userId },
      include: { course: { select: { title: true, category: true } } },
    });

    const events = await prisma.simulationEvent.findMany({
      where: { userId: req.user.userId },
    });

    const risk = calculateRisk(progress, events);
    res.json(risk);
  } catch (err) {
    console.error('Risk calc error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;