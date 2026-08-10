// Point values for actions
const POINTS = {
  QUIZ_PASSED: 50,
  QUIZ_TAKEN: 10,        // participation, even if failed
  PHISHING_REPORTED: 30, // good behavior
  PERFECT_SCORE: 25,     // bonus for 100%
};

// Badge definitions — each has a check function
const BADGE_DEFS = [
  { id: 'first_steps', name: 'First Steps', icon: '🎯', desc: 'Completed your first quiz',
    check: (s) => s.quizzesTaken >= 1 },
  { id: 'quick_learner', name: 'Quick Learner', icon: '📚', desc: 'Passed 3 quizzes',
    check: (s) => s.quizzesPassed >= 3 },
  { id: 'perfect', name: 'Perfectionist', icon: '💯', desc: 'Scored 100% on a quiz',
    check: (s) => s.perfectScores >= 1 },
  { id: 'phishing_spotter', name: 'Phishing Spotter', icon: '🎣', desc: 'Reported a phishing attempt',
    check: (s) => s.phishingReported >= 1 },
  { id: 'vigilant', name: 'Vigilant', icon: '🛡️', desc: 'Reported 3 phishing attempts',
    check: (s) => s.phishingReported >= 3 },
  { id: 'point_master', name: 'Point Master', icon: '⭐', desc: 'Earned 200+ points',
    check: (s) => s.points >= 200 },
];

// Given a user's progress records and simulation events, compute their game stats
function calculateGameStats(progress = [], events = []) {
  const quizzesTaken = progress.length;
  const quizzesPassed = progress.filter((p) => p.passed).length;
  const perfectScores = progress.filter((p) => p.score === 100).length;
  const phishingReported = events.filter((e) => e.eventType === 'REPORT_SUBMITTED').length;

  // Calculate points
  let points = 0;
  points += quizzesPassed * POINTS.QUIZ_PASSED;
  points += quizzesTaken * POINTS.QUIZ_TAKEN;
  points += perfectScores * POINTS.PERFECT_SCORE;
  points += phishingReported * POINTS.PHISHING_REPORTED;

  const stats = { quizzesTaken, quizzesPassed, perfectScores, phishingReported, points };

  // Determine which badges are earned
  const badges = BADGE_DEFS.filter((b) => b.check(stats)).map((b) => ({
    id: b.id,
    name: b.name,
    icon: b.icon,
    desc: b.desc,
  }));

  // Simple level: 1 level per 100 points
  const level = Math.floor(points / 100) + 1;

  return { ...stats, points, level, badges };
}

module.exports = { calculateGameStats, BADGE_DEFS };