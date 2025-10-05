import axios from 'axios';
import API_CONFIG from '../config/apiConfig';
import { PaymentType, CreatePaymentTypeDto, UpdatePaymentTypeDto } from '../types/paymentType';

export const paymentTypeService = {
  // Récupérer les types de paiement d'une institution
  getByInstitution: async (token: string, institutionId: string): Promise<PaymentType[]> => {
    const response = await axios.get(`${API_CONFIG.INSTITUTIONS}/${institutionId}/payment-types`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  // Créer un type de paiement
  create: async (token: string, institutionId: string, data: CreatePaymentTypeDto): Promise<PaymentType> => {
    const response = await axios.post(`${API_CONFIG.INSTITUTIONS}/${institutionId}/payment-types`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  // Mettre à jour un type de paiement (à implémenter si la route existe)
  update: async (token: string, paymentTypeId: string, data: UpdatePaymentTypeDto): Promise<PaymentType> => {
    // NOTE: Vérifier si cette route existe dans le backend
    const response = await axios.put(`${API_CONFIG.INSTITUTIONS}/payment-types/${paymentTypeId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  // Supprimer un type de paiement (à implémenter si la route existe)
  delete: async (token: string, paymentTypeId: string): Promise<void> => {
    // NOTE: Vérifier si cette route existe dans le backend
    await axios.delete(`${API_CONFIG.INSTITUTIONS}/payment-types/${paymentTypeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};