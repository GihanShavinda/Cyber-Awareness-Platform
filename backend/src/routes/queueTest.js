const express = require('express');
const { campaignQueue } = require('../queues/campaignQueue');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Test: add a dummy job to the queue and report queue counts
router.post('/test', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN'), async (req, res) => {
  try {
    // Add a simple job
    const job = await campaignQueue.add('test-job', { hello: 'world', at: new Date().toISOString() });

    // Get counts of jobs in various states
    const counts = await campaignQueue.getJobCounts();

    res.json({
      message: 'Job added to queue successfully',
      jobId: job.id,
      counts,
    });
  } catch (err) {
    console.error('Queue test error:', err.message);
    res.status(500).json({ message: 'Queue error: ' + err.message });
  }
});

module.exports = router;