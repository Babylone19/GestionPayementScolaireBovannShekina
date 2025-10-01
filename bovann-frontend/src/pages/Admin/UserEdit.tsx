import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from '../../types/user';
import { 
  FaArrowLeft, 
  FaUserShield, 
  FaUserTie, 
  FaChartBar, 
  FaShieldAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaEdit
} from 'react-icons/fa';

const UserView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user: User = location.state?.user;

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Utilisateur non trouvé</p>
          <button 
            onClick={() => navigate('/admin/users/list')}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    const icons = {
      'ADMIN': <FaUserShield className="text-red-500 text-2xl" />,
      'SECRETARY': <FaUserTie className="text-blue-500 text-2xl" />,
      'ACCOUNTANT': <FaChartBar className="text-green-500 text-2xl" />,
      'GUARD': <FaShieldAlt className="text-purple-500 text-2xl" />
    };
    return icons[role as keyof typeof icons] || <FaUserShield />;
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      'ADMIN': 'Administrateur',
      'SECRETARY': 'Secrétaire',
      'ACCOUNTANT': 'Comptable',
      'GUARD': 'Agent de sécurité'
    };
    return labels[role as keyof typeof labels] || role;
  };

  const getRoleDescription = (role: string) => {
    const descriptions = {
      'ADMIN': 'Accès complet au système avec tous les privilèges',
      'SECRETARY': 'Gestion des étudiants et des inscriptions',
      'ACCOUNTANT': 'Gestion des paiements et rapports financiers',
      'GUARD': 'Contrôle d\'accès et scan des cartes étudiantes'
    };
    return descriptions[role as keyof typeof descriptions] || 'Utilisateur standard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/admin/users/list')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaArrowLeft className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Détails de l'Utilisateur</h1>
                  <p className="text-gray-600">Informations complètes du compte</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/users/edit', { state: { user } })}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <FaEdit className="mr-2" />
                Modifier
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Carte utilisateur */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{user.email}</h2>
                    <p className="text-gray-600">ID: {user.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Informations du Compte</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <FaEnvelope className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FaCalendarAlt className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Date de création</p>
                          <p className="font-medium">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Rôle et Permissions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        {getRoleIcon(user.role)}
                        <div>
                          <p className="text-sm text-gray-600">Rôle</p>
                          <p className="font-medium">{getRoleLabel(user.role)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Description</p>
                        <p className="text-sm text-gray-700">{getRoleDescription(user.role)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions et statut */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Réinitialiser le mot de passe
                  </button>
                  <button className="w-full text-left p-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    Désactiver le compte
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Statut du Compte</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">Actif</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  L'utilisateur peut accéder au système normalement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;