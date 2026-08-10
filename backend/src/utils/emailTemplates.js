// A shared wrapper so all emails share branding
function wrap(title, bodyHtml) {
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#0a0e1a; color:#e8edf7; border-radius:10px; overflow:hidden;">
    <div style="background:#111827; padding:24px; border-bottom:2px solid #00e5c7;">
      <h1 style="margin:0; color:#00e5c7; font-size:20px;">🛡️ Human Firewall</h1>
    </div>
    <div style="padding:24px;">
      <h2 style="color:#e8edf7; font-size:18px;">${title}</h2>
      ${bodyHtml}
    </div>
    <div style="padding:16px 24px; background:#111827; color:#5b6b84; font-size:12px;">
      This is an automated message from the Human Firewall platform.
    </div>
  </div>`;
}

function welcomeEmail(name) {
  return wrap('Welcome to Human Firewall', `
    <p>Hi ${name},</p>
    <p>Your account has been created. You can now log in to start your security training, take quizzes, and improve your Human Firewall Score.</p>
    <p>Stay vigilant!</p>
  `);
}

function quizResultEmail(name, quizTitle, score, passed) {
  return wrap(passed ? 'Quiz Passed 🎉' : 'Quiz Result', `
    <p>Hi ${name},</p>
    <p>You completed <strong>${quizTitle}</strong> with a score of <strong>${score}%</strong>.</p>
    <p style="color:${passed ? '#22e07a' : '#ffb443'};">
      ${passed ? 'Congratulations — you passed!' : 'You didn\'t pass this time. Review the material and try again.'}
    </p>
  `);
}

function incidentUpdateEmail(name, title, status) {
  return wrap('Your Incident Report Was Updated', `
    <p>Hi ${name},</p>
    <p>Your reported incident "<strong>${title}</strong>" has been updated to: <strong>${status}</strong>.</p>
    <p>Thank you for helping keep the organization secure.</p>
  `);
}

module.exports = { welcomeEmail, quizResultEmail, incidentUpdateEmail };