import axios from 'axios';
import { CreateUserDto, User } from '../types/user';
import API_CONFIG from '../config/apiConfig';

export const createUser = async (token: string, user: CreateUserDto): Promise<User> => {
  const response = await axios.post(API_CONFIG.USERS, user, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getUsers = async (token: string): Promise<User[]> => {
  const response = await axios.get(API_CONFIG.USERS, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return Array.isArray(response.data) ? response.data : response.data.users || [];
};

export const getUserById = async (token: string, userId: string): Promise<User> => {
  const response = await axios.get(`${API_CONFIG.USERS}/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUser = async (token: string, userId: string, role: string): Promise<User> => {
  const response = await axios.patch(
    `${API_CONFIG.USERS}/${userId}`,
    { role },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteUser = async (token: string, userId: string): Promise<void> => {
  await axios.delete(`${API_CONFIG.USERS}/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};