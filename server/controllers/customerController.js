const { validationResult } = require('express-validator');
const Customer = require('../models/Customer');

const getCustomers = async (req, res) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;
    const customers = await Customer.findAll({
      search,
      limit: Math.min(parseInt(limit, 10), 100),
      offset: parseInt(offset, 10),
    });
    const total = await Customer.count(search);
    res.json({ customers, total });
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    console.error('Get customer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const createCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateCustomer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const existing = await Customer.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Customer not found' });

    const customer = await Customer.update(req.params.id, req.body);
    res.json(customer);
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer };
