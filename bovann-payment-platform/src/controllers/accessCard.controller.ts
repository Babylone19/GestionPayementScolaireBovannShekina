import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { ApiError } from '../utils/ApiError';

export const scanCard = async (req: Request, res: Response, next: NextFunction) => {
  const { qrData } = req.body;
  const { id: guardianId } = req.user!;
  
  try {
    // Décoder les données base64 du QR code
    const decodedData = atob(qrData);
    const parsed = JSON.parse(decodedData);
    
    const { studentId, amount, validFrom, validUntil, status } = parsed;

    // Trouver l'étudiant avec ses paiements
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        payments: {
          where: { status: 'VALID' },
          orderBy: { validUntil: 'desc' }
        }
      },
    });

    if (!student) {
      return res.json({
        success: false,
        message: 'Étudiant non trouvé',
        status: 'REFUSED'
      });
    }

    const now = new Date();
    const validFromDate = new Date(validFrom);
    const validUntilDate = new Date(validUntil);

    // Vérification de la date de validité
    if (now < validFromDate) {
      return res.json({
        success: false,
        message: `Accès non encore valide. Valide à partir du ${validFromDate.toLocaleDateString('fr-FR')}.`,
        studentName: `${student.firstName} ${student.lastName}`,
        institution: student.institution,
        status: 'REFUSED'
      });
    }

    if (now > validUntilDate) {
      return res.json({
        success: false,
        message: `Accès expiré. Valide jusqu'au ${validUntilDate.toLocaleDateString('fr-FR')}.`,
        studentName: `${student.firstName} ${student.lastName}`,
        institution: student.institution,
        status: 'EXPIRED'
      });
    }

    // Vérification du statut
    if (status !== 'VALID') {
      return res.json({
        success: false,
        message: `Paiement non validé.`,
        studentName: `${student.firstName} ${student.lastName}`,
        institution: student.institution,
        status: 'REFUSED'
      });
    }

    // Vérifier s'il y a au moins un paiement validé
    const hasValidPayment = student.payments.length > 0;
    if (!hasValidPayment) {
      return res.json({
        success: false,
        message: `Aucun paiement validé.`,
        studentName: `${student.firstName} ${student.lastName}`,
        institution: student.institution,
        status: 'REFUSED'
      });
    }

    // Vérification du nombre de scans aujourd'hui
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Utiliser la dernière carte d'accès (tri par ID au lieu de createdAt)
    const latestAccessCard = await prisma.accessCard.findFirst({
      where: { studentId: studentId },
      orderBy: { id: 'desc' } // Changé de createdAt à id
    });

    if (!latestAccessCard) {
      return res.json({
        success: false,
        message: `Aucune carte d'accès trouvée.`,
        studentName: `${student.firstName} ${student.lastName}`,
        institution: student.institution,
        status: 'REFUSED'
      });
    }

    const todayScans = await prisma.scanLog.count({
      where: {
        cardId: latestAccessCard.id,
        scannedAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    if (todayScans >= 1) {
      return res.json({
        success: false,
        message: `Accès déjà utilisé aujourd'hui.`,
        studentName: `${student.firstName} ${student.lastName}`,
        institution: student.institution,
        status: 'REFUSED'
      });
    }

    // Enregistrement du scan
    await prisma.scanLog.create({
      data: {
        cardId: latestAccessCard.id,
        guardianId,
      },
    });

    res.json({
      success: true,
      message: `Accès autorisé.`,
      studentName: `${student.firstName} ${student.lastName}`,
      institution: student.institution,
      amount: amount,
      validUntil: validUntil,
      status: 'AUTHORIZED'
    });
  } catch (err) {
    console.error('Erreur scan:', err);
    return next(new ApiError(400, 'Données QR invalides'));
  }
};