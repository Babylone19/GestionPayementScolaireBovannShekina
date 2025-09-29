import { UserRole } from '../types/user';

export const isAdmin = (): boolean => {
  return getUserRole() === 'ADMIN';
};

export const isSecretary = (): boolean => {
  return getUserRole() === 'SECRETARY';
};

export const isAccountant = (): boolean => {
  return getUserRole() === 'ACCOUNTANT';
};

export const isGuard = (): boolean => {
  return getUserRole() === 'GUARD';
};

const getUserRole = (): UserRole | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).role : null;
};
