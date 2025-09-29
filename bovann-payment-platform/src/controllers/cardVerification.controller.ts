import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { ApiError } from '../utils/ApiError';

export const verifyCard = async (req: Request, res: Response, next: NextFunction) => {
  const { studentId } = req.query;

  try {
    if (!studentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID étudiant requis' 
      });
    }

    // Trouver l'étudiant avec ses paiements validés
    const student = await prisma.student.findUnique({
      where: { id: studentId as string },
      include: {
        payments: {
          where: { 
            status: 'VALID'
          },
          orderBy: { validUntil: 'desc' }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Étudiant non trouvé' 
      });
    }

    const now = new Date();
    const hasValidPayment = student.payments.length > 0;
    const latestPayment = student.payments[0];

    if (!hasValidPayment) {
      return res.json({
        success: false,
        studentName: `${student.firstName} ${student.lastName}`,
        institution: student.institution,
        message: 'Aucun paiement valide trouvé',
        status: 'REFUSED'
      });
    }

    // Vérifier si le paiement est encore valide
    const isValid = latestPayment.validUntil >= now && latestPayment.validFrom <= now;

    res.json({
      success: isValid,
      studentName: `${student.firstName} ${student.lastName}`,
      institution: student.institution,
      amount: latestPayment.amount,
      validFrom: latestPayment.validFrom,
      validUntil: latestPayment.validUntil,
      message: isValid 
        ? 'Accès AUTORISÉ' 
        : 'Paiement expiré',
      status: isValid ? 'AUTHORIZED' : 'EXPIRED'
    });

  } catch (err) {
    console.error('Erreur vérification carte:', err);
    next(new ApiError(500, 'Erreur lors de la vérification'));
  }
};