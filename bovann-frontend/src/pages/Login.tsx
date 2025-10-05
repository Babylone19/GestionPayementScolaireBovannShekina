import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login as apiLogin } from '../api/auth';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validation basique
      if (!email || !password) {
        setError('Veuillez remplir tous les champs');
        setIsLoading(false);
        return;
      }

      console.log('Tentative de connexion avec:', { email });
      
      const response = await apiLogin({ email, password });
      
      console.log('Reponse recue:', response);
      
      // VERIFICATION RENFORCEE
      if (!response) {
        throw new Error('Aucune reponse du serveur');
      }
      
      if (!response.token) {
        throw new Error('Token manquant dans la reponse');
      }
      
      if (!response.user) {
        throw new Error('Donnees utilisateur manquantes dans la reponse');
      }
      
      if (!response.user.role) {
        throw new Error('Role utilisateur manquant');
      }

      console.log('Connexion reussie, role:', response.user.role);
      
      // Utiliser le contexte d'authentification
      login(response.token, response.user);
      
      // Rediriger vers le dashboard approprié
      const dashboardRoute = getDashboardRoute(response.user.role);
      console.log('Redirection vers:', dashboardRoute);
      navigate(dashboardRoute);
      
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Une erreur est survenue lors de la connexion';
      
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
          errorMessage = 'Impossible de contacter le serveur. Verifiez votre connexion internet.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Erreur interne du serveur. Veuillez reessayer plus tard.';
        } else if (err.message.includes('401') || err.message.includes('Login failed')) {
          errorMessage = 'Email ou mot de passe incorrect.';
        } else if (err.message.includes('structure') || err.message.includes('manquant')) {
          errorMessage = 'Probleme de configuration. Contactez l\'administrateur.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getDashboardRoute = (role: string): string => {
    switch (role) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'SECRETARY':
        return '/secretary/dashboard';
      case 'ACCOUNTANT':
        return '/accountant/dashboard';
      case 'GUARD':
        return '/guard/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">BOVANN</h1>
          <p className="text-gray-600">Plateforme de Gestion Scolaire</p>
          <p className="text-sm text-gray-500 mt-2">Connectez-vous a votre compte</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Adresse Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;