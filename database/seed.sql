-- PharmaCare Health Records System - Seed Data
-- Default admin user (password: admin123)
-- The hashed password below corresponds to 'admin123' using bcrypt

INSERT INTO users (name, email, password, role)
VALUES ('Admin User', 'admin@pharmacare.com', '$2b$10$PLACEHOLDER_HASH', 'admin');

-- Run the server's seed endpoint or use the register API to create proper hashed passwords.
-- This file is for reference only.
