# PharmaCare Health Records System (PHRS)

A modern full-stack web application for small pharmacies to store and manage customer health records and minor medical test results.

## Tech Stack

- **Frontend:** React (Vite), Recharts, Axios, React Router
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Auth:** JWT + bcrypt

## Project Structure

```
pharma/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── styles/         # CSS files (glassmorphism)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                 # Express backend
│   ├── config/             # DB & app config
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth & validation
│   ├── models/             # Data access layer
│   ├── routes/             # API routes
│   ├── server.js
│   ├── .env
│   └── package.json
└── database/
    └── schema.sql          # PostgreSQL schema
```

## Setup

### 1. Database

Create a PostgreSQL database and run the schema:

```bash
psql -U postgres -f database/schema.sql
```

### 2. Backend

```bash
cd server
npm install
# Edit .env with your PostgreSQL credentials and a strong JWT_SECRET
npm run dev
```

The API will start on `http://localhost:5000`.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

The app will start on `http://localhost:3000` and proxy API requests to the backend.

### 4. Create First Admin User

Since user registration requires admin auth, seed the first admin via a one-time script or direct API call:

```bash
# Using curl (run while server is running):
node -e "
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const pool = new Pool({ host:'localhost', port:5432, user:'postgres', password:'your_password', database:'pharmacare' });
bcrypt.hash('admin123', 10).then(hash => {
  pool.query('INSERT INTO users (name, email, password, role) VALUES (\$1, \$2, \$3, \$4)', ['Admin', 'admin@pharmacare.com', hash, 'admin'])
    .then(() => { console.log('Admin created! Email: admin@pharmacare.com, Password: admin123'); pool.end(); })
    .catch(err => { console.error(err); pool.end(); });
});
"
```

## API Endpoints

| Method | Endpoint                  | Description            | Auth     |
| ------ | ------------------------- | ---------------------- | -------- |
| POST   | `/api/auth/login`         | Login                  | Public   |
| POST   | `/api/auth/register`      | Register user          | Admin    |
| GET    | `/api/auth/profile`       | Get current user       | Auth     |
| GET    | `/api/customers`          | List customers         | Auth     |
| POST   | `/api/customers`          | Create customer        | Auth     |
| GET    | `/api/customers/:id`      | Get customer           | Auth     |
| PUT    | `/api/customers/:id`      | Update customer        | Auth     |
| POST   | `/api/tests`              | Record test            | Auth     |
| GET    | `/api/tests`              | List all tests         | Auth     |
| GET    | `/api/tests/customer/:id` | Tests by customer      | Auth     |
| GET    | `/api/reports/daily`      | Daily report           | Auth     |
| GET    | `/api/reports/summary`    | Dashboard summary      | Auth     |
| GET    | `/api/reports/weekly`     | Weekly stats           | Auth     |
| GET    | `/api/users`              | List users             | Admin    |
| DELETE | `/api/users/:id`          | Delete user            | Admin    |

## Features

- JWT authentication with role-based access (Admin / Staff)
- Customer registration and management
- Medical test recording (Malaria, BP, Temperature, Weight, Custom)
- Health history timeline per customer
- Search by name, phone, or customer ID
- Dashboard analytics with charts (Recharts)
- Daily/weekly reports with CSV export
- Glassmorphism UI with responsive design
