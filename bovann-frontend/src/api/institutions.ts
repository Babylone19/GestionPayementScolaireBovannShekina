// api/institutions.ts
import axios from 'axios';
import API_CONFIG from '../config/apiConfig';
import { Institution, CreateInstitutionDto, UpdateInstitutionDto } from '../types/institution';

export const institutionService = {
  getAll: async (token: string): Promise<Institution[]> => {
    const response = await axios.get(API_CONFIG.INSTITUTIONS, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  getById: async (token: string, id: string): Promise<Institution> => {
    const response = await axios.get(`${API_CONFIG.INSTITUTIONS}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  create: async (token: string, data: CreateInstitutionDto): Promise<Institution> => {
    const response = await axios.post(API_CONFIG.INSTITUTIONS, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  update: async (token: string, id: string, data: UpdateInstitutionDto): Promise<Institution> => {
    const response = await axios.put(`${API_CONFIG.INSTITUTIONS}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  delete: async (token: string, id: string): Promise<void> => {
    await axios.delete(`${API_CONFIG.INSTITUTIONS}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};