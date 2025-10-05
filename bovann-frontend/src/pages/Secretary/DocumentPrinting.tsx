import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { getStudents, searchStudents } from '../../api/students';
import { getPayments } from '../../api/payments';
import { Student } from '../../types/student';
import { Payment } from '../../types/payment';
import { 
  FaSearch, 
  FaFilter, 
  FaTimes, 
  FaFilePdf, 
  FaIdCard, 
  FaPrint, 
  FaDownload,
  FaUserCheck,
  FaUserTimes,
  FaSchool,
  FaMoneyBillWave,
  FaExclamationTriangle
} from 'react-icons/fa';

const DocumentPrinting: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const navigate = useNavigate();
  const token = getToken();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!token) {
          navigate('/');
          return;
        }

        const [studentsData, paymentsData] = await Promise.all([
          getStudents(token),
          getPayments(token)
        ]);

        const studentsArray = Array.isArray(studentsData) ? studentsData : [];
        const paymentsArray = Array.isArray(paymentsData) ? paymentsData : [];

        console.log('📊 DONNÉES RÉCUPÉRÉES:');
        console.log('Étudiants:', studentsArray.length);
        console.log('Paiements:', paymentsArray.length);
        console.log('Paiements VALID:', paymentsArray.filter(p => p.status === 'VALID').length);
        
        // Debug détaillé des paiements
        paymentsArray.forEach(payment => {
          console.log(`Paiement ${payment.id}:`, {
            studentId: payment.studentId,
            status: payment.status,
            amount: payment.amount,
            validUntil: payment.validUntil
          });
        });

        setStudents(studentsArray);
        setPayments(paymentsArray);
        setFilteredStudents(studentsArray);

        // Informations de débogage
        setDebugInfo(`
          Étudiants: ${studentsArray.length}
          Paiements totaux: ${paymentsArray.length}
          Paiements VALID: ${paymentsArray.filter(p => p.status === 'VALID').length}
          Paiements PENDING: ${paymentsArray.filter(p => p.status === 'PENDING').length}
          Paiements EXPIRED: ${paymentsArray.filter(p => p.status === 'EXPIRED').length}
        `);

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  // Fonction de débogage pour vérifier les paiements par étudiant
  const debugStudentPayments = useCallback((studentId: string) => {
    const studentPayments = payments.filter(p => p.studentId === studentId);
    const validPayments = studentPayments.filter(p => p.status === 'VALID');
    
    console.log(`🔍 DÉBOGAGE Étudiant ${studentId}:`, {
      totalPayments: studentPayments.length,
      validPayments: validPayments.length,
      payments: studentPayments.map(p => ({
        id: p.id,
        status: p.status,
        amount: p.amount,
        validUntil: p.validUntil
      }))
    });

    return validPayments.length > 0;
  }, [payments]);

  // Fonction pour vérifier si un étudiant a des paiements VALID
  const hasPayments = useCallback((studentId: string): boolean => {
    const studentPayments = payments.filter(payment => payment.studentId === studentId);
    const hasValidPayment = studentPayments.some(payment => payment.status === 'VALID');
    
    // Débogage pour les étudiants sans paiement
    if (!hasValidPayment && studentPayments.length > 0) {
      console.log(`❌ Étudiant ${studentId} a des paiements mais pas VALID:`, 
        studentPayments.map(p => p.status));
    }
    
    return hasValidPayment;
  }, [payments]);

  // Fonction pour obtenir le nom de l'institution
  const getInstitutionName = (institution: any): string => {
    if (!institution) return 'Non spécifiée';
    if (typeof institution === 'string') return institution;
    if (typeof institution === 'object') return institution.name || 'Non spécifiée';
    return 'Non spécifiée';
  };

  // Fonction pour obtenir les institutions uniques
  const getUniqueInstitutions = useCallback((): string[] => {
    const institutionsMap: { [key: string]: boolean } = {};
    const institutions: string[] = [];
    
    students.forEach(student => {
      const institutionName = getInstitutionName(student.institution);
      if (!institutionsMap[institutionName]) {
        institutionsMap[institutionName] = true;
        institutions.push(institutionName);
      }
    });
    
    return institutions;
  }, [students]);

  // Filtres combinés
  const applyFilters = useCallback(() => {
    let filtered = [...students];

    // Filtre par institution
    if (selectedInstitution !== 'all') {
      filtered = filtered.filter(student => {
        const institutionName = getInstitutionName(student.institution);
        return institutionName === selectedInstitution;
      });
    }

    // Filtre par statut de paiement
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(student => {
        const hasPayment = hasPayments(student.id);
        return paymentFilter === 'paid' ? hasPayment : !hasPayment;
      });
    }

    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        `${student.lastName} ${student.firstName}`.toLowerCase().includes(searchLower) ||
        student.phone.toLowerCase().includes(searchLower) ||
        (student.email && student.email.toLowerCase().includes(searchLower))
      );
    }

    setFilteredStudents(filtered);

    // Debug du filtrage
    console.log('🎯 FILTRAGE APPLIQUÉ:', {
      total: students.length,
      filtered: filtered.length,
      paymentFilter,
      avecPaiement: filtered.filter(s => hasPayments(s.id)).length,
      sansPaiement: filtered.filter(s => !hasPayments(s.id)).length
    });

  }, [students, selectedInstitution, paymentFilter, searchTerm, hasPayments]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Sélection multiple
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    setSelectedStudents(filteredStudents.map(student => student.id));
  };

  const clearSelection = () => {
    setSelectedStudents([]);
  };

  // Génération de documents
  const handleGenerateRegistrationForm = (studentId: string) => {
    console.log('Générer fiche d\'inscription pour:', studentId);
    // Vérifier les paiements avant génération
    const hasValidPayment = hasPayments(studentId);
    if (!hasValidPayment) {
      alert('Cet étudiant n\'a pas de paiement VALID. Impossible de générer le document.');
      return;
    }
    // Implémentation PDF
  };

  const handleGenerateStudentCard = (studentId: string) => {
    console.log('Générer carte étudiante pour:', studentId);
    // Vérifier les paiements avant génération
    const hasValidPayment = hasPayments(studentId);
    if (!hasValidPayment) {
      alert('Cet étudiant n\'a pas de paiement VALID. Impossible de générer la carte.');
      return;
    }
    // Implémentation PDF
  };

  const handleBatchGenerate = (type: 'registration' | 'idcard') => {
    if (selectedStudents.length === 0) {
      alert('Veuillez sélectionner au moins un étudiant');
      return;
    }

    // Vérifier que tous les étudiants sélectionnés ont des paiements VALID
    const studentsWithoutPayment = selectedStudents.filter(studentId => !hasPayments(studentId));
    if (studentsWithoutPayment.length > 0 && type !== 'registration') {
      alert(`${studentsWithoutPayment.length} étudiant(s) sélectionné(s) n'ont pas de paiement VALID.`);
      return;
    }

    console.log(`Génération ${type} pour:`, selectedStudents);
  };

  // Statistiques
  const stats = {
    total: filteredStudents.length,
    withPayments: filteredStudents.filter(s => hasPayments(s.id)).length,
    withoutPayments: filteredStudents.filter(s => !hasPayments(s.id)).length,
    totalPayments: payments.length,
    validPayments: payments.filter(p => p.status === 'VALID').length
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Impression des Documents</h1>
              <p className="text-gray-600 mt-1">
                Générez fiches d'inscription et cartes étudiantes
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleBatchGenerate('registration')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <FaFilePdf className="mr-2" />
                Fiches groupées
              </button>
              <button
                onClick={() => handleBatchGenerate('idcard')}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
              >
                <FaIdCard className="mr-2" />
                Cartes groupées
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-700">
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        {/* Panel de débogage (à retirer en production) */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center mb-2">
            <FaExclamationTriangle className="text-yellow-600 mr-2" />
            <span className="font-medium text-yellow-800">Informations de débogage</span>
          </div>
          <div className="text-sm text-yellow-700 whitespace-pre-line">
            {debugInfo || 'Chargement...'}
          </div>
          <button 
            onClick={() => console.log('Payments:', payments)}
            className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded"
          >
            Voir les paiements dans la console
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaUserCheck className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total étudiants</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <FaMoneyBillWave className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avec paiement VALID</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withPayments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg">
                <FaUserTimes className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sans paiement</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withoutPayments}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <FaSchool className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sélectionnés</p>
                <p className="text-2xl font-bold text-gray-900">{selectedStudents.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Filtres et Recherche</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Recherche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher un étudiant
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nom, prénom, téléphone, email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Filtre institution */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution
                </label>
                <select
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Toutes les institutions</option>
                  {getUniqueInstitutions().map(inst => (
                    <option key={inst} value={inst}>{inst}</option>
                  ))}
                </select>
              </div>

              {/* Filtre paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut de paiement
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les étudiants</option>
                  <option value="paid">Avec paiement (VALID)</option>
                  <option value="unpaid">Sans paiement</option>
                </select>
              </div>
            </div>

            {/* Actions de sélection */}
            {filteredStudents.length > 0 && (
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={selectAllStudents}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tout sélectionner
                </button>
                <button
                  onClick={clearSelection}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Tout désélectionner
                </button>
                <span className="text-sm text-gray-600 flex items-center">
                  {selectedStudents.length} étudiant(s) sélectionné(s)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Liste des étudiants */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={selectAllStudents}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
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
                    Paiement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => {
                  const hasPayment = hasPayments(student.id);
                  const institutionName = getInstitutionName(student.institution);
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.lastName} {student.firstName}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {student.profession?.toLowerCase() || 'Étudiant'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.phone}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{institutionName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          hasPayment 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {hasPayment ? 'VALID' : 'Non payé'}
                        </span>
                        <button 
                          onClick={() => debugStudentPayments(student.id)}
                          className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                          title="Déboguer les paiements"
                        >
                          🔍
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleGenerateRegistrationForm(student.id)}
                            className="text-purple-600 hover:text-purple-900 flex items-center"
                            title="Fiche d'inscription"
                          >
                            <FaFilePdf className="mr-1" />
                            Fiche
                          </button>
                          <button
                            onClick={() => handleGenerateStudentCard(student.id)}
                            className="text-orange-600 hover:text-orange-900 flex items-center"
                            title="Carte étudiante"
                          >
                            <FaIdCard className="mr-1" />
                            Carte
                          </button>
                          <button
                            onClick={() => navigate(`/secretary/students/${student.id}/view`)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                            title="Voir détails"
                          >
                            <FaSearch className="mr-1" />
                            Détails
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <FaUserTimes className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun étudiant trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Aucun étudiant ne correspond à vos critères de recherche.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPrinting;