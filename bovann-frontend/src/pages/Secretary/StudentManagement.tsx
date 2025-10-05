import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { createStudent } from '../../api/students';
import { CreateStudentDto } from '../../types/student';

const StudentManagement: React.FC = () => {
  const [formData, setFormData] = useState<CreateStudentDto>({
    lastName: '',
    firstName: '',
    institutionId: '', // Changé de institution à institutionId
    studyLevel: 'BEPC',
    profession: 'Etudiant',
    phone: '',
    email: '',
    domain: 'GENIE_INFORMATIQUE',
    infoChannel: 'TIKTOK',
    // Ajout des nouveaux champs
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: 'Ivoirienne',
    address: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const navigate = useNavigate();

  // TODO: Récupérer la liste des institutions depuis l'API
  const institutions = [
    { id: '1', name: 'BOVANN GROUP ' },
    { id: '2', name: 'SHEKINA' }
  ];

  const validateForm = () => {
    const { lastName, firstName, institutionId, phone, email } = formData;

    if (!lastName || !firstName || !institutionId || !phone || !email) {
      setError('Les champs Nom, Prénom, Institution, Téléphone et Email sont obligatoires.');
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

    if (!validateForm()) return;

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
        institutionId: '',
        studyLevel: 'BEPC',
        profession: 'Etudiant',
        phone: '',
        email: '',
        domain: 'GENIE_INFORMATIQUE',
        infoChannel: 'TIKTOK',
        dateOfBirth: '',
        placeOfBirth: '',
        nationality: 'Ivoirienne',
        address: '',
        emergencyContact: ''
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ajouter un Étudiant</h1>
              <p className="text-gray-600 mt-1">Créer un nouveau profil étudiant</p>
            </div>
            <button
              onClick={() => navigate('/secretary/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Retour au Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Messages d'alerte */}
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
                ×
              </button>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-medium">Succès:</span>
                <span className="ml-2">{success}</span>
              </div>
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
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Informations de l'Étudiant</h2>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-4">Informations Personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                  <input 
                    type="date"
                    name="dateOfBirth" 
                    value={formData.dateOfBirth} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
                  <input 
                    placeholder="Lieu de naissance" 
                    name="placeOfBirth" 
                    value={formData.placeOfBirth} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationalité</label>
                  <input 
                    placeholder="Nationalité" 
                    name="nationality" 
                    value={formData.nationality} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input 
                    placeholder="exemple@email.com" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <input 
                    placeholder="Adresse complète" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact d'urgence</label>
                  <input 
                    placeholder="Contact en cas d'urgence" 
                    name="emergencyContact" 
                    value={formData.emergencyContact} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Informations académiques */}
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-4">Informations Académiques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institution *</label>
                  <select 
                    name="institutionId" 
                    value={formData.institutionId} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Sélectionnez une institution</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d'étude</label>
                  <select 
                    name="studyLevel" 
                    value={formData.studyLevel} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="BEPC">BEPC</option>
                    <option value="PROBATOIRE">PROBATOIRE</option>
                    <option value="BAC">BAC</option>
                    <option value="LICENCE">LICENCE</option>
                    <option value="MASTER">MASTER</option>
                    <option value="DOCTORAT">DOCTORAT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                  <select 
                    name="profession" 
                    value={formData.profession} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Etudiant">Étudiant</option>
                    <option value="Travailleur">Travailleur</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Domaine d'étude</label>
                  <select 
                    name="domain" 
                    value={formData.domain} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="GENIE_INFORMATIQUE">Génie Informatique</option>
                    <option value="MULTIMEDIA_MARKETING_DIGITAL">Multimédia / Marketing Digital</option>
                    <option value="CREATION_SITE_DEVELOPPEMENT_LOGICIEL">Création de site/Développement de logiciel</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment nous avez-vous connu ?</label>
                  <select 
                    name="infoChannel" 
                    value={formData.infoChannel} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="TIKTOK">TikTok</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="LINKEDIN">LinkedIn</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate('/secretary/dashboard')}
                className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto text-center"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 w-full sm:w-auto text-center"
              >
                {loading ? 'Ajout en cours...' : 'Ajouter l\'étudiant'}
              </button>
            </div>
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
                  onClick={() => setShowConfirmation(false)}
                  className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors w-full sm:w-auto"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmAddStudent}
                  disabled={loading}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 w-full sm:w-auto"
                >
                  {loading ? 'Ajout...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentManagement;