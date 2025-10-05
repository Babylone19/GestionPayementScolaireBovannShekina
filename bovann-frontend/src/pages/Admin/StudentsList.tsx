import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { getStudents, searchStudents, deleteStudent } from '../../api/students';
import { Student } from '../../types/student';
import { FaSearch, FaEdit, FaTrash, FaEye, FaUserGraduate, FaFilter, FaTimes, FaPlus, FaFilePdf, FaIdCard } from 'react-icons/fa';

const StudentsList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const token = getToken();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        if (!token) {
          navigate('/');
          return;
        }
        const studentsData = await getStudents(token);

        const studentsArray = Array.isArray(studentsData) ? studentsData : [];

        console.log('Données étudiants récupérées:', studentsArray);
        studentsArray.forEach(student => {
          console.log(`Étudiant: ${student.firstName} ${student.lastName}`, {
            institutionId: student.institutionId,
            institution: student.institution,
            typeInstitution: typeof student.institution
          });
        });

        setStudents(studentsArray);
        setFilteredStudents(studentsArray);
      } catch (error) {
        console.error('Erreur lors de la récupération des étudiants:', error);
        setError('Erreur lors de la récupération des étudiants');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token, navigate]);

  // Fonction pour obtenir le nom de l'institution
  const getInstitutionName = (institution: any): string => {
    if (!institution) {
      return 'Non spécifiée';
    }
    
    if (typeof institution === 'string') {
      return institution;
    }
    
    if (typeof institution === 'object') {
      return institution.name || 'Non spécifiée';
    }
    
    return 'Non spécifiée';
  };

  // Fonction getInstitutionBadge
  const getInstitutionBadge = (institution: any) => {
    const institutionName = getInstitutionName(institution);

    if (institutionName.includes('BOVANN') || institutionName.includes('bovann')) {
      return 'border-green-500 text-green-700 bg-green-50';
    }
    return 'border-gray-300 text-gray-700 bg-gray-50';
  };

  const getUniqueInstitutions = useCallback(() => {
    const institutionsSet = new Set<string>();
    students.forEach(student => {
      const institutionName = getInstitutionName(student.institution);
      institutionsSet.add(institutionName);
    });
    return ['all', ...Array.from(institutionsSet)];
  }, [students]);

  const handleSearch = useCallback(async () => {
    try {
      if (!token) return;

      if (searchTerm.trim()) {
        const searchResults = await searchStudents(token, searchTerm);
        setFilteredStudents(searchResults);
      } else {
        setFilteredStudents(students);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setError('Erreur lors de la recherche');
    }
  }, [searchTerm, students, token]);

  const handleFilter = useCallback(() => {
    let filtered = [...students];

    if (selectedInstitution !== 'all') {
      filtered = filtered.filter(student => {
        const institutionName = getInstitutionName(student.institution);
        return institutionName === selectedInstitution;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.lastName} ${student.firstName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredStudents(filtered);
  }, [students, selectedInstitution, searchTerm]);

  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete || !token) return;

    try {
      setDeleteLoading(true);
      await deleteStudent(token, studentToDelete.id);

      setStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setFilteredStudents(prev => prev.filter(s => s.id !== studentToDelete.id));
      setShowDeleteModal(false);
      setStudentToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setError('Erreur lors de la suppression de l\'étudiant');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setStudentToDelete(null);
  };

  const handleGenerateRegistrationForm = async (studentId: string) => {
    try {
      console.log('Générer fiche d\'inscription pour:', studentId);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    }
  };

  const handleGenerateStudentCard = async (studentId: string) => {
    try {
      console.log('Générer carte étudiante pour:', studentId);
    } catch (error) {
      console.error('Erreur lors de la génération de la carte:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des étudiants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Étudiants</h1>
              <p className="text-gray-600 mt-1">
                {filteredStudents.length} étudiant(s) trouvé(s)
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/students/create')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FaPlus className="mr-2" />
              Nouvel Étudiant
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-medium">Erreur:</span>
                <span className="ml-2">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Filtres et Recherche</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher un étudiant
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Nom, prénom, téléphone ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <button
                    onClick={handleSearch}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaSearch />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par institution
                </label>
                <select
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes les institutions</option>
                  {getUniqueInstitutions()
                    .filter(inst => inst !== 'all')
                    .map(institution => (
                      <option key={institution} value={institution}>
                        {institution}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Domaine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => {
                    const institutionName = getInstitutionName(student.institution);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <FaUserGraduate className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student.lastName} {student.firstName}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {student.profession.toLowerCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.phone}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getInstitutionBadge(student.institution)}`}>
                            {institutionName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.studyLevel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {student.domain.toLowerCase().replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/admin/students/${student.id}/view`)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Voir détails"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/students/${student.id}/edit`)}
                              className="text-green-600 hover:text-green-900"
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleGenerateRegistrationForm(student.id)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Fiche d'inscription"
                            >
                              <FaFilePdf />
                            </button>
                            <button
                              onClick={() => handleGenerateStudentCard(student.id)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Carte étudiante"
                            >
                              <FaIdCard />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(student)}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <FaUserGraduate className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun étudiant trouvé</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Aucun étudiant ne correspond à vos critères de recherche.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'étudiant <strong>{studentToDelete?.firstName} {studentToDelete?.lastName}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                disabled={deleteLoading}
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors disabled:bg-red-400"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsList;