const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Ask the Python ML service to predict a user's risk from their features.
// Returns null if the service is unreachable, so the app keeps working
// even if the ML service is down.
async function predictRisk(features) {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/predict`, features, {
      timeout: 4000,
    });
    return response.data;
  } catch (err) {
    console.error('ML service error:', err.message);
    return null;
  }
}

module.exports = { predictRisk };