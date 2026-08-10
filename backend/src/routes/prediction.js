const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { predictRisk } = require('../utils/mlService');

const router = express.Router();

// Helper: build the feature set for a user from their real data
async function buildFeatures(userId) {
  const progress = await prisma.trainingProgress.findMany({ where: { userId } });
  const events = await prisma.simulationEvent.findMany({ where: { userId } });
  const incidents = await prisma.incident.findMany({ where: { reportedById: userId } });

  const quizzesTaken = progress.length;
  const avgQuizScore = quizzesTaken > 0
    ? Math.round(progress.reduce((s, p) => s + (p.score || 0), 0) / quizzesTaken)
    : 0;
  const phishingClicked = events.filter((e) => e.eventType === 'LINK_CLICKED').length;
  const phishingReported = events.filter((e) => e.eventType === 'REPORT_SUBMITTED').length;

  return {
    avg_quiz_score: avgQuizScore,
    quizzes_taken: quizzesTaken,
    phishing_clicked: phishingClicked,
    phishing_reported: phishingReported,
    incidents_reported: incidents.length,
  };
}

// GET an ML risk prediction for the logged-in user
router.get('/me', authenticate, async (req, res) => {
  try {
    const features = await buildFeatures(req.user.userId);
    const prediction = await predictRisk(features);

    if (!prediction) {
      return res.status(503).json({ message: 'ML service unavailable', features });
    }
    res.json({ features, prediction });
  } catch (err) {
    console.error('Prediction error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET predictions for ALL users — admins only
router.get('/all', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true } });

    const results = [];
    for (const u of users) {
      const features = await buildFeatures(u.id);
      const prediction = await predictRisk(features);
      results.push({
        id: u.id,
        name: u.name,
        email: u.email,
        predictedRisk: prediction ? prediction.predicted_risk : 'UNKNOWN',
        confidence: prediction ? prediction.confidence : null,
      });
    }

    res.json(results);
  } catch (err) {
    console.error('All predictions error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;