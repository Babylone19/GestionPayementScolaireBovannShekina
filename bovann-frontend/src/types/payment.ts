// types/payment.ts
import { Student } from './student';
import { PaymentType } from './paymentType';
import { AccessCard } from './card';

export type PaymentStatus = 'PENDING' | 'VALID' | 'EXPIRED' | 'CANCELLED';

export interface Payment {
  id: string;
  amount: number;
  validFrom: string;
  validUntil: string;
  status: PaymentStatus;
  reference?: string;
  details?: string;
  studentId: string;
  student?: Student;
  paymentTypeId: string;
  paymentType?: PaymentType;
  createdAt: string;
  updatedAt: string;
  accessCard?: AccessCard;
  // Champs optionnels pour compatibilité
  currency?: string;
  paymentDate?: string;
}

export interface CreatePaymentDto {
  studentId: string;
  amount: number;
  currency?: string;
  reference?: string;
  details?: string;
  validFrom: string | Date;
  validUntil: string | Date;
  paymentTypeId?: string;
}

export interface UpdatePaymentDto {
  status?: PaymentStatus;
  amount?: number;
  validUntil?: string;
}