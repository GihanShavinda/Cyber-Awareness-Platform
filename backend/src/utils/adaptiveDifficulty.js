// Decide what phishing difficulty a user is ready for, based on their
// security score and how they've handled past simulations.
//
// stats: { securityScore, phishingClicks, phishingReports }
function recommendDifficulty(stats) {
  const { securityScore = 50, phishingClicks = 0, phishingReports = 0 } = stats;

  // Net phishing behavior: reports are good, clicks are bad
  const netBehavior = phishingReports - phishingClicks;

  // Start from the security score band
  let level;
  if (securityScore >= 75) level = 'hard';
  else if (securityScore >= 45) level = 'medium';
  else level = 'easy';

  // Adjust by recent behavior — clicking drops them down, reporting bumps up
  if (phishingClicks > phishingReports && level === 'hard') level = 'medium';
  if (phishingClicks > phishingReports && level === 'medium') level = 'easy';
  if (netBehavior >= 3 && level === 'medium') level = 'hard';

  // Explanation for the admin UI
  let reason;
  if (level === 'hard') reason = 'Strong performer — ready for subtle, advanced simulations.';
  else if (level === 'medium') reason = 'Developing awareness — standard difficulty simulations.';
  else reason = 'Needs practice — obvious, educational simulations recommended.';

  return { difficulty: level, reason };
}

module.exports = { recommendDifficulty };