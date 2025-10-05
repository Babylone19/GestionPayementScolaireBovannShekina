import axios from 'axios';
import { CreateUserDto, User } from '../types/user';
import API_CONFIG from '../config/apiConfig';

export const createUser = async (token: string, user: CreateUserDto): Promise<User> => {
  const response = await axios.post(API_CONFIG.AUTH.REGISTER, user, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data || response.data;
};

export const getUsers = async (token: string): Promise<User[]> => {
  const response = await axios.get(API_CONFIG.AUTH.USERS, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data || response.data;
};

export const getUserById = async (token: string, userId: string): Promise<User> => {
  const response = await axios.get(`${API_CONFIG.AUTH.BASE}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data || response.data;
};

export const updateUser = async (token: string, userId: string, role: string): Promise<User> => {
  const response = await axios.patch(
    `${API_CONFIG.AUTH.BASE}/users/${userId}`,
    { role },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data || response.data;
};

export const deleteUser = async (token: string, userId: string): Promise<void> => {
  await axios.delete(`${API_CONFIG.AUTH.BASE}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};