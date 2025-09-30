import axios from 'axios';
import { CreateUserDto, User } from '../types/user';

const API_URL = 'http://localhost:3000/api/users';  // ← /api/users

export const createUser = async (token: string, user: CreateUserDto): Promise<User> => {
  const response = await axios.post(API_URL, user, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getUsers = async (token: string): Promise<User[]> => {
  const response = await axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return Array.isArray(response.data) ? response.data : response.data.users || [];
};

export const getUserById = async (token: string, userId: string): Promise<User> => {
  const response = await axios.get(`${API_URL}/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUser = async (token: string, userId: string, role: string): Promise<User> => {
  const response = await axios.patch(
    `${API_URL}/${userId}`,
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
  await axios.delete(`${API_URL}/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};