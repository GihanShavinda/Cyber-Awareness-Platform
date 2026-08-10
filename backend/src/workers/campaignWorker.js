const { Worker } = require('bullmq');
const { connection } = require('../config/redis');
const prisma = require('../config/prisma');

// The worker listens on the 'campaigns' queue and processes each job.
const worker = new Worker(
  'campaigns',
  async (job) => {
    console.log(`⚙️  Processing job ${job.id} (${job.name})`);

    // A scheduled campaign job carries the campaign's id
    if (job.name === 'send-campaign') {
      const { campaignId } = job.data;

      // "Activate" the campaign so it appears in users' inboxes
      const campaign = await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'active' },
      });

      console.log(`📤 Campaign "${campaign.name}" is now active (scheduled send fired)`);
      return { activated: campaign.id };
    }

    // Test jobs from Stage 1 just log
    if (job.name === 'test-job') {
      console.log('✅ Test job processed:', job.data);
      return { ok: true };
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

console.log('👷 Campaign worker started, waiting for jobs...');