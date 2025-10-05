// types/user.ts
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'SECRETARY' | 'ACCOUNTANT' | 'GUARD';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  institutionId?: string;
  institution?: {
    id: string;
    name: string;
    logo?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
  institutionId?: string;
}