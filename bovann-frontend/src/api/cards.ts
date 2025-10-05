import { API_CONFIG } from '../config/apiConfig';

export interface ScanCardDto {
  studentId: string;
  guardianId: string;
  location?: string;
}

export const scanCard = async (token: string, scanData: ScanCardDto) => {
  const response = await fetch(`${API_CONFIG.CARDS}/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(scanData),
  });

  if (!response.ok) {
    throw new Error('Scan failed');
  }

  return response.json();
};

export const verifyCard = async (token: string, studentId: string) => {
  const response = await fetch(`${API_CONFIG.CARDS}/verify?studentId=${studentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Verification failed');
  }

  return response.json();
};