import { Router } from 'express';
import { createPayment, getPaymentsByStudent, updatePaymentStatus } from '../controllers/payment.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { createPaymentValidation, updatePaymentStatusValidation } from '../validators/payment.validator';
import { body, validationResult, param } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

const router = Router();

// Route pour créer un paiement
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ACCOUNTANT'),
  ...createPaymentValidation,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg as string));
    }
    next();
  },
  createPayment
);

// Route pour récupérer les paiements d'un étudiant
router.get(
  '/',
  authenticateToken,
  authorizeRoles('ACCOUNTANT'),
  getPaymentsByStudent
);

// Route pour mettre à jour le statut d'un paiement
router.patch(
  '/:paymentId/status',
  authenticateToken,
  authorizeRoles('ACCOUNTANT'),
  ...updatePaymentStatusValidation,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg as string));
    }
    next();
  },
  updatePaymentStatus
);

export default router;
