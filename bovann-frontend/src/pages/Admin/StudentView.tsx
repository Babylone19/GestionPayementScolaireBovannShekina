import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Student } from '../../types/student';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaPhone, 
  FaEnvelope, 
  FaUniversity,
  FaGraduationCap,
  FaUserTie,
  FaShareAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaIdCard
} from 'react-icons/fa';

const StudentView: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const student: Student = location.state?.student;

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Étudiant non trouvé</p>
          <button 
            onClick={() => navigate('/admin/students/list')}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const getDomainLabel = (domain: string) => {
    const labels = {
      'GENIE_INFORMATIQUE': 'Génie Informatique',
      'MULTIMEDIA_MARKETING_DIGITAL': 'Multimédia & Marketing Digital',
      'CREATION_SITE_DEVELOPPEMENT_LOGICIEL': 'Création Site & Développement Logiciel'
    };
    return labels[domain as keyof typeof labels] || domain;
  };

  const getInfoChannelLabel = (channel: string) => {
    const labels = {
      'TIKTOK': 'TikTok',
      'FACEBOOK': 'Facebook',
      'INSTAGRAM': 'Instagram',
      'LINKEDIN': 'LinkedIn',
      'WHATSAPP': 'WhatsApp',
      'AUTRE': 'Autre'
    };
    return labels[channel as keyof typeof labels] || channel;
  };

  const getInstitutionBadge = (institution: string) => {
    const colors = {
      'SHEKINA': 'bg-purple-100 text-purple-800 border-purple-200',
      'BOVANN GROUP SAS': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[institution as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/admin/students/list')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FaArrowLeft className="text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Détails de l'Étudiant</h1>
                  <p className="text-gray-600">Informations complètes du profil étudiant</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/admin/payments/by-student', { state: { student } })}
                  className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center"
                >
                  <FaMoneyBillWave className="mr-2" />
                  Voir les paiements
                </button>
                <button
                  onClick={() => navigate('/admin/students/edit', { state: { student } })}
                  className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center"
                >
                  <FaEdit className="mr-2" />
                  Modifier
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Carte principale */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                {/* En-tête étudiant */}
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {student.firstName} {student.lastName}
                    </h2>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getInstitutionBadge(student.institution)}`}>
                        {student.institution}
                      </span>
                      <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium border border-gray-200 capitalize">
                        {student.profession.toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Informations personnelles */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaUserTie className="mr-2 text-blue-500" />
                      Informations Personnelles
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaIdCard className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">ID Étudiant</p>
                          <p className="font-medium text-gray-800">{student.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaPhone className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Téléphone</p>
                          <p className="font-medium text-gray-800">{student.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaEnvelope className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-800">{student.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations académiques */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <FaGraduationCap className="mr-2 text-green-500" />
                      Informations Académiques
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaUniversity className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Institution</p>
                          <p className="font-medium text-gray-800">{student.institution}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <FaGraduationCap className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Niveau d'étude</p>
                          <p className="font-medium text-gray-800">{student.studyLevel}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-600 font-medium">Domaine d'étude</p>
                        <p className="text-blue-800 font-semibold">{getDomainLabel(student.domain)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Source d'information */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaShareAlt className="mr-2 text-purple-500" />
                    Comment nous a-t-il connu ?
                  </h3>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-800 font-medium">
                      {getInfoChannelLabel(student.infoChannel)}
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                      Source d'information principale
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar métadonnées */}
            <div className="space-y-6">
              {/* Métadonnées */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Métadonnées</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaCalendarAlt className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Créé le</p>
                      <p className="font-medium text-gray-800">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString('fr-FR') : 'Non spécifié'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FaCalendarAlt className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Modifié le</p>
                      <p className="font-medium text-gray-800">
                        {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString('fr-FR') : 'Non spécifié'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/admin/payments/by-student', { state: { student } })}
                    className="w-full text-left p-3 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors flex items-center"
                  >
                    <FaMoneyBillWave className="mr-2" />
                    Voir les paiements
                  </button>
                  <button className="w-full text-left p-3 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors flex items-center">
                    <FaIdCard className="mr-2" />
                    Générer une carte
                  </button>
                  <button className="w-full text-left p-3 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors flex items-center">
                    <FaEnvelope className="mr-2" />
                    Envoyer un email
                  </button>
                </div>
              </div>

              {/* Statut */}
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Statut</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">Actif</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  L'étudiant est actuellement inscrit et peut accéder aux services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentView;