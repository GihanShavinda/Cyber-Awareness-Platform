const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all lessons for a specific course — any logged-in user
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId: Number(req.params.courseId) },
      orderBy: { orderNumber: 'asc' },
    });
    res.json(lessons);
  } catch (err) {
    console.error('Get lessons error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// CREATE a lesson in a course — admins and trainers only
router.post('/course/:courseId', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'), async (req, res) => {
  try {
    const { title, content, videoUrl, orderNumber } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        videoUrl,
        orderNumber: orderNumber ? Number(orderNumber) : 1,
        courseId: Number(req.params.courseId),
      },
    });
    res.status(201).json(lesson);
  } catch (err) {
    console.error('Create lesson error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// DELETE a lesson — admins and trainers only
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'), async (req, res) => {
  try {
    await prisma.lesson.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    console.error('Delete lesson error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;