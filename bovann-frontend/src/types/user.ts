export type UserRole = 'ADMIN' | 'SECRETARY' | 'ACCOUNTANT' | 'GUARD';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: string; // Ajoutez cette ligne
  updatedAt?: string; // Optionnel: si vous voulez aussi la date de mise à jour
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
