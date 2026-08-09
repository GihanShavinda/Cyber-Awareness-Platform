// Maps a 0-100 security score to a risk level (SRS section 15)
function getRiskLevel(score) {
  if (score >= 81) return 'VERY_LOW';
  if (score >= 61) return 'LOW';
  if (score >= 41) return 'MEDIUM';
  if (score >= 21) return 'HIGH';
  return 'CRITICAL';
}

// Given a user's progress records, compute their risk profile.
// progress: array of { score, passed, course: { category } }
function calculateRisk(progress) {
  if (!progress || progress.length === 0) {
    return {
      securityScore: 0,
      riskLevel: 'CRITICAL',
      quizzesTaken: 0,
      weakAreas: [],
      strongAreas: [],
      categoryBreakdown: [],
    };
  }

  // Overall security score = average quiz score
  const totalScore = progress.reduce((sum, p) => sum + (p.score || 0), 0);
  const securityScore = Math.round(totalScore / progress.length);

  // Group scores by course category
  const byCategory = {};
  for (const p of progress) {
    const category = p.course?.category || 'General';
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push(p.score || 0);
  }

  const categoryBreakdown = Object.keys(byCategory).map((category) => {
    const scores = byCategory[category];
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return { category, averageScore: avg };
  });

  // Weak areas: category average below 60. Strong: 80 or above.
  const weakAreas = categoryBreakdown.filter((c) => c.averageScore < 60).map((c) => c.category);
  const strongAreas = categoryBreakdown.filter((c) => c.averageScore >= 80).map((c) => c.category);

  return {
    securityScore,
    riskLevel: getRiskLevel(securityScore),
    quizzesTaken: progress.length,
    weakAreas,
    strongAreas,
    categoryBreakdown,
  };
}

module.exports = { calculateRisk, getRiskLevel };