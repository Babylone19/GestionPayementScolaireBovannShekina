// src/types/payment.ts

export type PaymentStatus = 'PENDING' | 'VALID' | 'EXPIRED';

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentDate?: Date;
  validationDate?: Date;
  qrCodeUrl?: string;
  reference: string;
  details?: string;
  validFrom?: string;
  validUntil?: string;
  cumulativeAmount?: number;
  totalAmount?: number;
}

export interface CreatePaymentDto {
  studentId: string;
  amount: number;
  currency: string;
  reference: string;
  details?: string;
  validFrom: string;
  validUntil: string;
}