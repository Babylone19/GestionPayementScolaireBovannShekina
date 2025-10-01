import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { createStudent } from '../../api/students';
import { CreateStudentDto } from '../../types/student';
import { FaUserPlus, FaSave, FaArrowLeft, FaPhone, FaEnvelope } from 'react-icons/fa';

const CreateStudent: React.FC = () => {
  const [formData, setFormData] = useState<CreateStudentDto>({
    firstName: '',
    lastName: '',
    institution: '',
    studyLevel: '',
    profession: '',
    phone: '',
    email: '',
    domain: '',
    infoChannel: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { firstName, lastName, institution, studyLevel, profession, phone, email, domain, infoChannel } = formData;

    if (!firstName || !lastName || !institution || !studyLevel || !profession || !phone || !email || !domain || !infoChannel) {
      setError('Tous les champs sont obligatoires.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email invalide.');
      return false;
    }

    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(phone)) {
      setError('Numéro de téléphone invalide.');
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

      await createStudent(token, formData);
      setSuccess('Étudiant créé avec succès !');

      // Réinitialiser le formulaire
      setFormData({
        firstName: '',
        lastName: '',
        institution: '',
        studyLevel: '',
        profession: '',
        phone: '',
        email: '',
        domain: '',
        infoChannel: ''
      });
      
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'étudiant:', error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Erreur lors de la création de l\'étudiant');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Ajouter un Étudiant</h1>
                <p className="text-gray-600 mt-1">Créez un nouveau profil étudiant</p>
              </div>
              <button
                onClick={() => navigate('/admin/students/list')}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition flex items-center"
              >
                <FaArrowLeft className="mr-2" />
                Retour à la liste
              </button>
            </div>
          </div>

          {/* Messages d'alerte */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="text-red-700 hover:text-red-900"
                >
                  ×
                </button>
              </div>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
              <div className="flex justify-between items-center">
                <span>{success}</span>
                <button
                  onClick={() => setSuccess(null)}
                  className="text-green-700 hover:text-green-900"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <FaUserPlus className="mr-3 text-blue-500" />
              Informations de l'étudiant
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations personnelles */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Informations Personnelles</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaPhone className="mr-2 text-gray-400" />
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <FaEnvelope className="mr-2 text-gray-400" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Informations académiques */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Informations Académiques</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution *
                </label>
                <select
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionnez une institution</option>
                  <option value="SHEKINA">SHEKINA</option>
                  <option value="BOVANN GROUP SAS">BOVANN GROUP SAS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau d'étude *
                </label>
                <select
                  name="studyLevel"
                  value={formData.studyLevel}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionnez un niveau</option>
                  <option value="BEPC">BEPC</option>
                  <option value="PROBATOIRE">Probatoire</option>
                  <option value="BAC">Baccalauréat</option>
                  <option value="LICENCE">Licence</option>
                  <option value="MASTER">Master</option>
                  <option value="DOCTORAT">Doctorat</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profession *
                </label>
                <select
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionnez une profession</option>
                  <option value="Etudiant">Étudiant</option>
                  <option value="Travailleur">Travailleur</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domaine d'étude *
                </label>
                <select
                  name="domain"
                  value={formData.domain}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionnez un domaine</option>
                  <option value="GENIE_INFORMATIQUE">Génie Informatique</option>
                  <option value="MULTIMEDIA_MARKETING_DIGITAL">Multimédia & Marketing Digital</option>
                  <option value="CREATION_SITE_DEVELOPPEMENT_LOGICIEL">Création Site & Développement Logiciel</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment avez-vous connu l'institution ? *
                </label>
                <select
                  name="infoChannel"
                  value={formData.infoChannel}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionnez une source</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/admin/students/list')}
                className="bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition w-full sm:w-auto text-center"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 w-full sm:w-auto text-center flex items-center justify-center"
              >
                {loading ? (
                  'Création en cours...'
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    Créer l'étudiant
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateStudent;