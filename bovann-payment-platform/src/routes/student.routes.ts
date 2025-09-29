import { Router } from 'express';
import { createStudent, getAllStudents } from '../controllers/student.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { createStudentValidation } from '../validators/student.validator';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

const router = Router();

router.post(
  '/',
  authenticateToken,
  authorizeRoles('SECRETARY', 'ADMIN'),
  ...createStudentValidation, // Ceci inclut maintenant les nouvelles validations
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg as string));
    }
    next();
  },
  createStudent
);

router.get(
  '/',
  authenticateToken,
  authorizeRoles('SECRETARY', 'ADMIN', 'ACCOUNTANT'),
  getAllStudents
);

export default router;