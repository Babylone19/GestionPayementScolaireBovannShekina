import axios from 'axios';
import API_CONFIG from '../config/apiConfig';
import { Program, CreateProgramDto, UpdateProgramDto } from '../types/program';

export const programService = {
  // Récupérer les programmes d'une institution
  getByInstitution: async (token: string, institutionId: string): Promise<Program[]> => {
    const response = await axios.get(`${API_CONFIG.INSTITUTIONS}/${institutionId}/programs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  // Créer un programme
  create: async (token: string, institutionId: string, data: CreateProgramDto): Promise<Program> => {
    const response = await axios.post(`${API_CONFIG.INSTITUTIONS}/${institutionId}/programs`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  // Mettre à jour un programme (à implémenter si la route existe)
  update: async (token: string, programId: string, data: UpdateProgramDto): Promise<Program> => {
    // NOTE: Vérifier si cette route existe dans le backend
    const response = await axios.put(`${API_CONFIG.INSTITUTIONS}/programs/${programId}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  // Supprimer un programme (à implémenter si la route existe)
  delete: async (token: string, programId: string): Promise<void> => {
    // NOTE: Vérifier si cette route existe dans le backend
    await axios.delete(`${API_CONFIG.INSTITUTIONS}/programs/${programId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};