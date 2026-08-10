const prisma = require('../config/prisma');

// Record an audit entry. Safe to call anywhere — logs errors instead of
// throwing, so auditing never breaks the main action.
// `req` is used to identify who performed the action.
async function logAction(req, action, { targetType = null, targetId = null, details = null } = {}) {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: req.user.userId,
        actorName: req.user.name || `User ${req.user.userId}`,
        action,
        targetType,
        targetId,
        details,
      },
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

module.exports = { logAction };