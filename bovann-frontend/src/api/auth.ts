import axios from 'axios';
import { LoginCredentials } from '../types/user';

// TOUJOURS utiliser localhost depuis le navigateur
const API_BASE = 'http://localhost:3000/api/auth';

export const login = async (credentials: LoginCredentials): Promise<{ token: string; user: { id: string; email: string; role: string } }> => {
  const response = await axios.post(`${API_BASE}/login`, credentials);
  return response.data;
};