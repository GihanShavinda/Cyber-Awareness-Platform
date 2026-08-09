const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateRisk } = require('../utils/riskEngine');

const router = express.Router();

// GET organization-wide risk overview — admins only
router.get('/overview', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN'), async (req, res) => {
  try {
    // Get all users with their progress + course categories
   const users = await prisma.user.findMany({
      include: {
        progress: {
          include: { course: { select: { title: true, category: true } } },
        },
      },
    });

    // Fetch all simulation events once, then group by user
    const allEvents = await prisma.simulationEvent.findMany();

    const userRisks = users.map((u) => {
      const userEvents = allEvents.filter((e) => e.userId === u.id);
      const risk = calculateRisk(u.progress, userEvents);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        securityScore: risk.securityScore,
        riskLevel: risk.riskLevel,
        quizzesTaken: risk.quizzesTaken,
      };
    });

    // Organization-wide summary
    const totalUsers = userRisks.length;
    const usersWithActivity = userRisks.filter((u) => u.quizzesTaken > 0);
    const avgScore =
      usersWithActivity.length > 0
        ? Math.round(
            usersWithActivity.reduce((sum, u) => sum + u.securityScore, 0) /
              usersWithActivity.length
          )
        : 0;
    const highRiskCount = userRisks.filter(
      (u) => u.riskLevel === 'HIGH' || u.riskLevel === 'CRITICAL'
    ).length;

    res.json({
      summary: {
        totalUsers,
        averageScore: avgScore,
        highRiskUsers: highRiskCount,
        activeUsers: usersWithActivity.length,
      },
      users: userRisks,
    });
  } catch (err) {
    console.error('Admin overview error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;