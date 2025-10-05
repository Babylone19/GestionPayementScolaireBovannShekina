import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { createUser } from '../../api/users';
import { CreateUserDto, UserRole } from '../../types/user';
import { FaUserPlus, FaSave, FaUserShield, FaUserTie, FaChartBar, FaShieldAlt, FaArrowLeft, FaCrown } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

const UserManagement: React.FC = () => {
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    password: '',
    role: 'SECRETARY',
    institutionId: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Rôles disponibles selon l'utilisateur connecté
  const getAvailableRoles = (): UserRole[] => {
    const allRoles: UserRole[] = ['SECRETARY', 'ACCOUNTANT', 'GUARD', 'ADMIN', 'SUPER_ADMIN'];
    
    if (currentUser?.role === 'SUPER_ADMIN') {
      return allRoles; // SUPER_ADMIN peut créer tous les rôles
    }
    
    if (currentUser?.role === 'ADMIN') {
      return ['SECRETARY', 'ACCOUNTANT', 'GUARD', 'ADMIN']; // ADMIN ne peut pas créer SUPER_ADMIN
    }
    
    return ['SECRETARY', 'ACCOUNTANT', 'GUARD']; // Par défaut
  };

  const validateForm = () => {
    const { email, password, role } = formData;

    if (!email || !password || !role) {
      setError('Tous les champs sont obligatoires.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email invalide.');
      return false;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        navigate('/');
        return;
      }

      // Préparer les données pour l'API
      const userData: CreateUserDto = {
        email: formData.email,
        password: formData.password,
        role: formData.role
      };

      // Si l'utilisateur connecté a une institution, l'assigner automatiquement
      if (currentUser?.institutionId) {
        userData.institutionId = currentUser.institutionId;
      }

      await createUser(token, userData);
      setSuccess('Utilisateur créé avec succès !');

      // Réinitialiser le formulaire
      setFormData({
        email: '',
        password: '',
        role: 'SECRETARY',
        institutionId: currentUser?.institutionId || ''
      });
      
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Erreur lors de la création de l\'utilisateur');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getRoleIcon = (role: UserRole) => {
    const icons: Record<UserRole, React.ReactNode> = {
      'SUPER_ADMIN': <FaCrown className="text-yellow-500" />,
      'ADMIN': <FaUserShield className="text-red-500" />,
      'SECRETARY': <FaUserTie className="text-blue-500" />,
      'ACCOUNTANT': <FaChartBar className="text-green-500" />,
      'GUARD': <FaShieldAlt className="text-purple-500" />
    };
    return icons[role] || <FaUserShield />;
  };

  const getRoleDescription = (role: UserRole) => {
    const descriptions: Record<UserRole, string> = {
      'SUPER_ADMIN': 'Accès complet à toutes les institutions',
      'ADMIN': 'Accès complet au système de l\'institution',
      'SECRETARY': 'Gestion des étudiants et inscriptions',
      'ACCOUNTANT': 'Gestion des paiements et finances',
      'GUARD': 'Scan des cartes et contrôle d\'accès'
    };
    return descriptions[role];
  };

  const getRoleDisplayName = (role: UserRole) => {
    const names: Record<UserRole, string> = {
      'SUPER_ADMIN': 'Super Administrateur',
      'ADMIN': 'Administrateur',
      'SECRETARY': 'Secrétaire',
      'ACCOUNTANT': 'Comptable',
      'GUARD': 'Agent de sécurité'
    };
    return names[role];
  };

  const availableRoles = getAvailableRoles();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header pour mobile */}
      <div className="bg-white shadow-sm border-b lg:hidden">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-800">Ajouter un Utilisateur</h1>
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          {/* En-tête pour desktop */}
          <div className="hidden lg:block mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Ajouter un Utilisateur</h1>
                <p className="text-gray-600 mt-1">
                  Créez un nouveau compte utilisateur avec les permissions appropriées
                  {currentUser?.institution?.name && ` pour ${currentUser.institution.name}`}
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/users/list')}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Voir la liste
              </button>
            </div>
          </div>

          {/* Messages d'alerte */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="font-medium">Erreur:</span>
                  <span className="ml-2">{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-700 hover:text-red-900 p-1 rounded"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="font-medium">Succès:</span>
                  <span className="ml-2">{success}</span>
                </div>
                <button
                  onClick={() => setSuccess(null)}
                  className="text-green-700 hover:text-green-900 p-1 rounded"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulaire d'ajout */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaUserPlus className="mr-3 text-blue-500" />
                  Informations de l'utilisateur
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse Email *
                    </label>
                    <input
                      placeholder="exemple@bovann.edu"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe *
                    </label>
                    <input
                      placeholder="Minimum 6 caractères"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Le mot de passe doit contenir au moins 6 caractères
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rôle de l'utilisateur *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      required
                    >
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {getRoleDisplayName(role)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      Rôle actuel: {getRoleDisplayName(currentUser?.role || 'ADMIN')}
                    </p>
                  </div>

                  {currentUser?.institution?.name && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Institution:</strong> {currentUser.institution.name}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        L'utilisateur sera automatiquement assigné à cette institution
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => navigate('/admin/users/list')}
                      className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition w-full sm:w-auto text-center"
                    >
                      Annuler
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 w-full sm:w-auto text-center flex items-center justify-center"
                    >
                      {loading ? (
                        'Création en cours...'
                      ) : (
                        <>
                          <FaUserPlus className="mr-2" />
                          Créer l'utilisateur
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Informations sur les rôles */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FaUserShield className="mr-2 text-purple-500" />
                  Types de Rôles
                </h3>
                
                <div className="space-y-4">
                  {availableRoles.map((role) => (
                    <div 
                      key={role}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.role === role 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="p-2 bg-white rounded-lg">
                          {getRoleIcon(role)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {getRoleDisplayName(role)}
                          </h4>
                          <p className="text-xs text-gray-600">
                            {getRoleDescription(role)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 text-sm mb-2">
                    ⚠️ Important
                  </h4>
                  <p className="text-yellow-700 text-xs">
                    {currentUser?.role === 'SUPER_ADMIN' 
                      ? 'En tant que Super Admin, vous pouvez créer tous les types de rôles.'
                      : 'Les administrateurs ont un accès complet au système. Attribuez ce rôle avec prudence.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-2">Instructions</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Tous les champs marqués d'un astérisque (*) sont obligatoires</li>
              <li>• L'email doit être valide et unique dans le système</li>
              <li>• Le mot de passe doit contenir au moins 6 caractères</li>
              <li>• Choisissez le rôle approprié selon les responsabilités de l'utilisateur</li>
              <li>• L'utilisateur sera automatiquement assigné à votre institution</li>
              {currentUser?.role !== 'SUPER_ADMIN' && (
                <li>• Vous ne pouvez pas créer d'utilisateurs avec un rôle supérieur au vôtre</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;