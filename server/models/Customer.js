const pool = require('../config/db');

const Customer = {
  async findAll({ search, limit = 50, offset = 0 }) {
    let query = 'SELECT * FROM customers';
    const params = [];

    if (search) {
      query += ' WHERE full_name ILIKE $1 OR phone ILIKE $1 OR CAST(id AS TEXT) = $2';
      params.push(`%${search}%`, search);
    }

    query += ' ORDER BY date_registered DESC';
    params.push(limit);
    query += ` LIMIT $${params.length}`;
    params.push(offset);
    query += ` OFFSET $${params.length}`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  async count(search) {
    let query = 'SELECT COUNT(*) FROM customers';
    const params = [];

    if (search) {
      query += ' WHERE full_name ILIKE $1 OR phone ILIKE $1 OR CAST(id AS TEXT) = $2';
      params.push(`%${search}%`, search);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count, 10);
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create({ full_name, phone, age, gender, address, medical_notes }) {
    const result = await pool.query(
      `INSERT INTO customers (full_name, phone, age, gender, address, medical_notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [full_name, phone, age || null, gender || null, address || null, medical_notes || null]
    );
    return result.rows[0];
  },

  async update(id, { full_name, phone, age, gender, address, medical_notes }) {
    const result = await pool.query(
      `UPDATE customers SET full_name=$1, phone=$2, age=$3, gender=$4, address=$5, medical_notes=$6
       WHERE id=$7 RETURNING *`,
      [full_name, phone, age || null, gender || null, address || null, medical_notes || null, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM customers WHERE id = $1', [id]);
  },
};

module.exports = Customer;
