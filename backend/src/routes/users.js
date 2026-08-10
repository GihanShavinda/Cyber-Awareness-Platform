const express = require('express');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { notify } = require('../utils/notify');
const { logAction } = require('../utils/audit');

const router = express.Router();

// LIST all users — admins only
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true,
        status: true, createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    console.error('List users error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// CREATE a user — admins only
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: role || 'EMPLOYEE' },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    res.status(201).json(user);
  } catch (err) {
    console.error('Create user error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// UPDATE a user's role or status — admins only
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN'), async (req, res) => {
  try {
    const { name, role, status } = req.body;
    const userId = Number(req.params.id);

    // Safety: an admin can't change their own role/status (avoid locking themselves out)
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'You cannot change your own role or status' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, role, status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    await logAction(req, 'USER_UPDATED', {
      targetType: 'user',
      targetId: userId,
      details: `Updated ${user.name}${role ? ` — role set to ${role}` : ''}${status ? `, status ${status}` : ''}`,
    });

    await logAction(req, 'USER_DEACTIVATED', {
      targetType: 'user',
      targetId: userId,
      details: `Deactivated ${user.name}`,
    });

    await logAction(req, 'USER_ACTIVATED', {
      targetType: 'user',
      targetId: Number(req.params.id),
      details: `Reactivated ${user.name}`,
    });

    if (role) {
      await notify(userId, `Your role has been updated to ${role}.`, 'info', '/dashboard');
    }
    
    res.json(user);
  } catch (err) {
    console.error('Update user error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// DEACTIVATE a user (soft delete — we set status, don't remove data) — admins only
router.patch('/:id/deactivate', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN'), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'You cannot deactivate yourself' });
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: 'inactive' },
      select: { id: true, name: true, status: true },
    });
    res.json(user);
  } catch (err) {
    console.error('Deactivate user error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// REACTIVATE a user — admins only
router.patch('/:id/activate', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN'), async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: Number(req.params.id) },
      data: { status: 'active' },
      select: { id: true, name: true, status: true },
    });
    res.json(user);
  } catch (err) {
    console.error('Activate user error:', err.message);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

module.exports = router;