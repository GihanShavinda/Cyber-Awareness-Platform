const express = require('express');
const prisma = require('../config/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET my notifications (newest first)
router.get('/me', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error('Get notifications error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Mark one as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { id: Number(req.params.id), userId: req.user.userId },
      data: { isRead: true },
    });
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('Mark read error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Mark all as read
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    console.error('Mark all read error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;