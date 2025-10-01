import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { getUsers, deleteUser } from '../../api/users';
import { User } from '../../types/user';
import { 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaUserPlus, 
  FaUserShield, 
  FaUserTie, 
  FaChartBar, 
  FaShieldAlt,
  FaEye,
  FaTimes,
  FaSync,
  FaCalendarAlt
} from 'react-icons/fa';

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrer les utilisateurs en fonction des critères
  useEffect(() => {
    let filtered = users;

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getRoleLabel(user.role).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, users]);

  const fetchUsers = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/');
        return;
      }
      setLoading(true);
      const usersData = await getUsers(token);
      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      setError('Erreur lors de la récupération des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    try {
      const token = getToken();
      if (!token) {
        navigate('/');
        return;
      }
      await deleteUser(token, userToDelete);
      // Recharger la liste
      await fetchUsers();
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Erreur lors de la suppression');
      }
    } finally {
      setDeleteLoading(false);
      setShowConfirmation(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setUserToDelete(null);
  };

  const handleEdit = (user: User) => {
    navigate('/admin/users/edit', { state: { user } });
  };

  const handleView = (user: User) => {
    navigate('/admin/users/view', { state: { user } });
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, React.ReactNode> = {
      'ADMIN': <FaUserShield className="text-red-500" />,
      'SECRETARY': <FaUserTie className="text-blue-500" />,
      'ACCOUNTANT': <FaChartBar className="text-green-500" />,
      'GUARD': <FaShieldAlt className="text-purple-500" />
    };
    return icons[role] || <FaUserShield />;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'SECRETARY': 'Secrétaire',
      'ACCOUNTANT': 'Comptable',
      'GUARD': 'Agent de sécurité'
    };
    return labels[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-red-100 text-red-800 border-red-200',
      'SECRETARY': 'bg-blue-100 text-blue-800 border-blue-200',
      'ACCOUNTANT': 'bg-green-100 text-green-800 border-green-200',
      'GUARD': 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'Non spécifiée';
    }
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const getRoleStats = () => {
    const stats = {
      total: users.length,
      admin: users.filter(u => u.role === 'ADMIN').length,
      secretary: users.filter(u => u.role === 'SECRETARY').length,
      accountant: users.filter(u => u.role === 'ACCOUNTANT').length,
      guard: users.filter(u => u.role === 'GUARD').length,
    };
    return stats;
  };

  const roleStats = getRoleStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header pour mobile */}
      <div className="bg-white shadow-sm border-b lg:hidden">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-800">Liste des Utilisateurs</h1>
        </div>
      </div>

      <div className="p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestion des Utilisateurs</h1>
                <p className="text-gray-600 mt-1">
                  {users.length} utilisateur(s) au total
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/users/create')}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center w-full lg:w-auto"
              >
                <FaUserPlus className="mr-2" />
                Ajouter un utilisateur
              </button>
            </div>
          </div>

          {/* Messages d'erreur */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-700 hover:text-red-900"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{roleStats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{roleStats.admin}</div>
              <div className="text-sm text-gray-600">Administrateurs</div>
            </div>
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{roleStats.secretary}</div>
              <div className="text-sm text-gray-600">Secrétaires</div>
            </div>
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{roleStats.accountant}</div>
              <div className="text-sm text-gray-600">Comptables</div>
            </div>
            <div className="bg-white rounded-lg border p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{roleStats.guard}</div>
              <div className="text-sm text-gray-600">Agents de sécurité</div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher un utilisateur
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher par email ou rôle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="lg:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par rôle
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="SECRETARY">Secrétaire</option>
                  <option value="ACCOUNTANT">Comptable</option>
                  <option value="GUARD">Agent de sécurité</option>
                </select>
              </div>

              <div className="lg:w-auto flex items-end">
                <button
                  onClick={fetchUsers}
                  className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition flex items-center"
                  title="Rafraîchir la liste"
                >
                  <FaSync />
                </button>
              </div>
            </div>

            {/* Résultats du filtre */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 gap-2">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                {filteredUsers.length} utilisateur(s) trouvé(s)
                {selectedRole !== 'all' && ` - Rôle: ${getRoleLabel(selectedRole)}`}
                {searchTerm && ` pour "${searchTerm}"`}
              </span>
              {(selectedRole !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedRole('all');
                    setSearchTerm('');
                  }}
                  className="text-red-600 hover:text-red-800 font-medium flex items-center text-sm"
                >
                  <FaTimes className="mr-1" />
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* Liste des utilisateurs */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Liste des Utilisateurs
                <span className="text-gray-500 font-normal ml-2">
                  ({filteredUsers.length})
                </span>
              </h2>
            </div>

            <div className="p-6">
              {filteredUsers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilisateur</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Rôle</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date de création</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="font-semibold text-gray-600">
                                  {user.email.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{user.email}</div>
                                <div className="text-sm text-gray-500">ID: {user.id.substring(0, 8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(user.role)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                                {getRoleLabel(user.role)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            <div className="flex items-center space-x-2">
                              <FaCalendarAlt className="text-gray-400" />
                              <span>{formatDate(user.createdAt)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleView(user)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Voir les détails"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleEdit(user)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Aucun utilisateur trouvé</p>
                  <p className="text-gray-400 text-sm mb-6">
                    {selectedRole !== 'all' || searchTerm 
                      ? "Aucun utilisateur ne correspond à vos critères de recherche" 
                      : "Aucun utilisateur dans la base de données"
                    }
                  </p>
                  {(selectedRole !== 'all' || searchTerm) ? (
                    <button
                      onClick={() => {
                        setSelectedRole('all');
                        setSearchTerm('');
                      }}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                      Réinitialiser les filtres
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/admin/users/create')}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center mx-auto"
                    >
                      <FaUserPlus className="mr-2" />
                      Ajouter le premier utilisateur
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition w-full sm:w-auto"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition disabled:bg-gray-400 w-full sm:w-auto flex items-center justify-center"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Suppression...
                    </>
                  ) : (
                    'Confirmer la suppression'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;