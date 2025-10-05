import { Institution } from './institution';

export interface PaymentType {
  id: string;
  name: string;
  description?: string;
  amount?: number;
  isActive: boolean;
  institutionId: string;
  institution?: Institution;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentTypeDto {
  name: string;
  description?: string;
  amount?: number;
  isActive?: boolean;
  institutionId: string;
}

export interface UpdatePaymentTypeDto extends Partial<CreatePaymentTypeDto> {}

export interface PaymentTypeFormData {
  name: string;
  description?: string;
  amount?: string; // string pour le formulaire
  isActive: boolean;
  institutionId: string;
}