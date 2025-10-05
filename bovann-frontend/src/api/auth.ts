import { API_CONFIG } from '../config/apiConfig';
import { LoginCredentials, User, CreateUserDto } from '../types/user';

export const login = async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
  try {
    console.log('Appel API vers:', API_CONFIG.AUTH.LOGIN);
    
    const response = await fetch(API_CONFIG.AUTH.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Reponse API brute:', data);
    
    // VOTRE API RETOURNE CETTE STRUCTURE :
    // {
    //   "success": true,
    //   "message": "Connexion réussie", 
    //   "data": {
    //     "user": {...},
    //     "accessToken": "eyJ..."
    //   }
    // }
    
    if (data.success && data.data && data.data.user && data.data.accessToken) {
      console.log('Structure detectee: { success, message, data: { user, accessToken } }');
      // Retourner la structure attendue par le frontend
      return {
        token: data.data.accessToken,
        user: data.data.user
      };
    } else {
      console.error('Structure inattendue:', data);
      throw new Error('Structure de réponse serveur invalide');
    }
  } catch (error) {
    console.error('Erreur login API:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erreur réseau lors de la connexion');
  }
};

export const register = async (userData: CreateUserDto, token: string): Promise<User> => {
  const response = await fetch(API_CONFIG.AUTH.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
};

export const getProfile = async (token: string): Promise<User> => {
  const response = await fetch(API_CONFIG.AUTH.PROFILE, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  return response.json();
};

export const getUsers = async (token: string): Promise<User[]> => {
  const response = await fetch(API_CONFIG.AUTH.BASE, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
};