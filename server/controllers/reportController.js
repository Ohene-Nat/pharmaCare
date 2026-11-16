const Test = require('../models/Test');

const getDailyReport = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const tests = await Test.dailyReport(date);
    res.json({ date, tests, count: tests.length });
  } catch (err) {
    console.error('Daily report error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getSummary = async (req, res) => {
  try {
    const summary = await Test.summary();
    res.json(summary);
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getWeeklySummary = async (req, res) => {
  try {
    const data = await Test.weeklySummary();
    res.json(data);
  } catch (err) {
    console.error('Weekly summary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getDailyReport, getSummary, getWeeklySummary };
