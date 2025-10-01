import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { getStudents } from '../../api/students';
import { Student } from '../../types/student';
import { 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaUserPlus, 
  FaSync,
  FaTimes,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaUniversity,
  FaGraduationCap
} from 'react-icons/fa';

const StudentsList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students;
    
    if (selectedInstitution !== 'all') {
      filtered = filtered.filter(student => student.institution === selectedInstitution);
    }

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredStudents(filtered);
  }, [searchTerm, selectedInstitution, students]);

  const fetchStudents = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/');
        return;
      }
      setLoading(true);
      const studentsData = await getStudents(token);
      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des étudiants:', error);
      setError('Erreur lors de la récupération des étudiants');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student: Student) => {
    navigate('/admin/students/edit', { state: { student } });
  };

  const handleView = (student: Student) => {
    navigate('/admin/students/view', { state: { student } });
  };

  const getInstitutionBadge = (institution: string) => {
    const colors = {
      'SHEKINA': 'bg-purple-100 text-purple-800 border-purple-200',
      'BOVANN GROUP SAS': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[institution as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getDomainBadge = (domain: string) => {
    const colors = {
      'GENIE_INFORMATIQUE': 'bg-red-100 text-red-800 border-red-200',
      'MULTIMEDIA_MARKETING_DIGITAL': 'bg-green-100 text-green-800 border-green-200',
      'CREATION_SITE_DEVELOPPEMENT_LOGICIEL': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[domain as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des étudiants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestion des Étudiants</h1>
                <p className="text-gray-600 mt-1">
                  {students.length} étudiant(s) au total
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/students/create')}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center w-full lg:w-auto"
              >
                <FaUserPlus className="mr-2" />
                Ajouter un étudiant
              </button>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher un étudiant
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher par nom, prénom, téléphone, email ou domaine..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="lg:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par institution
                </label>
                <select
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes les institutions</option>
                  <option value="SHEKINA">SHEKINA</option>
                  <option value="BOVANN GROUP SAS">BOVANN GROUP SAS</option>
                </select>
              </div>

              <div className="lg:w-auto flex items-end">
                <button
                  onClick={fetchStudents}
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
                {filteredStudents.length} étudiant(s) trouvé(s)
                {selectedInstitution !== 'all' && ` - Institution: ${selectedInstitution}`}
                {searchTerm && ` pour "${searchTerm}"`}
              </span>
              {(selectedInstitution !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedInstitution('all');
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

          {/* Liste des étudiants */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Liste des Étudiants
                <span className="text-gray-500 font-normal ml-2">
                  ({filteredStudents.length})
                </span>
              </h2>
            </div>

            <div className="p-6">
              {filteredStudents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Étudiant</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Institution</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Niveau</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Domaine</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <span className="font-semibold text-gray-600">
                                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {student.firstName} {student.lastName}
                                </div>
                                <div className="text-sm text-gray-500 capitalize">
                                  {student.profession.toLowerCase()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2 text-sm">
                                <FaPhone className="text-gray-400 text-xs" />
                                <span className="text-gray-600">{student.phone}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm">
                                <FaEnvelope className="text-gray-400 text-xs" />
                                <span className="text-gray-600 truncate">{student.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getInstitutionBadge(student.institution)}`}>
                              {student.institution}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <FaGraduationCap className="text-gray-400" />
                              <span className="text-gray-600">{student.studyLevel}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDomainBadge(student.domain)}`}>
                              {student.domain.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleView(student)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Voir les détails"
                              >
                                <FaEye />
                              </button>
                              <button
                                onClick={() => handleEdit(student)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <FaEdit />
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
                  <p className="text-gray-500 text-lg mb-2">Aucun étudiant trouvé</p>
                  <p className="text-gray-400 text-sm mb-6">
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
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                      Réinitialiser les filtres
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/admin/students/create')}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center mx-auto"
                    >
                      <FaUserPlus className="mr-2" />
                      Ajouter le premier étudiant
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsList;