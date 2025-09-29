import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { ApiError } from '../utils/ApiError';
import { generateQR } from '../utils/qrGenerator';

export const createPayment = async (req: Request, res: Response, next: NextFunction) => {
  const { studentId, amount, currency = 'XOF', reference, details, validFrom, validUntil } = req.body;

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) return next(new ApiError(404, 'Student not found'));

    // Créer le paiement directement en statut VALID
    const payment = await prisma.payment.create({
      data: {
        amount: amount,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        status: 'VALID', // Directement validé
        studentId: studentId,
      },
    });

    // Générer les données pour le QR code
    // Générer du texte clair pour le QR code
    const qrData = `
ÉTUDIANT: ${student.firstName} ${student.lastName}
INSTITUTION: ${student.institution}
MONTANT: ${amount} ${currency}
VALIDE DU: ${new Date(validFrom).toLocaleDateString('fr-FR')}
VALIDE JUSQU'AU: ${new Date(validUntil).toLocaleDateString('fr-FR')}
STATUT: VALIDE

URL DE VÉRIFICATION: http://localhost:3000/api/public/verify-public?studentId=${student.id}
`;

    const qrImage = await generateQR(qrData);

    // Vérifier si une carte existe déjà
    const existingAccessCard = await prisma.accessCard.findFirst({
      where: { studentId: studentId }
    });

    let accessCard;
    if (existingAccessCard) {
      accessCard = await prisma.accessCard.update({
        where: { id: existingAccessCard.id },
        data: {
          qrData: qrImage,
          paymentId: payment.id,
        },
      });
    } else {
      accessCard = await prisma.accessCard.create({
        data: {
          qrData: qrImage,
          studentId: studentId,
          paymentId: payment.id,
        },
      });
    }

    res.status(201).json({
      success: true,
      payment,
      accessCard: {
        ...accessCard,
        qrData: qrImage
      }
    });
  } catch (err) {
    console.error('Erreur création paiement:', err);
    next(new ApiError(500, 'Failed to create payment and card'));
  }
};

// AJOUTEZ CES FONCTIONS MANQUANTES
export const getPaymentsByStudent = async (req: Request, res: Response, next: NextFunction) => {
  const { studentId } = req.query;

  if (!studentId) {
    return next(new ApiError(400, 'Student ID is required'));
  }

  try {
    const payments = await prisma.payment.findMany({
      where: {
        studentId: studentId as string,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ success: true, payments });
  } catch (err) {
    console.error('Erreur récupération paiements:', err);
    next(new ApiError(500, 'Failed to fetch payments'));
  }
};

export const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { paymentId } = req.params;
  const { status } = req.body;

  // Validation du statut
  const validStatuses = ['PENDING', 'VALID', 'EXPIRED'];
  if (!validStatuses.includes(status)) {
    return next(new ApiError(400, `Invalid status value. Must be one of: ${validStatuses.join(', ')}`));
  }

  try {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });

    res.json({ success: true, payment });
  } catch (err: any) {
    console.error('Erreur mise à jour statut:', err);
    if (err.code === 'P2025') {
      return next(new ApiError(404, 'Payment not found'));
    }
    next(new ApiError(500, 'Failed to update payment status'));
  }
};