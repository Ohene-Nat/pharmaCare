require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./config/db');

async function seed() {
  try {
    // Update role constraint to include superadmin
    await pool.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('superadmin', 'admin', 'staff'));
    `);

    // Create notifications table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        actor_id INTEGER NOT NULL REFERENCES users(id),
        actor_name VARCHAR(100) NOT NULL,
        actor_role VARCHAR(20) NOT NULL,
        action VARCHAR(20) NOT NULL CHECK (action IN ('added', 'deleted')),
        target_name VARCHAR(100) NOT NULL,
        target_role VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed admin
    const adminHash = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password = $3`,
      ['Admin', 'admin@pharmacare.com', adminHash, 'admin']
    );

    // Seed superadmin
    const superHash = await bcrypt.hash('shadow@234', 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password = $3, role = $4`,
      ['Nathaniel', 'ansahnat56@gmail.com', superHash, 'superadmin']
    );

    console.log('Seed complete!');
    console.log('Admin login — Email: admin@pharmacare.com  Password: admin123');
    console.log('SuperAdmin login — Email: ansahnat56@gmail.com  Password: shadow@234');
    await pool.end();
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
