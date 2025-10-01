import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../utils/auth";
import { getUsers } from "../../api/users";
import { getStudents } from "../../api/students";
import { User } from "../../types/user";
import { Student } from "../../types/student";
import UserCard from "../../components/UserCard";
import { FaUsers, FaUserGraduate, FaUniversity, FaCog, FaChartBar } from "react-icons/fa";

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
      'GUARD': 'Gardiens'
    };
    return roles[role] || role;
  };

  // Obtenir l'icône et la couleur pour chaque rôle
  const getRoleConfig = (role: string) => {
    const config: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
      'ADMIN': {
        icon: <FaCog className="text-lg" />,
        color: 'text-red-500',
        bgColor: 'bg-red-50'
      },
      'SECRETARY': {
        icon: <FaUsers className="text-lg" />,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50'
      },
      'ACCOUNTANT': {
        icon: <FaChartBar className="text-lg" />,
        color: 'text-green-500',
        bgColor: 'bg-green-50'
      },
      'GUARD': {
        icon: <FaUserGraduate className="text-lg" />,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50'
      }
    };
    return config[role] || { icon: <FaUsers />, color: 'text-gray-500', bgColor: 'bg-gray-50' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center">
            <FaCog className="text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Erreur</h2>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header pour mobile */}
      <div className="bg-white shadow-sm border-b lg:hidden">
        <div className="px-4 py-3">
          <h1 className="text-lg font-semibold text-gray-800">Tableau de bord Admin</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-6">
        {/* Cartes statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6 flex items-center">
            <div className="p-3 rounded-lg bg-blue-50 mr-4">
              <FaUsers className="text-xl lg:text-2xl text-blue-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm lg:text-base">Total Utilisateurs</p>
              <h2 className="text-lg lg:text-xl font-bold text-gray-800">{users.length}</h2>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6 flex items-center">
            <div className="p-3 rounded-lg bg-green-50 mr-4">
              <FaUserGraduate className="text-xl lg:text-2xl text-green-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm lg:text-base">Total Étudiants</p>
              <h2 className="text-lg lg:text-xl font-bold text-gray-800">{students.length}</h2>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6 flex items-center">
            <div className="p-3 rounded-lg bg-purple-50 mr-4">
              <FaUniversity className="text-xl lg:text-2xl text-purple-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm lg:text-base">Institutions</p>
              <h2 className="text-lg lg:text-xl font-bold text-gray-800">{Object.keys(institutionStats).length}</h2>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6 flex items-center">
            <div className="p-3 rounded-lg bg-orange-50 mr-4">
              <FaCog className="text-xl lg:text-2xl text-orange-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm lg:text-base">Admins Actifs</p>
              <h2 className="text-lg lg:text-xl font-bold text-gray-800">{userStats['ADMIN'] || 0}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
          {/* Statistiques par rôle */}
          <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 flex items-center">
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
          <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6">
            <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4 flex items-center">
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

        {/* Actions rapides */}
        <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6 mb-6 lg:mb-8">
          <h2 className="text-lg lg:text-xl font-bold text-gray-800 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/admin/user-management")}
              className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center w-full"
            >
              <FaUsers className="mr-2" />
              Gérer les utilisateurs
            </button>
            <button
              onClick={() => navigate("/secretary/student-management")}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center w-full"
            >
              <FaUserGraduate className="mr-2" />
              Voir les étudiants
            </button>
            <button
              onClick={() => navigate("/accountant/payment-management")}
              className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition flex items-center justify-center w-full"
            >
              <FaChartBar className="mr-2" />
              Voir les paiements
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs récents */}
        {/* <div className="bg-white rounded-xl shadow-sm border p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-lg lg:text-xl font-bold text-gray-800">
              Utilisateurs récents ({users.slice(0, 8).length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Total: {users.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.slice(0, 8).length > 0 ? (
              users.slice(0, 8).map((user) => <UserCard key={user.id} user={user} />)
            ) : (
              <div className="col-span-full text-center py-8">
                <FaUsers className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
              </div>
            )}
          </div>

          {users.length > 8 && (
            <div className="text-center mt-6">
              <button
                onClick={() => navigate("/admin/user-management")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir tous les utilisateurs ({users.length})
              </button>
            </div>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default AdminDashboard;