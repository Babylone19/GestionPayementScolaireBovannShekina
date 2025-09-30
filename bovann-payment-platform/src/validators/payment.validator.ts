import { body, param } from 'express-validator';

export const createPaymentValidation = [
  body('studentId')
    .isUUID()
    .withMessage('Valid student ID required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be positive'),
  body('validFrom')
    .isISO8601()
    .withMessage('ValidFrom must be ISO date'),
  body('validUntil')
    .isISO8601()
    .withMessage('ValidUntil must be ISO date'),
];

export const updatePaymentStatusValidation = [
  param('paymentId')
    .isUUID()
    .withMessage('Valid payment ID required'),
  body('status')
    .isIn(['PENDING', 'VALID', 'EXPIRED'])
    .withMessage('Invalid status value'),
];