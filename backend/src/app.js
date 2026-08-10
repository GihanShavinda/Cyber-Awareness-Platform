require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const lessonRoutes = require('./routes/lessons');
const quizRoutes = require('./routes/quizzes');
const progressRoutes = require('./routes/progress');
const riskRoutes = require('./routes/risk');
const adminRoutes = require('./routes/admin');
const campaignRoutes = require('./routes/campaigns');
const gamificationRoutes = require('./routes/gamification');
const userRoutes = require('./routes/users');
const incidentRoutes = require('./routes/incidents');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const predictionRoutes = require('./routes/prediction');
const reportRoutes = require('./routes/reports');
const auditRoutes = require('./routes/audit');
const queueTestRoutes = require('./routes/queueTest');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/queue', queueTestRoutes);

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Health check route: proves the API talks to the database
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      message: 'Backend and database are connected',
      dbTime: result.rows[0].now,
    });
  } catch (err) {
    console.error('DB error:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});