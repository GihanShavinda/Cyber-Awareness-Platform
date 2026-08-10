const nodemailer = require('nodemailer');

let transporter = null;

// Set up the mail transporter. Uses Ethereal (a test inbox) by default —
// emails are captured, not delivered to real people, and viewable via a URL.
// To use real SMTP later, set the SMTP_* env vars and this switches automatically.
async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    // Real SMTP (production) — configured via environment
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    // Development — create a throwaway Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('📧 Ethereal test email account ready');
  }
  return transporter;
}

// Send an email. Never throws — logs errors so email issues don't break
// the main action. In dev, logs a preview URL to view the captured email.
async function sendEmail(to, subject, html) {
  try {
    const tx = await getTransporter();
    const info = await tx.sendMail({
      from: '"Human Firewall" <no-reply@humanfirewall.app>',
      to,
      subject,
      html,
    });

    // In dev (Ethereal), print a URL where you can view the sent email
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log(`📧 Email sent — preview: ${preview}`);

    return { success: true, preview };
  } catch (err) {
    console.error('Email send error:', err.message);
    return { success: false };
  }
}

module.exports = { sendEmail };