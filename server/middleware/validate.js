const { body, param, query } = require('express-validator');

const validateCustomer = [
  body('full_name').trim().notEmpty().withMessage('Full name is required')
    .isLength({ max: 150 }).withMessage('Name must be under 150 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required')
    .isLength({ max: 20 }).withMessage('Phone must be under 20 characters'),
  body('age').optional({ nullable: true }).isInt({ min: 1, max: 199 }).withMessage('Age must be between 1 and 199'),
  body('gender').optional({ nullable: true }).isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('address').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('medical_notes').optional({ nullable: true }).trim().isLength({ max: 2000 }),
];

const validateTest = [
  body('customer_id').isInt({ min: 1 }).withMessage('Valid customer ID is required'),
  body('test_type').trim().notEmpty().withMessage('Test type is required')
    .isLength({ max: 100 }).withMessage('Test type must be under 100 characters'),
  body('result').trim().notEmpty().withMessage('Result is required')
    .isLength({ max: 255 }).withMessage('Result must be under 255 characters'),
  body('notes').optional({ nullable: true }).trim().isLength({ max: 2000 }),
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'staff']).withMessage('Role must be admin or staff'),
];

module.exports = { validateCustomer, validateTest, validateLogin, validateRegister };
