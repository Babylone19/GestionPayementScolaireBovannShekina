import axios from 'axios';
import { ScanCardDto, ScanResult } from '../types/card';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'http://backend:3000/api/auth'
  : 'http://localhost:3000/api/auth';

export const scanCard = async (token: string, qrData: string): Promise<ScanResult> => {
  const response = await axios.post(`${API_URL}/scan`, { qrData }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
