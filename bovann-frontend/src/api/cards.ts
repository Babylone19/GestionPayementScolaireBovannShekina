import axios from 'axios';
import { ScanCardDto, ScanResult } from '../types/card';
import API_CONFIG from '../config/apiConfig';

export const scanCard = async (token: string, qrData: string): Promise<ScanResult> => {
  const response = await axios.post(`${API_CONFIG.CARDS}/scan`, { qrData }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};