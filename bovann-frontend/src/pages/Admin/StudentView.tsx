import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { getStudentById, studentService } from '../../api/students';
import { Student } from '../../types/student';
import { FaArrowLeft, FaEdit, FaUserGraduate, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaUniversity, FaGraduationCap, FaIdCard, FaFilePdf, FaHistory } from 'react-icons/fa';

const StudentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token || !id) {
          navigate('/');
          return;
        }

        const studentData = await getStudentById(token, id);
        setStudent(studentData);

        // Récupérer le statut de paiement
        const status = await studentService.getPaymentStatus(token, id);
        setPaymentStatus(status);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'étudiant:', error);
        setError('Erreur lors du chargement des données de l\'étudiant');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, navigate]);

  const getInstitutionName = (institution: any): string => {
    if (typeof institution === 'string') return institution;
    if (institution && typeof institution === 'object') return institution.name || 'Non spécifiée';
    return 'Non spécifiée';
  };

  const getProgramName = (program: any): string => {
    if (typeof program === 'string') return program;
    if (program && typeof program === 'object') return program.name || 'Non spécifié';
    return 'Non spécifié';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifiée';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const handleGenerateRegistrationForm = async () => {
    if (!student) return;
    try {
      const token = getToken();
      if (!token) return;
      
      // Implémentez la génération du PDF
      console.log('Générer fiche inscription pour:', student.id);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
    }
  };

  const handleGenerateStudentCard = async () => {
    if (!student) return;
    try {
      const token = getToken();
      if (!token) return;
      
      // Implémentez la génération de la carte
      console.log('Générer carte étudiante pour:', student.id);
    } catch (error) {
      console.error('Erreur génération carte:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement de l'étudiant...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500">
            <FaUserGraduate className="text-4xl mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Erreur</h2>
            <p>{error || 'Étudiant non trouvé'}</p>
          </div>
          <button
            onClick={() => navigate('/admin/students/list')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à la liste
          </button>
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/students/list')}
                className="text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {student.firstName} {student.lastName}
                </h1>
                <p className="text-gray-600 mt-1">Profil étudiant détaillé</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/admin/students/${student.id}/edit`)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <FaEdit className="mr-2" />
                Modifier
              </button>
              <button
                onClick={handleGenerateRegistrationForm}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <FaFilePdf className="mr-2" />
                Fiche inscription
              </button>
              <button
                onClick={handleGenerateStudentCard}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
              >
                <FaIdCard className="mr-2" />
                Carte étudiante
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne de gauche - Informations personnelles */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte informations personnelles */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaUserGraduate className="mr-2 text-blue-500" />
                  Informations Personnelles
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                      <p className="text-gray-900 font-medium">{student.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                      <p className="text-gray-900 font-medium">{student.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
                      <p className="text-gray-900 flex items-center">
                        <FaBirthdayCake className="mr-2 text-gray-400" />
                        {formatDate(student.dateOfBirth)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de naissance</label>
                      <p className="text-gray-900">{student.placeOfBirth || 'Non spécifié'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                      <p className="text-gray-900">{student.nationality}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                      <p className="text-gray-900 capitalize">{student.profession.toLowerCase()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'étude</label>
                      <p className="text-gray-900">{student.studyLevel}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source d'information</label>
                      <p className="text-gray-900">{student.infoChannel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte informations de contact */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaPhone className="mr-2 text-green-500" />
                  Informations de Contact
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaPhone className="text-gray-400 mr-3" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                      <p className="text-gray-900">{student.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="text-gray-400 mr-3" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{student.email}</p>
                    </div>
                  </div>
                  {student.address && (
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-gray-400 mr-3" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Adresse</label>
                        <p className="text-gray-900">{student.address}</p>
                      </div>
                    </div>
                  )}
                  {student.emergencyContact && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact d'urgence</label>
                      <p className="text-gray-900">{student.emergencyContact}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Colonne de droite - Informations académiques et statut */}
          <div className="space-y-6">
            {/* Carte informations académiques */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaUniversity className="mr-2 text-purple-500" />
                  Informations Académiques
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaUniversity className="text-gray-400 mr-3" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Institution</label>
                      <p className="text-gray-900 font-medium">{getInstitutionName(student.institution)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaGraduationCap className="text-gray-400 mr-3" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Programme</label>
                      <p className="text-gray-900">{getProgramName(student.program)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Domaine d'étude</label>
                    <p className="text-gray-900 capitalize">{student.domain.toLowerCase().replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date d'inscription</label>
                    <p className="text-gray-900">{formatDate(student.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte statut de paiement */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaHistory className="mr-2 text-orange-500" />
                  Statut de Paiement
                </h2>
              </div>
              <div className="p-6">
                {paymentStatus ? (
                  <div className="space-y-4">
                    <div className={`p-3 rounded-lg ${
                      paymentStatus.hasValidPayment 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${
                          paymentStatus.hasValidPayment ? 'text-green-800' : 'text-yellow-800'
                        }`}>
                          {paymentStatus.hasValidPayment ? 'Paiement valide' : 'Aucun paiement valide'}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${
                          paymentStatus.hasValidPayment ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                      </div>
                      {paymentStatus.activePayment && (
                        <div className="mt-2 text-sm">
                          <p>Valid jusqu'au: {formatDate(paymentStatus.activePayment.validUntil)}</p>
                          <p>Type: {paymentStatus.activePayment.paymentType}</p>
                          <p>Montant: {paymentStatus.activePayment.amount} FCFA</p>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/admin/payments/by-student?studentId=${student.id}`)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <FaHistory className="mr-2" />
                      Voir l'historique des paiements
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">Chargement du statut...</p>
                )}
              </div>
            </div>

            {/* Carte actions rapides */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Actions Rapides</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/secretary/quick-payment?studentId=${student.id}`)}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center"
                  >
                    Nouveau paiement
                  </button>
                  <button
                    onClick={handleGenerateRegistrationForm}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
                  >
                    Télécharger fiche inscription
                  </button>
                  <button
                    onClick={handleGenerateStudentCard}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-center"
                  >
                    Générer carte étudiante
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentView;