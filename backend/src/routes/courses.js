const express = require('express');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET all courses — any logged-in user can view
router.get('/', authenticate, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(courses);
  } catch (err) {
    console.error('Get courses error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// GET one course by id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    console.error('Get course error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// CREATE a course — only admins and trainers
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'), async (req, res) => {
  try {
    const { title, description, category, difficulty, duration } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        difficulty,
        duration: duration ? Number(duration) : null,
        createdBy: req.user.userId,
      },
    });
    res.status(201).json(course);
  } catch (err) {
    console.error('Create course error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// UPDATE a course — only admins and trainers
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'), async (req, res) => {
  try {
    const { title, description, category, difficulty, duration, status } = req.body;
    const course = await prisma.course.update({
      where: { id: Number(req.params.id) },
      data: { title, description, category, difficulty, duration, status },
    });
    res.json(course);
  } catch (err) {
    console.error('Update course error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// DELETE a course — only admins and trainers
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN', 'TRAINER'), async (req, res) => {
  try {
    await prisma.course.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error('Delete course error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;