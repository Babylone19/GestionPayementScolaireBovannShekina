import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { ApiError } from '../utils/ApiError';
import { validationResult } from 'express-validator';

export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const studentData = req.body;

  try {
    // Vérifier si l'étudiant existe déjà - version alternative
    const existingStudent = await prisma.student.findMany({
      where: { 
        OR: [
          { email: studentData.email },
          { phone: studentData.phone }
        ]
      },
    });

    if (existingStudent.length > 0) {
      return next(new ApiError(409, 'Un étudiant avec cet email ou téléphone existe déjà'));
    }

    const student = await prisma.student.create({
      data: studentData,
    });
    
    res.status(201).json({ success: true, student });
  } catch (err: any) {
    console.error('Erreur création étudiant:', err);
    
    // Gestion spécifique des erreurs Prisma
    if (err.code === 'P2002') {
      return next(new ApiError(409, 'Un étudiant avec cet email existe déjà'));
    }
    
    next(new ApiError(500, 'Erreur lors de la création de l\'étudiant'));
  }
};

export const getAllStudents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(' Récupération des étudiants...');
    
    const students = await prisma.student.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(` ${students.length} étudiants récupérés avec succès`);
    res.json({ success: true, students });
    
  } catch (err) {
    console.error(' Erreur récupération étudiants:', err);
    next(new ApiError(500, 'Erreur lors de la récupération des étudiants'));
  }
};