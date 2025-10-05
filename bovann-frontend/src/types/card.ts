export interface AccessCard {
  id: string;
  qrData: string;
  studentId: string;
  paymentId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    institution?: {
      id: string;
      name: string;
    };
  };
}

export interface ScanCardDto {
  qrData: string;
  guardianId: string;
  location?: string;
}

export interface ScanResult {
  success: boolean;
  message: string;
  card?: AccessCard;
  student?: {
    id: string;
    lastName: string;
    firstName: string;
    email: string;
    phone: string;
    institution?: {
      id: string;
      name: string;
    };
  };
  payment?: {
    id: string;
    amount: number;
    validUntil: string;
    status: string;
    paymentType?: {
      name: string;
    };
  };
  scanLog?: {
    id: string;
    scannedAt: string;
    location?: string;
    success: boolean;
  };
  // Propriétés supplémentaires pour compatibilité
  studentName?: string;
  institution?: string;
  validUntil?: string;
  paymentStatus?: string;
}

export interface ScanLog {
  id: string;
  cardId: string;
  scannedAt: string;
  guardianId: string;
  location?: string;
  success: boolean;
  card?: AccessCard;
}