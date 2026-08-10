const prisma = require('../config/prisma');

// Create a notification for a user. Safe to call from anywhere;
// it logs errors instead of throwing so it never breaks the main action.
async function notify(userId, message, type = 'info', link = null) {
  try {
    await prisma.notification.create({
      data: { userId, message, type, link },
    });
  } catch (err) {
    console.error('Notify error:', err.message);
  }
}

module.exports = { notify };