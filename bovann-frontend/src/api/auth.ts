import axios from 'axios';
import { LoginCredentials } from '../types/user';

const API_URL = 'http://localhost:3000/api/auth';

export const login = async (credentials: LoginCredentials): Promise<{ token: string; user: { id: string; email: string; role: string } }> => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};
