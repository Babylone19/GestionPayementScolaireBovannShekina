import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { createStudent } from '../../api/students';
import { CreateStudentDto } from '../../types/student';

const StudentManagement: React.FC = () => {
  const [formData, setFormData] = useState<CreateStudentDto>({
    lastName: '',
    firstName: '',
    institution: 'BOVANN GROUP SAS',
    studyLevel: 'BEPC',
    profession: 'Etudiant',
    phone: '',
    email: '',
    domain: 'GENIE_INFORMATIQUE',
    infoChannel: 'TIKTOK',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const { lastName, firstName, studyLevel, profession, phone, email, domain, infoChannel } = formData;

    if (!lastName || !firstName || !studyLevel || !profession || !phone || !email || !domain || !infoChannel) {
      setError('Tous les champs sont obligatoires.');
      return false;
    }

    const phoneRegex = /^\+?[1-9]\d{0,14}$/;
    if (!phoneRegex.test(phone)) {
      setError('Numéro de téléphone invalide.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email invalide.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    console.log('FormData envoyé au backend:', formData);

    if (!validateForm()) return;

    // Afficher la confirmation au lieu d'ajouter directement
    setShowConfirmation(true);
  };

  const confirmAddStudent = async () => {
    setLoading(true);
    setShowConfirmation(false);

    try {
      const token = getToken();
      if (!token) return navigate('/');
      
      await createStudent(token, formData);
      setSuccess('Étudiant ajouté avec succès !');
      
      // Réinitialiser le formulaire
      setFormData({
        lastName: '',
        firstName: '',
        institution: 'BOVANN GROUP SAS',
        studyLevel: 'BEPC',
        profession: 'Etudiant',
        phone: '',
        email: '',
        domain: 'GENIE_INFORMATIQUE',
        infoChannel: 'TIKTOK',
      });
    } catch (err: any) {
      console.error('Erreur lors de la création de l\'étudiant:', err);
      if (err.response?.data?.errors) {
        const messages = err.response.data.errors.map((e: any) => `${e.param}: ${e.msg}`).join(', ');
        setError(messages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Erreur lors de la création de l\'étudiant');
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelAddStudent = () => {
    setShowConfirmation(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-accent flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
          Ajouter un Étudiant
        </h1>
        <button
          onClick={() => navigate('/secretary/dashboard')}
          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full sm:w-auto justify-center"
        >
          ← Retour au Dashboard
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Messages d'alerte */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
              <button
                onClick={() => setError(null)}
                className="float-right text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              {success}
              <button
                onClick={() => setSuccess(null)}
                className="float-right text-green-700 hover:text-green-900"
              >
                ×
              </button>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
              Informations de l'Étudiant
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Informations personnelles */}
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-700 mb-3">Informations Personnelles</h3>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input 
                  placeholder="Entrez le nom" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input 
                  placeholder="Entrez le prénom" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                <input 
                  placeholder="Ex: +225 07 00 00 00 00" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input 
                  placeholder="exemple@email.com" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Informations académiques */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-md font-medium text-gray-700 mb-3">Informations Académiques</h3>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                <select name="institution" value={formData.institution} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="SHEKINA">SHEKINA</option>
                  <option value="BOVANN GROUP SAS">BOVANN GROUP SAS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau d'étude *</label>
                <select name="studyLevel" value={formData.studyLevel} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="BEPC">BEPC</option>
                  <option value="PROBATOIRE">PROBATOIRE</option>
                  <option value="BAC">BAC</option>
                  <option value="LICENCE">LICENCE</option>
                  <option value="MASTER">MASTER</option>
                  <option value="DOCTORAT">DOCTORAT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession *</label>
                <select name="profession" value={formData.profession} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="Etudiant">Etudiant</option>
                  <option value="Travailleur">Travailleur</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domaine d'étude *</label>
                <select name="domain" value={formData.domain} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="GENIE_INFORMATIQUE">Génie Informatique</option>
                  <option value="MULTIMEDIA_MARKETING_DIGITAL">Multimédia / Marketing Digital</option>
                  <option value="CREATION_SITE_DEVELOPPEMENT_LOGICIEL">Création de site/Développement de logiciel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment nous avez-vous connu ? *</label>
                <select name="infoChannel" value={formData.infoChannel} onChange={handleChange} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="TIKTOK">TikTok</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="LINKEDIN">LinkedIn</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="AUTRE">Autre</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
              <button
                type="button"
                onClick={() => navigate('/secretary/dashboard')}
                className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition w-full sm:w-auto text-center"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 w-full sm:w-auto text-center"
              >
                {loading ? 'Ajout en cours...' : 'Ajouter l\'étudiant'}
              </button>
            </div>
          </form>

          {/* Modal de confirmation */}
          {showConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Confirmer l'ajout
                </h3>
                <p className="text-gray-600 mb-6">
                  Êtes-vous sûr de vouloir ajouter l'étudiant <strong>{formData.firstName} {formData.lastName}</strong> ?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    onClick={cancelAddStudent}
                    className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition w-full sm:w-auto"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={confirmAddStudent}
                    disabled={loading}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:bg-gray-400 w-full sm:w-auto"
                  >
                    {loading ? 'Ajout...' : 'Confirmer'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentManagement;