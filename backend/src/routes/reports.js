const express = require('express');
const PDFDocument = require('pdfkit');
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middleware/auth');
const { calculateRisk } = require('../utils/riskEngine');
const { calculateGameStats } = require('../utils/gamification');

const router = express.Router();

// GET a PDF risk report for a specific user — admins only
router.get('/user/:id', authenticate, authorize('SUPER_ADMIN', 'ORG_ADMIN'), async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // Gather the user's real data
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const progress = await prisma.trainingProgress.findMany({
      where: { userId },
      include: { course: { select: { title: true, category: true } } },
      orderBy: { completedAt: 'desc' },
    });
    const events = await prisma.simulationEvent.findMany({ where: { userId } });
    const incidents = await prisma.incident.findMany({ where: { reportedById: userId } });

    const risk = calculateRisk(progress, events);
    const game = calculateGameStats(progress, events);

    // ---- Build the PDF ----
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set headers so the browser downloads it
    const safeName = user.name.replace(/[^a-z0-9]/gi, '_');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="risk_report_${safeName}.pdf"`);
    doc.pipe(res);

    // Colors
    const teal = '#00b3a0';
    const dark = '#1f2937';
    const gray = '#64748b';

    // Header
    doc.rect(0, 0, doc.page.width, 90).fill(dark);
    doc.fillColor(teal).fontSize(22).text('Human Firewall', 50, 30);
    doc.fillColor('#ffffff').fontSize(11).text('Security Risk Report', 50, 58);
    doc.fillColor('#94a3b8').fontSize(9)
      .text(`Generated: ${new Date().toLocaleString()}`, 50, 72);

    doc.moveDown(4);

    // User info
    doc.fillColor(dark).fontSize(16).text(user.name, 50, 120);
    doc.fillColor(gray).fontSize(10)
      .text(`${user.email}  •  Role: ${user.role}  •  Status: ${user.status}`);

    doc.moveDown(1.5);

    // Risk summary box
    const riskColor = risk.securityScore >= 61 ? '#059669' : risk.securityScore >= 41 ? '#d97706' : '#dc2626';
    const boxY = doc.y;
    doc.roundedRect(50, boxY, doc.page.width - 100, 70, 8).fill('#f1f5f9');
    doc.fillColor(dark).fontSize(11).text('Human Firewall Score', 65, boxY + 12);
    doc.fillColor(riskColor).fontSize(30).text(`${risk.securityScore}/100`, 65, boxY + 28);
    doc.fillColor(dark).fontSize(11).text('Risk Level', 300, boxY + 12);
    doc.fillColor(riskColor).fontSize(20)
      .text(risk.riskLevel.replace('_', ' '), 300, boxY + 30);

    doc.y = boxY + 90;
    doc.moveDown(1);

    // Section: key metrics
    doc.fillColor(teal).fontSize(13).text('Key Metrics');
    doc.moveDown(0.5);
    doc.fillColor(dark).fontSize(10);
    const metrics = [
      ['Quizzes taken', risk.quizzesTaken],
      ['Phishing links clicked', risk.phishingClicks || 0],
      ['Phishing emails reported', risk.phishingReports || 0],
      ['Incidents reported', incidents.length],
      ['Gamification points', game.points],
      ['Level', game.level],
      ['Badges earned', game.badges.length],
    ];
    metrics.forEach(([label, value]) => {
      doc.fillColor(gray).text(`${label}:`, { continued: true })
        .fillColor(dark).text(`  ${value}`);
    });

    doc.moveDown(1);

    // Section: strengths & weaknesses
    doc.fillColor(teal).fontSize(13).text('Assessment');
    doc.moveDown(0.5);
    doc.fillColor(dark).fontSize(10);
    doc.fillColor(gray).text('Strong areas: ', { continued: true })
      .fillColor('#059669').text(risk.strongAreas.length ? risk.strongAreas.join(', ') : 'None yet');
    doc.fillColor(gray).text('Needs improvement: ', { continued: true })
      .fillColor('#dc2626').text(risk.weakAreas.length ? risk.weakAreas.join(', ') : 'None flagged');

    doc.moveDown(1);

    // Section: quiz history table
    doc.fillColor(teal).fontSize(13).text('Training History');
    doc.moveDown(0.5);
    doc.fontSize(9);

    if (progress.length === 0) {
      doc.fillColor(gray).text('No training completed yet.');
    } else {
      // table header
      const startX = 50;
      doc.fillColor(dark).font('Helvetica-Bold');
      doc.text('Course', startX, doc.y, { width: 220, continued: true });
      doc.text('Score', { width: 80, continued: true });
      doc.text('Result', { width: 80, continued: true });
      doc.text('Date');
      doc.font('Helvetica').fillColor(gray);
      doc.moveDown(0.3);

      progress.slice(0, 15).forEach((p) => {
        const y = doc.y;
        doc.fillColor(dark).text(p.course?.title || 'Unknown', startX, y, { width: 220, continued: true });
        doc.text(`${p.score}%`, { width: 80, continued: true });
        doc.fillColor(p.passed ? '#059669' : '#dc2626').text(p.passed ? 'Passed' : 'Failed', { width: 80, continued: true });
        doc.fillColor(gray).text(new Date(p.completedAt).toLocaleDateString());
      });
    }

    // Footer
    doc.fontSize(8).fillColor('#94a3b8')
      .text('This report was generated by the Human Firewall platform. Confidential.',
        50, doc.page.height - 60, { align: 'center', width: doc.page.width - 100 });

    doc.end();
  } catch (err) {
    console.error('Report generation error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate report' });
    }
  }
});

module.exports = router;