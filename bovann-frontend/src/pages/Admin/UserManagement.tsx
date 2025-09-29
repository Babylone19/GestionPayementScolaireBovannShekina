import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/users';
import { User, CreateUserDto } from '../../types/user';
import { FaSearch, FaFilter, FaEdit, FaTrash, FaUserPlus, FaTimes, FaSave, FaUserShield, FaUserTie, FaChartBar, FaShieldAlt } from 'react-icons/fa';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    password: '',
    role: 'SECRETARY',
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchUsers();
  }, [navigate]);

  // Filtrer les utilisateurs en fonction des critères
  useEffect(() => {
    let filtered = users;

    // Filtre par rôle
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filtre par recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, users]);

  const validateForm = () => {
    const { email, password, role } = formData;

    if (!email || !role) {
      setError('Tous les champs sont obligatoires.');
      return false;
    }

    if (!editingUserId && !password) {
      setError('Le mot de passe est obligatoire pour la création.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email invalide.');
      return false;
    }

    if (!editingUserId && password.length < 6) {
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

      if (editingUserId) {
        await updateUser(token, editingUserId, formData.role);
        setSuccess('Utilisateur modifié avec succès !');
      } else {
        await createUser(token, formData);
        setSuccess('Utilisateur créé avec succès !');
      }

      const usersData = await getUsers(token);
      setUsers(usersData);
      setFormData({
        email: '',
        password: '',
        role: 'SECRETARY',
      });
      setEditingUserId(null);
    } catch (error: any) {
      console.error('Erreur lors de la création/mise à jour de l\'utilisateur:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Erreur lors de l\'opération');
      }
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

    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        navigate('/');
        return;
      }
      await deleteUser(token, userToDelete);
      const usersData = await getUsers(token);
      setUsers(usersData);
      setSuccess('Utilisateur supprimé avec succès !');
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Erreur lors de la suppression');
      }
    } finally {
      setLoading(false);
      setShowConfirmation(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setUserToDelete(null);
  };

  const handleEdit = (user: User) => {
    setFormData({
      email: user.email,
      password: '', // On ne montre pas le mot de passe existant
      role: user.role,
    });
    setEditingUserId(user.id);
    setError(null);
    setSuccess(null);
  };

  const cancelEdit = () => {
    setFormData({
      email: '',
      password: '',
      role: 'SECRETARY',
    });
    setEditingUserId(null);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Obtenir l'icône pour chaque rôle
  const getRoleIcon = (role: string) => {
    const icons: Record<string, React.ReactNode> = {
      'ADMIN': <FaUserShield className="text-red-500" />,
      'SECRETARY': <FaUserTie className="text-blue-500" />,
      'ACCOUNTANT': <FaChartBar className="text-green-500" />,
      'GUARD': <FaShieldAlt className="text-purple-500" />
    };
    return icons[role] || <FaUserShield />;
  };

  // Obtenir le libellé du rôle
  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'ADMIN': 'Administrateur',
      'SECRETARY': 'Secrétaire',
      'ACCOUNTANT': 'Comptable',
      'GUARD': 'Gardien'
    };
    return labels[role] || role;
  };

  return (
    <div className="min-h-screen bg-accent flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
          Gestion des Utilisateurs
        </h1>
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full sm:w-auto justify-center"
        >
          ← Retour au Dashboard
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Messages d'alerte */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
              <button
                onClick={() => setSuccess(null)}
                className="float-right text-green-700 hover:text-green-900"
              >
                ×
              </button>
            </div>
          )}

          {/* Formulaire d'ajout/modification */}
          <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                <FaUserPlus className="mr-2 text-blue-500" />
                {editingUserId ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}
              </h2>
              {editingUserId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-xl" />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  placeholder="email@exemple.com"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {!editingUserId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                  <input
                    placeholder="Minimum 6 caractères"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="SECRETARY">Secrétaire</option>
                  <option value="ACCOUNTANT">Comptable</option>
                  <option value="GUARD">Gardien</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
              {editingUserId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition w-full sm:w-auto text-center"
                >
                  Annuler
                </button>
              )}
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 w-full sm:w-auto text-center flex items-center justify-center"
              >
                {loading ? (
                  'Traitement...'
                ) : editingUserId ? (
                  <>
                    <FaSave className="mr-2" />
                    Mettre à jour
                  </>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Ajouter l'utilisateur
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Section Recherche et Filtres */}
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaSearch className="mr-2 text-blue-500" />
              Rechercher et Filtrer
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaFilter className="mr-2 text-purple-500" />
                  Filtrer par Rôle
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
                  <option value="GUARD">Gardien</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recherche (Email, Rôle)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Statistiques des filtres */}
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
                  className="text-red-600 hover:text-red-800 font-medium flex items-center"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* Liste des utilisateurs */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 border-b gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                Liste des Utilisateurs ({filteredUsers.length})
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Total: {users.length}
                </span>
              </div>
            </div>

            <div className="p-4">
              {filteredUsers.length > 0 ? (
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-lg border">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{user.email}</h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            {getRoleIcon(user.role)}
                            <span className="ml-2">{getRoleLabel(user.role)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Aucun utilisateur trouvé</p>
                  <p className="text-gray-400 text-sm">
                    {selectedRole !== 'all' || searchTerm 
                      ? "Aucun utilisateur ne correspond à vos critères de recherche" 
                      : "Aucun utilisateur dans la base de données"
                    }
                  </p>
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
                  disabled={loading}
                  className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition disabled:bg-gray-400 w-full sm:w-auto"
                >
                  {loading ? 'Suppression...' : 'Confirmer la suppression'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;