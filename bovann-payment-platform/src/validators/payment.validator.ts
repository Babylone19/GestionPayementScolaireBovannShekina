import { body, param } from 'express-validator';

export const createPaymentValidation = [
  body('studentId').isMongoId().withMessage('Valid student ID required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('validFrom').isISO8601().toDate().withMessage('ValidFrom must be ISO date'),
  body('validUntil').isISO8601().toDate().withMessage('ValidUntil must be ISO date'),
];

export const updatePaymentStatusValidation = [
  param('paymentId').isMongoId().withMessage('Valid payment ID required'),
  body('status').isIn(['PENDING', 'VALIDATED', 'FAILED']).withMessage('Invalid status value'),
];
