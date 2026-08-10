const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateRisk } = require('../utils/riskEngine');

const router = express.Router();

// GET analytics data for admin charts — admins only
router.get('/overview', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN'), async (req, res) => {
  try {
    // Pull the data we need
    const users = await prisma.user.findMany({
      include: { progress: { include: { course: { select: { category: true } } } } },
    });
    const allEvents = await prisma.simulationEvent.findMany();
    const incidents = await prisma.incident.findMany({ select: { status: true, severity: true, type: true } });
    const allProgress = await prisma.trainingProgress.findMany({
      include: { course: { select: { title: true, category: true } } },
    });

    // 1. Risk level distribution across users
    const riskDistribution = { VERY_LOW: 0, LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    for (const u of users) {
      const userEvents = allEvents.filter((e) => e.userId === u.id);
      const risk = calculateRisk(u.progress, userEvents);
      riskDistribution[risk.riskLevel] = (riskDistribution[risk.riskLevel] || 0) + 1;
    }

    // 2. Average quiz score by course category
    const byCategory = {};
    for (const p of allProgress) {
      const cat = p.course?.category || 'General';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(p.score || 0);
    }
    const scoresByCategory = Object.keys(byCategory).map((cat) => ({
      category: cat,
      averageScore: Math.round(byCategory[cat].reduce((a, b) => a + b, 0) / byCategory[cat].length),
    }));

    // 3. Phishing behavior totals
    const phishing = {
      clicked: allEvents.filter((e) => e.eventType === 'LINK_CLICKED').length,
      reported: allEvents.filter((e) => e.eventType === 'REPORT_SUBMITTED').length,
      opened: allEvents.filter((e) => e.eventType === 'EMAIL_OPENED').length,
    };

    // 4. Incident status breakdown
    const incidentStatus = {
      open: incidents.filter((i) => i.status === 'open').length,
      reviewing: incidents.filter((i) => i.status === 'reviewing').length,
      resolved: incidents.filter((i) => i.status === 'resolved').length,
      dismissed: incidents.filter((i) => i.status === 'dismissed').length,
    };

    res.json({
      riskDistribution,
      scoresByCategory,
      phishing,
      incidentStatus,
    });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;