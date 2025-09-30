// Configuration centralisée pour toutes les URLs API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  AUTH: {
    BASE: `${API_BASE_URL}/auth`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
  },
  USERS: `${API_BASE_URL}/users`,
  STUDENTS: `${API_BASE_URL}/students`,
  PAYMENTS: `${API_BASE_URL}/payments`,
  CARDS: `${API_BASE_URL}/cards`,
};

export default API_CONFIG;