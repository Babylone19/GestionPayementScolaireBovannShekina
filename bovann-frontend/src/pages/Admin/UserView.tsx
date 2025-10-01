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
  FaCalendarAlt
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
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
                  <p className="text-gray-600">Informations complètes du profil</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/admin/students/edit', { state: { student } })}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <FaEdit className="mr-2" />
                Modifier
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {student.firstName} {student.lastName}
                    </h2>
                    <p className="text-gray-600 capitalize">{student.profession.toLowerCase()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informations personnelles */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Informations Personnelles</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <FaPhone className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Téléphone</p>
                          <p className="font-medium">{student.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FaEnvelope className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{student.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FaUserTie className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Profession</p>
                          <p className="font-medium capitalize">{student.profession.toLowerCase()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations académiques */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Informations Académiques</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <FaUniversity className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Institution</p>
                          <p className="font-medium">{student.institution}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FaGraduationCap className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Niveau d'étude</p>
                          <p className="font-medium">{student.studyLevel}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <FaShareAlt className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Source d'information</p>
                          <p className="font-medium">{getInfoChannelLabel(student.infoChannel)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Domaine d'étude */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Domaine d'Étude</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-medium text-blue-800">{getDomainLabel(student.domain)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Métadonnées */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Métadonnées</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date de création</p>
                      <p className="font-medium">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Dernière modification</p>
                      <p className="font-medium">
                        {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString('fr-FR') : 'Non spécifiée'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Voir les paiements
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    Générer une carte
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