export type UserRole = 'ADMIN' | 'SECRETARY' | 'ACCOUNTANT' | 'GUARD';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role: UserRole;
}
