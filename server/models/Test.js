const pool = require('../config/db');

const Test = {
  async create({ customer_id, test_type, result, notes, staff_id }) {
    const res = await pool.query(
      `INSERT INTO tests (customer_id, test_type, result, notes, staff_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [customer_id, test_type, result, notes || null, staff_id]
    );
    return res.rows[0];
  },

  async findByCustomerId(customerId) {
    const res = await pool.query(
      `SELECT t.*, u.name AS staff_name
       FROM tests t LEFT JOIN users u ON t.staff_id = u.id
       WHERE t.customer_id = $1 ORDER BY t.date_recorded DESC`,
      [customerId]
    );
    return res.rows;
  },

  async findAll({ limit = 50, offset = 0 }) {
    const res = await pool.query(
      `SELECT t.*, c.full_name AS customer_name, u.name AS staff_name
       FROM tests t
       LEFT JOIN customers c ON t.customer_id = c.id
       LEFT JOIN users u ON t.staff_id = u.id
       ORDER BY t.date_recorded DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return res.rows;
  },

  async countToday() {
    const res = await pool.query(
      `SELECT COUNT(*) FROM tests WHERE date_recorded::date = CURRENT_DATE`
    );
    return parseInt(res.rows[0].count, 10);
  },

  async dailyReport(date) {
    const res = await pool.query(
      `SELECT t.*, c.full_name AS customer_name, u.name AS staff_name
       FROM tests t
       LEFT JOIN customers c ON t.customer_id = c.id
       LEFT JOIN users u ON t.staff_id = u.id
       WHERE t.date_recorded::date = $1
       ORDER BY t.date_recorded DESC`,
      [date]
    );
    return res.rows;
  },

  async summary() {
    const totalCustomers = await pool.query('SELECT COUNT(*) FROM customers');
    const testsToday = await pool.query(
      `SELECT COUNT(*) FROM tests WHERE date_recorded::date = CURRENT_DATE`
    );
    const mostCommonTest = await pool.query(
      `SELECT test_type, COUNT(*) as count FROM tests GROUP BY test_type ORDER BY count DESC LIMIT 1`
    );
    const recentTests = await pool.query(
      `SELECT t.*, c.full_name AS customer_name
       FROM tests t LEFT JOIN customers c ON t.customer_id = c.id
       ORDER BY t.date_recorded DESC LIMIT 10`
    );
    const testsPerDay = await pool.query(
      `SELECT date_recorded::date AS date, COUNT(*) AS count
       FROM tests WHERE date_recorded >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY date ORDER BY date`
    );
    const commonTests = await pool.query(
      `SELECT test_type, COUNT(*) AS count FROM tests GROUP BY test_type ORDER BY count DESC LIMIT 10`
    );
    const weeklyStats = await pool.query(
      `SELECT date_recorded::date AS date, COUNT(*) AS count
       FROM tests WHERE date_recorded >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY date ORDER BY date`
    );

    return {
      totalCustomers: parseInt(totalCustomers.rows[0].count, 10),
      testsToday: parseInt(testsToday.rows[0].count, 10),
      mostCommonTest: mostCommonTest.rows[0] || null,
      recentTests: recentTests.rows,
      testsPerDay: testsPerDay.rows,
      commonTests: commonTests.rows,
      weeklyStats: weeklyStats.rows,
    };
  },

  async weeklySummary() {
    const res = await pool.query(
      `SELECT date_recorded::date AS date, test_type, COUNT(*) AS count
       FROM tests WHERE date_recorded >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY date, test_type ORDER BY date, count DESC`
    );
    return res.rows;
  },
};

module.exports = Test;
