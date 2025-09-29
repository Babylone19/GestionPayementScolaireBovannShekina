import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';
import { createUserValidation } from '../validators/user.validator';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

const router = Router();

// Seul l'ADMIN peut gérer les utilisateurs
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN'),
  ...createUserValidation,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, errors.array()[0].msg as string));
    }
    next();
  },
  createUser
);

router.get('/', authenticateToken, authorizeRoles('ADMIN'), getAllUsers);
router.get('/:id', authenticateToken, authorizeRoles('ADMIN'), getUserById);
router.patch('/:id', authenticateToken, authorizeRoles('ADMIN'), updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteUser);

export default router;