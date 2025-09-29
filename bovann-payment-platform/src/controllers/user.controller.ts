import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/db';
import { ApiError } from '../utils/ApiError';

// Créer un utilisateur (ADMIN)
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return next(new ApiError(409, 'User already exists'));

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, role }, 
    select: { id: true, email: true, role: true },
  });

  res.status(201).json({ success: true, user });
};

// Lister tous les utilisateurs (ADMIN)
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
    });
    res.json({ success: true, users });
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch users'));
  }
};

// Obtenir un utilisateur par ID (ADMIN)
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    if (!user) return next(new ApiError(404, 'User not found'));
    res.json({ success: true, user });
  } catch (err) {
    next(new ApiError(500, 'Failed to fetch user'));
  }
};

// Mettre à jour un utilisateur (ADMIN)
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { email, role, password } = req.body;

  if (req.user?.id === id) {
    return next(new ApiError(403, 'You cannot modify your own account via this endpoint'));
  }

  try {
    const updateData: any = {};
    if (email) updateData.email = email;
    if (role && ['ADMIN', 'SECRETARY', 'ACCOUNTANT', 'GUARD'].includes(role)) {
      updateData.role = role;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, role: true },
    });

    res.json({ success: true, user });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return next(new ApiError(404, 'User not found'));
    }
    next(new ApiError(500, 'Failed to update user'));
  }
};

// Supprimer un utilisateur (ADMIN)
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (req.user?.id === id) {
    return next(new ApiError(403, 'You cannot delete your own account'));
  }

  try {
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return next(new ApiError(404, 'User not found'));
    }
    next(new ApiError(500, 'Failed to delete user'));
  }
};