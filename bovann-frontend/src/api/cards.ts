import axios from 'axios';
import { ScanCardDto, ScanResult } from '../types/card';

const API_URL = 'https://gestionpayementscolairebovannshekina.onrender.com/api/cards';  // ← /api/cards

export const scanCard = async (token: string, qrData: string): Promise<ScanResult> => {
  const response = await axios.post(`${API_URL}/scan`, { qrData }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};