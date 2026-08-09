const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// LIST campaigns — admins/trainers only
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'), async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(campaigns);
  } catch (err) {
    console.error('List campaigns error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// CREATE a campaign — admins/trainers only
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'), async (req, res) => {
  try {
    const { name, description, emailSubject, emailBody, difficulty } = req.body;
    if (!name || !emailSubject || !emailBody) {
      return res.status(400).json({ message: 'name, emailSubject and emailBody are required' });
    }
    const campaign = await prisma.campaign.create({
      data: {
        name,
        description,
        emailSubject,
        emailBody,
        difficulty: difficulty || 'medium',
        status: 'active',
        createdBy: req.user.userId,
      },
    });
    res.status(201).json(campaign);
  } catch (err) {
    console.error('Create campaign error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET campaign results — the behavioral metrics — admins/trainers only
router.get('/:id/results', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'), async (req, res) => {
  try {
    const campaignId = Number(req.params.id);
    const events = await prisma.simulationEvent.findMany({ where: { campaignId } });

    const clicked = events.filter((e) => e.eventType === 'LINK_CLICKED').length;
    const reported = events.filter((e) => e.eventType === 'REPORT_SUBMITTED').length;
    const opened = events.filter((e) => e.eventType === 'EMAIL_OPENED').length;

    res.json({
      campaignId,
      totalEvents: events.length,
      opened,
      clicked,
      reported,
    });
  } catch (err) {
    console.error('Campaign results error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;