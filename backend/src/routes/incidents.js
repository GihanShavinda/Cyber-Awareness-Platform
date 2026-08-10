const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { notify } = require('../utils/notify');
const { logAction } = require('../utils/audit');

const router = express.Router();

// REPORT an incident — any logged-in user
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, type, severity } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'title and description are required' });
    }
    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        type: type || 'phishing',
        severity: severity || 'medium',
        reportedById: req.user.userId,
      },
    });
    res.status(201).json(incident);
  } catch (err) {
    console.error('Report incident error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET the logged-in user's own reported incidents
router.get('/me', authenticate, async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      where: { reportedById: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(incidents);
  } catch (err) {
    console.error('My incidents error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET all incidents — admins/trainers only (the review queue)
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'), async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      include: { reportedBy: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(incidents);
  } catch (err) {
    console.error('List incidents error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// UPDATE an incident's status / review notes — admins/trainers only
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'), async (req, res) => {
  try {
    const { status, severity, reviewNotes } = req.body;
    const incident = await prisma.incident.update({
      where: { id: Number(req.params.id) },
      data: { status, severity, reviewNotes },
    });

    await logAction(req, 'INCIDENT_UPDATED', {
      targetType: 'incident',
      targetId: incident.id,
      details: `Incident "${incident.title}" set to ${incident.status}`,
    });
    
    await notify(
      incident.reportedById,
      `Your reported incident "${incident.title}" is now: ${incident.status}`,
      'info',
      '/report'
    );
    res.json(incident);
  } catch (err) {
    console.error('Update incident error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET incident summary stats — admins/trainers only
router.get('/stats/summary', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'), async (req, res) => {
  try {
    const all = await prisma.incident.findMany({ select: { status: true, severity: true } });
    res.json({
      total: all.length,
      open: all.filter((i) => i.status === 'open').length,
      resolved: all.filter((i) => i.status === 'resolved').length,
      highSeverity: all.filter((i) => i.severity === 'high' || i.severity === 'critical').length,
    });
  } catch (err) {
    console.error('Incident stats error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;