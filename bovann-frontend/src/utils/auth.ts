export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const getUserRole = (): string | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).role : null;
};
