import axios from 'axios';
import { LoginCredentials } from '../types/user';
import API_CONFIG from '../config/apiConfig';  // ← Ajouter cette ligne

export const login = async (credentials: LoginCredentials): Promise<{ 
  token: string; 
  user: { 
    id: string; 
    email: string; 
    role: string 
  } 
}> => {
  const response = await axios.post(API_CONFIG.AUTH.LOGIN, credentials);  // ← Utiliser la config
  return response.data;
};