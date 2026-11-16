const { validationResult } = require('express-validator');
const Test = require('../models/Test');

const createTest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const testData = { ...req.body, staff_id: req.user.id };
    const test = await Test.create(testData);
    res.status(201).json(test);
  } catch (err) {
    console.error('Create test error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getTestsByCustomer = async (req, res) => {
  try {
    const tests = await Test.findByCustomerId(req.params.id);
    res.json(tests);
  } catch (err) {
    console.error('Get tests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getAllTests = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const tests = await Test.findAll({
      limit: Math.min(parseInt(limit, 10), 100),
      offset: parseInt(offset, 10),
    });
    res.json(tests);
  } catch (err) {
    console.error('Get all tests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createTest, getTestsByCustomer, getAllTests };
