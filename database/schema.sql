-- PharmaCare Health Records System - Database Schema
-- Run this script to create the database and tables

CREATE DATABASE pharmacare;

\c pharmacare;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'staff' CHECK (role IN ('superadmin', 'admin', 'staff')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    age INTEGER CHECK (age > 0 AND age < 200),
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    address TEXT,
    medical_notes TEXT,
    date_registered TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tests table
CREATE TABLE IF NOT EXISTS tests (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    test_type VARCHAR(100) NOT NULL,
    result VARCHAR(255) NOT NULL,
    notes TEXT,
    staff_id INTEGER NOT NULL REFERENCES users(id),
    date_recorded TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for search performance
CREATE INDEX idx_customers_full_name ON customers(full_name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_tests_customer_id ON tests(customer_id);
CREATE INDEX idx_tests_date_recorded ON tests(date_recorded);
CREATE INDEX idx_tests_test_type ON tests(test_type);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER NOT NULL REFERENCES users(id),
    actor_name VARCHAR(100) NOT NULL,
    actor_role VARCHAR(20) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('added', 'deleted')),
    target_name VARCHAR(100) NOT NULL,
    target_role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_created_at ON notifications(created_at);
