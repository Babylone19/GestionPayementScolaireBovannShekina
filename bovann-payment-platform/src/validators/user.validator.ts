
import { body } from 'express-validator';

export const createUserValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['ADMIN', 'SECRETARY', 'ACCOUNTANT', 'GUARD'])
    .withMessage('Invalid role'),
];