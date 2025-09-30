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

    const payment = await prisma.payment.create({
      data: {
        amount: amount,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        status: 'VALID',
        studentId: studentId,
      },
    });

    const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
    const verificationUrl = `${serverUrl}/api/public/verify-public?studentId=${student.id}`;

    const qrData = `
ETUDIANT: ${student.firstName} ${student.lastName}
INSTITUTION: ${student.institution}
MONTANT: ${amount} ${currency}
VALIDE DU: ${new Date(validFrom).toLocaleDateString('fr-FR')}
VALIDE JUSQU AU: ${new Date(validUntil).toLocaleDateString('fr-FR')}
STATUT: VALIDE

URL DE VERIFICATION: ${verificationUrl}
`;

    const qrImage = await generateQR(qrData);

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
    console.error('Erreur creation paiement:', err);
    next(new ApiError(500, 'Failed to create payment and card'));
  }
};

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
    console.error('Erreur recuperation paiements:', err);
    next(new ApiError(500, 'Failed to fetch payments'));
  }
};

export const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { paymentId } = req.params;
  const { status } = req.body;

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
    console.error('Erreur mise a jour statut:', err);
    if (err.code === 'P2025') {
      return next(new ApiError(404, 'Payment not found'));
    }
    next(new ApiError(500, 'Failed to update payment status'));
  }
};