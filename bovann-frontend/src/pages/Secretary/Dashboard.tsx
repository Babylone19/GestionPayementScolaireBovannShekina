import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../../utils/auth";
import { getStudents } from "../../api/students";
import { Student } from "../../types/student";
import StudentCard from "../../components/StudentCard";
import { FaSignOutAlt, FaUserGraduate, FaUniversity, FaSearch, FaFilter } from "react-icons/fa";
import { getInstitutionName } from "../../utils/helpers"; // IMPORT AJOUTÉ

const SecretaryDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate("/");
          return;
        }
        setLoading(true);
        const studentsData = await getStudents(token);
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des étudiants:", error);
        setError("Erreur lors de la récupération des étudiants");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [navigate]);

  // CORRECTION : Obtenir la liste des institutions uniques
  const getUniqueInstitutions = (): string[] => {
    const institutionsSet = new Set<string>();
    students.forEach(student => {
      // UTILISER getInstitutionName pour toujours avoir une string
      const institutionName = getInstitutionName(student.institution);
      institutionsSet.add(institutionName);
    });
    return ['all', ...Array.from(institutionsSet)];
  };

  const institutions = getUniqueInstitutions();

  // CORRECTION : Filtrer les étudiants en fonction des critères
  useEffect(() => {
    let filtered = students;

    // Filtre par institution
    if (selectedInstitution !== 'all') {
      filtered = filtered.filter(student => {
        const studentInstitution = getInstitutionName(student.institution);
        return studentInstitution === selectedInstitution;
      });
    }

    // Filtre par recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(student => {
        const studentInstitution = getInstitutionName(student.institution);
        return (
          `${student.lastName} ${student.firstName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          studentInstitution.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    setFilteredStudents(filtered);
  }, [searchTerm, selectedInstitution, students]);

  const handleLogout = () => {
    removeToken();
    navigate("/");
  };

  // CORRECTION : Statistiques par institution
  const institutionStats = filteredStudents.reduce((acc, student) => {
    const institution = getInstitutionName(student.institution) || 'Non spécifiée';
    if (!acc[institution]) {
      acc[institution] = { count: 0 };
    }
    acc[institution].count++;
    return acc;
  }, {} as Record<string, { count: number }>);

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
          Tableau de bord Secrétaire
        </h1>
        {/* <button
          onClick={handleLogout}
          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full sm:w-auto justify-center"
        >
          <FaSignOutAlt className="mr-2" /> Déconnexion
        </button> */}
      </header>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6">
        {/* Section Filtres et Recherche */}
        <div className="bg-white shadow rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaSearch className="mr-2 text-blue-500" />
            Rechercher et Filtrer les Étudiants
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Filtre par institution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaFilter className="mr-2 text-purple-500" />
                Filtrer par Institution
              </label>
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {institutions.map((institution) => (
                  <option key={institution} value={institution}>
                    {institution === 'all' ? 'Toutes les institutions' : institution}
                  </option>
                ))}
              </select>
            </div>

            {/* Recherche globale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recherche (Nom, Institution, Email)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un étudiant..."
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
              {filteredStudents.length} étudiant(s) trouvé(s)
              {selectedInstitution !== 'all' && ` dans ${selectedInstitution}`}
              {searchTerm && ` pour "${searchTerm}"`}
            </span>
            {(selectedInstitution !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedInstitution('all');
                  setSearchTerm('');
                }}
                className="text-red-600 hover:text-red-800 font-medium flex items-center"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white shadow rounded-xl p-4 sm:p-6 flex items-center">
            <FaUserGraduate className="text-2xl sm:text-3xl text-blue-500 mr-3 sm:mr-4" />
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Étudiants total</p>
              <h2 className="text-lg sm:text-xl font-bold">{students.length}</h2>
              <p className="text-xs text-gray-500">
                {filteredStudents.length} après filtrage
              </p>
            </div>
          </div>
          <div className="bg-white shadow rounded-xl p-4 sm:p-6 flex items-center">
            <FaUniversity className="text-2xl sm:text-3xl text-purple-500 mr-3 sm:mr-4" />
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Institutions</p>
              <h2 className="text-lg sm:text-xl font-bold">{Object.keys(institutionStats).length}</h2>
              <p className="text-xs text-gray-500">
                après filtrage
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques par institution */}
        <div className="bg-white shadow rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            Répartition par Institution ({Object.keys(institutionStats).length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(institutionStats).map(([institution, stats]) => (
              <div key={institution} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                <h3 className="font-semibold text-gray-700 text-sm sm:text-base mb-2 truncate" title={institution}>
                  {institution}
                </h3>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="flex justify-between items-center">
                    <span className="text-gray-600">Étudiants:</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs">
                      {stats.count}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="flex justify-center sm:justify-end mb-6">
          <button
            onClick={() => navigate("/secretary/student-registration")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center w-full sm:w-auto"
          >
            <FaUserGraduate className="mr-2" />
            Gérer les étudiants
          </button>
        </div>

        {/* Liste des étudiants avec en-tête */}
        <div className="bg-white shadow rounded-xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Liste des Étudiants ({filteredStudents.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Filtrage actif
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <FaSearch className="text-4xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Aucun étudiant trouvé</p>
                <p className="text-gray-400 text-sm mb-4">
                  {selectedInstitution !== 'all' || searchTerm 
                    ? "Aucun étudiant ne correspond à vos critères de recherche" 
                    : "Aucun étudiant dans la base de données"
                  }
                </p>
                {(selectedInstitution !== 'all' || searchTerm) ? (
                  <button
                    onClick={() => {
                      setSelectedInstitution('all');
                      setSearchTerm('');
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Réinitialiser la recherche
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/secretary/student-management")}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Gérer les étudiants
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecretaryDashboard;