const pool = require('../config/db');

const Notification = {
  async create({ actor_id, actor_name, actor_role, action, target_name, target_role }) {
    const result = await pool.query(
      `INSERT INTO notifications (actor_id, actor_name, actor_role, action, target_name, target_role)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [actor_id, actor_name, actor_role, action, target_name, target_role]
    );
    return result.rows[0];
  },

  async findAll(limit = 50) {
    const result = await pool.query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  },

  async countUnread(since) {
    const result = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE created_at > $1',
      [since]
    );
    return parseInt(result.rows[0].count, 10);
  },
};

module.exports = Notification;
