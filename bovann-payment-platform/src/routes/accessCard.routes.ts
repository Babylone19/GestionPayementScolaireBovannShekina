import { Router } from 'express';
import { scanCard } from '../controllers/accessCard.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

const router = Router();

router.post(
  '/scan',
  authenticateToken,
  authorizeRoles('GUARD'),
  body('qrData').notEmpty().withMessage('QR data is required'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg as string));
    }
    next();
  },
  scanCard
);

export default router;