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

// GET active campaigns for the logged-in user to "receive" (any logged-in user)
router.get('/inbox/me', authenticate, async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'active' },
      select: { id: true, emailSubject: true, emailBody: true },
    });
    res.json(campaigns);
  } catch (err) {
    console.error('Inbox error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// RECORD a user's response to a campaign (any logged-in user)
router.post('/:id/respond', authenticate, async (req, res) => {
  try {
    const { action } = req.body; // "CLICKED" or "REPORTED"

    const eventTypeMap = {
      CLICKED: 'LINK_CLICKED',
      REPORTED: 'REPORT_SUBMITTED',
      OPENED: 'EMAIL_OPENED',
    };
    const eventType = eventTypeMap[action];
    if (!eventType) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    await prisma.simulationEvent.create({
      data: {
        campaignId: Number(req.params.id),
        userId: req.user.userId,
        eventType,
      },
    });

    // Friendly feedback depending on what they did
    const message =
      eventType === 'LINK_CLICKED'
        ? 'This was a simulated phishing test — and you clicked the link. In a real attack, this could have compromised your account. Always verify sender addresses and never click urgent links.'
        : eventType === 'REPORT_SUBMITTED'
        ? 'Well done! You correctly reported this as phishing. This is exactly the right response.'
        : 'Event recorded.';

    res.json({ eventType, message });
  } catch (err) {
    console.error('Respond error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;