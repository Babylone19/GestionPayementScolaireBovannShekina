import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../../utils/auth";
import { getUsers } from "../../api/users";
import { getStudents } from "../../api/students";
import { User } from "../../types/user";
import { Student } from "../../types/student";
import UserCard from "../../components/UserCard";
import { FaUsers, FaSignOutAlt, FaCog, FaUserGraduate, FaUniversity, FaUserShield, FaUserTie, FaChartBar } from "react-icons/fa";

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate("/");
          return;
        }
        setLoading(true);
        
        // Récupérer les utilisateurs et les étudiants en parallèle
        const [usersData, studentsData] = await Promise.all([
          getUsers(token),
          getStudents(token)
        ]);
        
        setUsers(usersData);
        setStudents(studentsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setError("Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    removeToken();
    navigate("/");
  };

  // Statistiques des utilisateurs par rôle
  const userStats = users.reduce((acc, user) => {
    if (!acc[user.role]) {
      acc[user.role] = 0;
    }
    acc[user.role]++;
    return acc;
  }, {} as Record<string, number>);

  // Statistiques des étudiants par institution
  const institutionStats = students.reduce((acc, student) => {
    const institution = student.institution || 'Non spécifiée';
    if (!acc[institution]) {
      acc[institution] = 0;
    }
    acc[institution]++;
    return acc;
  }, {} as Record<string, number>);

  // Obtenir le libellé du rôle
  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      'ADMIN': 'Administrateurs',
      'SECRETARY': 'Secrétaires',
      'ACCOUNTANT': 'Comptables',
      'USER': 'Utilisateurs'
    };
    return roles[role] || role;
  };

  // Obtenir l'icône et la couleur pour chaque rôle
  const getRoleConfig = (role: string) => {
    const config: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
      'ADMIN': {
        icon: <FaUserShield className="text-2xl sm:text-3xl" />,
        color: 'text-red-500',
        bgColor: 'bg-red-50'
      },
      'SECRETARY': {
        icon: <FaUserTie className="text-2xl sm:text-3xl" />,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50'
      },
      'ACCOUNTANT': {
        icon: <FaChartBar className="text-2xl sm:text-3xl" />,
        color: 'text-green-500',
        bgColor: 'bg-green-50'
      },
      'USER': {
        icon: <FaUsers className="text-2xl sm:text-3xl" />,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50'
      }
    };
    return config[role] || { icon: <FaUsers />, color: 'text-gray-500', bgColor: 'bg-gray-50' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent">
        <p className="text-gray-800 text-lg">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
          Tableau de bord Administrateur
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full sm:w-auto justify-center"
        >
          <FaSignOutAlt className="mr-2" /> Déconnexion
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6">
        {/* Cartes statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow rounded-xl p-4 sm:p-6 flex items-center">
            <div className={`p-3 rounded-lg bg-blue-50 mr-3 sm:mr-4`}>
              <FaUsers className="text-2xl sm:text-3xl text-blue-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Total Utilisateurs</p>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">{users.length}</h2>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-xl p-4 sm:p-6 flex items-center">
            <div className={`p-3 rounded-lg bg-green-50 mr-3 sm:mr-4`}>
              <FaUserGraduate className="text-2xl sm:text-3xl text-green-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Total Étudiants</p>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">{students.length}</h2>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-xl p-4 sm:p-6 flex items-center">
            <div className={`p-3 rounded-lg bg-purple-50 mr-3 sm:mr-4`}>
              <FaUniversity className="text-2xl sm:text-3xl text-purple-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Institutions</p>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">{Object.keys(institutionStats).length}</h2>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-xl p-4 sm:p-6 flex items-center">
            <div className={`p-3 rounded-lg bg-orange-50 mr-3 sm:mr-4`}>
              <FaCog className="text-2xl sm:text-3xl text-orange-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Admins Actifs</p>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800">{userStats['ADMIN'] || 0}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Statistiques par rôle */}
          <div className="bg-white shadow rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaUsers className="mr-2 text-blue-500" />
              Répartition par Rôle
            </h2>
            <div className="space-y-3">
              {Object.entries(userStats).map(([role, count]) => {
                const { icon, color, bgColor } = getRoleConfig(role);
                return (
                  <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${bgColor} mr-3`}>
                        <span className={color}>{icon}</span>
                      </div>
                      <span className="font-medium text-gray-700">{getRoleLabel(role)}</span>
                    </div>
                    <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-gray-800 border">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statistiques par institution */}
          <div className="bg-white shadow rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FaUniversity className="mr-2 text-purple-500" />
              Étudiants par Institution
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {Object.entries(institutionStats)
                .sort(([,a], [,b]) => b - a)
                .map(([institution, count]) => (
                  <div key={institution} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-700 truncate" title={institution}>
                      {institution}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold min-w-10 text-center">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center sm:justify-end mb-6">
          <button
            onClick={() => navigate("/admin/user-management")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center w-full sm:w-auto"
          >
            <FaUsers className="mr-2" />
            Gérer les utilisateurs
          </button>
        </div>

        {/* Liste des utilisateurs */}
        <div className="bg-white shadow rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Liste des Utilisateurs ({users.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Total: {users.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.length > 0 ? (
              users.map((user) => <UserCard key={user.id} user={user} />)
            ) : (
              <div className="col-span-full text-center py-8">
                <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;