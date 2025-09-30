import axios from 'axios';
import { LoginCredentials } from '../types/user';

// Même logique ici
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'http://backend:3000/api/auth'
  : 'http://localhost:3000/api/auth';

export const login = async (credentials: LoginCredentials): Promise<{ token: string; user: { id: string; email: string; role: string } }> => {
  const response = await axios.post(`${API_BASE}/login`, credentials);
  return response.data;
};