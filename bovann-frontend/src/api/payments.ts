import axios from 'axios';
import { Payment, PaymentStatus } from '../types/payment';
import API_CONFIG from '../config/apiConfig';

export const createPayment = async (
  token: string,
  payment: Omit<Payment, 'id' | 'status' | 'qrCodeUrl' | 'paymentDate' | 'validationDate'>
): Promise<Payment> => {
  const response = await axios.post(API_CONFIG.PAYMENTS, payment, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const validatePayment = async (token: string, paymentId: string): Promise<Payment> => {
  const response = await axios.patch(
    `${API_CONFIG.PAYMENTS}/${paymentId}/validate`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getPayments = async (token: string): Promise<Payment[]> => {
  const response = await axios.get(API_CONFIG.PAYMENTS, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getStudentPayments = async (token: string, studentId: string): Promise<Payment[]> => {
  const response = await axios.get(`${API_CONFIG.PAYMENTS}?studentId=${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const generateQrCode = async (token: string, paymentId: string): Promise<{ qrCodeUrl: string }> => {
  const response = await axios.post(
    `${API_CONFIG.PAYMENTS}/${paymentId}/generate-qr`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};