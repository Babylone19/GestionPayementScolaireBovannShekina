import axios from 'axios';
import { Payment, PaymentStatus } from '../types/payment';

const PAYMENTS_API_URL = 'http://195.26.241.68:3000/api/payments';  // ← /api/payments

export const createPayment = async (
  token: string,
  payment: Omit<Payment, 'id' | 'status' | 'qrCodeUrl' | 'paymentDate' | 'validationDate'>
): Promise<Payment> => {
  const response = await axios.post(PAYMENTS_API_URL, payment, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const validatePayment = async (token: string, paymentId: string): Promise<Payment> => {
  const response = await axios.patch(
    `${PAYMENTS_API_URL}/${paymentId}/validate`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getPayments = async (token: string): Promise<Payment[]> => {
  const response = await axios.get(PAYMENTS_API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getStudentPayments = async (token: string, studentId: string): Promise<Payment[]> => {
  const response = await axios.get(`${PAYMENTS_API_URL}?studentId=${studentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const generateQrCode = async (token: string, paymentId: string): Promise<{ qrCodeUrl: string }> => {
  const response = await axios.post(
    `${PAYMENTS_API_URL}/${paymentId}/generate-qr`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};