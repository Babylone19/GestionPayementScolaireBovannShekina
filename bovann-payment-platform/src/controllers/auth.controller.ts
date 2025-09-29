import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import { ApiError } from '../utils/ApiError';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return next(new ApiError(401, 'Invalid credentials'));

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return next(new ApiError(401, 'Invalid credentials'));

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1d' }
  );

  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, role: user.role },
  });
};