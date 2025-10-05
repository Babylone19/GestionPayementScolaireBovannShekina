import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { createStudent } from '../../api/students';
import { institutionService } from '../../api/institutions';
import { programService } from '../../api/programs';
import { CreateStudentDto, StudyLevel, Profession, StudyDomain, InfoChannel, Nationality } from '../../types/student';
import { Institution } from '../../types/institution';
import { Program } from '../../types/program';

const CreateStudent: React.FC = () => {
  const [formData, setFormData] = useState<CreateStudentDto>({
    // Informations personnelles
    lastName: '',
    firstName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: 'Togolaise',
    
    // Relations - L'utilisateur peut choisir l'institution
    institutionId: '',
    programId: '',
    
    // Informations académiques et professionnelles
    studyLevel: 'BEPC',
    profession: 'Etudiant',
    phone: '',
    email: '',
    photo: '',
    domain: 'GENIE_INFORMATIQUE',
    infoChannel: 'TIKTOK',
    
    // Informations supplémentaires
    address: '',
    emergencyContact: ''
  });

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInstitutions, setLoadingInstitutions] = useState<boolean>(true);
  const [loadingPrograms, setLoadingPrograms] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const navigate = useNavigate();

  // Options pour les selects
  const studyLevels: StudyLevel[] = ['BEPC', 'PROBATOIRE', 'BAC', 'LICENCE', 'MASTER', 'DOCTORAT'];
  const professions: Profession[] = ['Etudiant', 'Travailleur', 'Autre'];
  const domains: StudyDomain[] = ['GENIE_INFORMATIQUE', 'MULTIMEDIA_MARKETING_DIGITAL', 'CREATION_SITE_DEVELOPPEMENT_LOGICIEL'];
  const infoChannels: InfoChannel[] = ['TIKTOK', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'WHATSAPP', 'AUTRE'];
  const nationalities: Nationality[] = ['Togolaise','Ivoirienne', 'Française', 'Malienne', 'Burkinabé', 'Guinéenne', 'Sénégalaise', 'Autre'];

  // Récupérer les institutions depuis l'API
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }
        
        const institutionsData = await institutionService.getAll(token);
        setInstitutions(institutionsData);
      } catch (error) {
        console.error('Erreur lors du chargement des institutions:', error);
        setError('Erreur lors du chargement des institutions');
      } finally {
        setLoadingInstitutions(false);
      }
    };
    
    fetchInstitutions();
  }, [navigate]);

  // Récupérer les programmes quand une institution est sélectionnée
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!formData.institutionId) {
        setPrograms([]);
        setLoadingPrograms(false);
        return;
      }

      try {
        setLoadingPrograms(true);
        const token = getToken();
        if (!token) return;

        const programsData = await programService.getByInstitution(token, formData.institutionId);
        setPrograms(programsData);
      } catch (error) {
        console.error('Erreur lors du chargement des programmes:', error);
        setPrograms([]);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, [formData.institutionId]);

  const validateForm = (): boolean => {
    const { lastName, firstName, institutionId, phone, email } = formData;

    // Validation des champs obligatoires
    if (!lastName?.trim() || !firstName?.trim() || !institutionId || !phone?.trim() || !email?.trim()) {
      setError('Les champs Nom, Prénom, Institution, Téléphone et Email sont obligatoires.');
      return false;
    }

    // Validation du téléphone
    const phoneRegex = /^\+?[1-9]\d{0,14}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Numéro de téléphone invalide.');
      return false;
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email invalide.');
      return false;
    }

    // Validation de la date de naissance si fournie
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const minAgeDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
      
      if (birthDate > minAgeDate) {
        setError('L\'étudiant doit avoir au moins 10 ans.');
        return false;
      }
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
      if (!token) {
        navigate('/');
        return;
      }

      // Validation finale de l'institutionId
      if (!formData.institutionId) {
        setError('Veuillez sélectionner une institution');
        setLoading(false);
        return;
      }

      // Préparation des données pour l'envoi
      const submitData: CreateStudentDto = {
        lastName: formData.lastName.trim(),
        firstName: formData.firstName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        institutionId: formData.institutionId, // L'institution choisie par l'utilisateur
        nationality: formData.nationality || 'Togolaise',
        studyLevel: formData.studyLevel || 'BEPC',
        profession: formData.profession || 'Etudiant',
        domain: formData.domain || 'GENIE_INFORMATIQUE',
        infoChannel: formData.infoChannel || 'TIKTOK',
      };

      // Ajout des champs optionnels seulement s'ils ont une valeur
      if (formData.dateOfBirth) {
        submitData.dateOfBirth = formData.dateOfBirth;
      }
      if (formData.placeOfBirth?.trim()) {
        submitData.placeOfBirth = formData.placeOfBirth.trim();
      }
      if (formData.programId && formData.programId !== '') {
        submitData.programId = formData.programId;
      }
      if (formData.photo?.trim()) {
        submitData.photo = formData.photo.trim();
      }
      if (formData.address?.trim()) {
        submitData.address = formData.address.trim();
      }
      if (formData.emergencyContact?.trim()) {
        submitData.emergencyContact = formData.emergencyContact.trim();
      }

      console.log('Données envoyées au serveur:', submitData);
      console.log('institutionId choisi:', submitData.institutionId);
      console.log('programId:', submitData.programId);

      const result = await createStudent(token, submitData);
      console.log('Étudiant créé avec succès:', result);
      
      setSuccess('Étudiant ajouté avec succès !');
      
      // Réinitialiser le formulaire
      setFormData({
        lastName: '',
        firstName: '',
        dateOfBirth: '',
        placeOfBirth: '',
        nationality: 'Togolaise',
        institutionId: '',
        programId: '',
        studyLevel: 'BEPC',
        profession: 'Etudiant',
        phone: '',
        email: '',
        photo: '',
        domain: 'GENIE_INFORMATIQUE',
        infoChannel: 'TIKTOK',
        address: '',
        emergencyContact: ''
      });

      // Réinitialiser les programmes
      setPrograms([]);
    } catch (err: any) {
      console.error('Erreur lors de la création de l\'étudiant:', err);
      
      if (err.response?.data) {
        const errorData = err.response.data;
        console.log('Données d\'erreur du serveur:', errorData);
        
        if (errorData.errors) {
          const messages = errorData.errors.map((e: any) => `${e.param}: ${e.msg}`).join(', ');
          setError(`Erreurs de validation: ${messages}`);
        } else if (errorData.message) {
          setError(`Erreur serveur: ${errorData.message}`);
        } else {
          setError('Erreur lors de la création de l\'étudiant');
        }
      } else if (err.message) {
        setError(`Erreur: ${err.message}`);
      } else {
        setError('Erreur inconnue lors de la création de l\'étudiant');
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelAddStudent = () => {
    setShowConfirmation(false);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file.name }));
    }
  };

  const getDomainLabel = (domain: StudyDomain): string => {
    const labels: Record<StudyDomain, string> = {
      'GENIE_INFORMATIQUE': 'Génie Informatique',
      'MULTIMEDIA_MARKETING_DIGITAL': 'Multimédia / Marketing Digital',
      'CREATION_SITE_DEVELOPPEMENT_LOGICIEL': 'Création de site / Développement de logiciel'
    };
    return labels[domain] || domain;
  };

  const getChannelLabel = (channel: InfoChannel): string => {
    const labels: Record<InfoChannel, string> = {
      'TIKTOK': 'TikTok',
      'FACEBOOK': 'Facebook',
      'INSTAGRAM': 'Instagram',
      'LINKEDIN': 'LinkedIn',
      'WHATSAPP': 'WhatsApp',
      'AUTRE': 'Autre'
    };
    return labels[channel] || channel;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Ajouter un Étudiant</h1>
              <p className="text-gray-600 mt-1">Créer un nouveau profil étudiant complet</p>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Retour au Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
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
            <p className="text-sm text-gray-600 mt-1">Tous les champs marqués d'un * sont obligatoires</p>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Section 1: Informations personnelles */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Informations Personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
                  <input 
                    placeholder="Ville, Pays" 
                    name="placeOfBirth" 
                    value={formData.placeOfBirth} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationalité</label>
                  <select 
                    name="nationality" 
                    value={formData.nationality} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {nationalities.map(nat => (
                      <option key={nat} value={nat}>{nat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
                  <input 
                    type="file"
                    name="photo" 
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {formData.photo && (
                    <p className="text-sm text-green-600 mt-1">Fichier sélectionné: {formData.photo}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Informations de contact */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Informations de Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <textarea 
                    placeholder="Adresse complète" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    rows={3}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact d'urgence</label>
                  <input 
                    placeholder="Nom et téléphone du contact en cas d'urgence" 
                    name="emergencyContact" 
                    value={formData.emergencyContact} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Informations académiques */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Informations Académiques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institution *</label>
                  <select 
                    name="institutionId" 
                    value={formData.institutionId} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loadingInstitutions}
                  >
                    <option value="">{loadingInstitutions ? 'Chargement...' : 'Sélectionnez une institution'}</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                  {loadingInstitutions && (
                    <p className="text-sm text-gray-500 mt-1">Chargement des institutions...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Programme</label>
                  <select 
                    name="programId" 
                    value={formData.programId} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingPrograms || !formData.institutionId}
                  >
                    <option value="">{loadingPrograms ? 'Chargement...' : formData.institutionId ? 'Sélectionnez un programme' : 'Sélectionnez d\'abord une institution'}</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>{program.name}</option>
                    ))}
                  </select>
                  {formData.institutionId && programs.length === 0 && !loadingPrograms && (
                    <p className="text-sm text-gray-500 mt-1">Aucun programme disponible pour cette institution</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d'étude</label>
                  <select 
                    name="studyLevel" 
                    value={formData.studyLevel} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {studyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
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
                    {professions.map(prof => (
                      <option key={prof} value={prof}>{prof}</option>
                    ))}
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
                    {domains.map(domain => (
                      <option key={domain} value={domain}>{getDomainLabel(domain)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment nous avez-vous connu ?</label>
                  <select 
                    name="infoChannel" 
                    value={formData.infoChannel} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {infoChannels.map(channel => (
                      <option key={channel} value={channel}>{getChannelLabel(channel)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
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
                  onClick={cancelAddStudent}
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

export default CreateStudent;