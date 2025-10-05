import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { getStudentById, updateStudent } from '../../api/students';
import { institutionService } from '../../api/institutions';
import { programService } from '../../api/programs';
import { Student, UpdateStudentDto, StudyLevel, Profession, StudyDomain, InfoChannel, Nationality } from '../../types/student';
import { Institution } from '../../types/institution';
import { Program } from '../../types/program';

// Fonction utilitaire pour formater la date pour l'input
const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return '';
  
  console.log('Date reçue pour formatage:', dateString);
  
  // Si c'est déjà au format yyyy-MM-dd, retourner tel quel
  if (dateString.length === 10 && dateString.includes('-')) {
    return dateString;
  }
  
  // Si c'est un DateTime ISO, extraire la partie date
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.log('Date invalide:', dateString);
      return '';
    }
    
    // Formater en yyyy-MM-dd pour l'input date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}`;
    console.log('Date formatée pour input:', formattedDate);
    return formattedDate;
  } catch (error) {
    console.error('Erreur formatage date:', error);
    return '';
  }
};

const StudentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UpdateStudentDto>({});
  const [originalStudent, setOriginalStudent] = useState<Student | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingInstitutions, setLoadingInstitutions] = useState<boolean>(true);
  const [loadingPrograms, setLoadingPrograms] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Options pour les selects
  const studyLevels: StudyLevel[] = ['BEPC', 'PROBATOIRE', 'BAC', 'LICENCE', 'MASTER', 'DOCTORAT'];
  const professions: Profession[] = ['Etudiant', 'Travailleur', 'Autre'];
  const domains: StudyDomain[] = ['GENIE_INFORMATIQUE', 'MULTIMEDIA_MARKETING_DIGITAL', 'CREATION_SITE_DEVELOPPEMENT_LOGICIEL'];
  const infoChannels: InfoChannel[] = ['TIKTOK', 'FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'WHATSAPP', 'AUTRE'];
  const nationalities: Nationality[] = ['Togolaise','Ivoirienne', 'Française', 'Malienne', 'Burkinabé', 'Guinéenne', 'Sénégalaise', 'Autre'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token || !id) {
          navigate('/');
          return;
        }

        console.log('Chargement des données pour l\'étudiant:', id);
        
        // Charger l'étudiant
        const studentData = await getStudentById(token, id);
        console.log('Données étudiant reçues:', studentData);
        
        setOriginalStudent(studentData);
        
        // Préparer les données du formulaire avec formatage de la date
        const preparedFormData = {
          lastName: studentData.lastName || '',
          firstName: studentData.firstName || '',
          dateOfBirth: formatDateForInput(studentData.dateOfBirth),
          placeOfBirth: studentData.placeOfBirth || '',
          nationality: studentData.nationality || 'Ivoirienne',
          institutionId: studentData.institutionId || '',
          programId: studentData.programId || '',
          studyLevel: studentData.studyLevel || 'BEPC',
          profession: studentData.profession || 'Etudiant',
          phone: studentData.phone || '',
          email: studentData.email || '',
          photo: studentData.photo || '',
          domain: studentData.domain || 'GENIE_INFORMATIQUE',
          infoChannel: studentData.infoChannel || 'TIKTOK',
          address: studentData.address || '',
          emergencyContact: studentData.emergencyContact || ''
        };

        console.log('Données formulaire préparées:', preparedFormData);
        setFormData(preparedFormData);

        // Charger les institutions
        const institutionsData = await institutionService.getAll(token);
        setInstitutions(institutionsData);

        // Charger les programmes si institutionId existe
        if (studentData.institutionId) {
          const programsData = await programService.getByInstitution(token, studentData.institutionId);
          setPrograms(programsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
        setLoadingInstitutions(false);
        setLoadingPrograms(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Recharger les programmes quand l'institution change
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!formData.institutionId) {
        setPrograms([]);
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

    if (formData.institutionId) {
      fetchPrograms();
    }
  }, [formData.institutionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    try {
      setSaving(true);
      const token = getToken();
      if (!token || !id) return;

      console.log('Données avant envoi:', formData);

      // Préparer les données avec gestion de la date
      const submitData: UpdateStudentDto = {};
      Object.keys(formData).forEach(key => {
        const formKey = key as keyof UpdateStudentDto;
        const formValue = formData[formKey];
        const originalValue = originalStudent?.[key as keyof Student];
        
        // Vérifier si la valeur a changé
        const hasChanged = formValue !== originalValue;
        
        if (hasChanged) {
          // Si c'est la date de naissance, la convertir en DateTime
          if (formKey === 'dateOfBirth' && formValue) {
            submitData[formKey] = `${formValue}T00:00:00.000Z`;
            console.log('Date convertie pour envoi:', submitData[formKey]);
          } else {
            submitData[formKey] = formValue;
          }
        }
      });

      console.log('Données à envoyer:', submitData);

      // Si aucun changement, ne pas envoyer
      if (Object.keys(submitData).length === 0) {
        setSuccess('Aucune modification détectée');
        return;
      }

      await updateStudent(token, id, submitData);
      setSuccess('Étudiant mis à jour avec succès');
      
      // Rediriger après un délai
      setTimeout(() => {
        navigate(`/admin/students/${id}/view`);
      }, 2000);

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'étudiant');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Champ ${name} modifié:`, value);
    setFormData(prev => ({ ...prev, [name]: value }));
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

  if (error || !originalStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Étudiant non trouvé</h2>
          <button
            onClick={() => navigate('/admin/students/list')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Modifier {originalStudent.firstName} {originalStudent.lastName}
              </h1>
              <p className="text-gray-600 mt-1">Modifier le profil étudiant</p>
            </div>
            <button
              onClick={() => navigate(`/admin/students/${id}/view`)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Retour au profil
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Messages d'alerte */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-red-700">×</button>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{success}</span>
              <button onClick={() => setSuccess(null)} className="text-green-700">×</button>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Informations Personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input 
                    name="lastName" 
                    value={formData.lastName || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input 
                    name="firstName" 
                    value={formData.firstName || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                  <input 
                    type="date"
                    name="dateOfBirth" 
                    value={formData.dateOfBirth || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: AAAA-MM-JJ (ex: 2000-12-31)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
                  <input 
                    name="placeOfBirth" 
                    value={formData.placeOfBirth || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationalité</label>
                  <select 
                    name="nationality" 
                    value={formData.nationality || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {nationalities.map(nat => (
                      <option key={nat} value={nat}>{nat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                  <select 
                    name="profession" 
                    value={formData.profession || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {professions.map(prof => (
                      <option key={prof} value={prof}>{prof}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Informations de contact */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Informations de Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input 
                    name="phone" 
                    value={formData.phone || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    name="email" 
                    value={formData.email || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <textarea 
                    name="address" 
                    value={formData.address || ''} 
                    onChange={handleChange} 
                    rows={3}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact d'urgence</label>
                  <input 
                    name="emergencyContact" 
                    value={formData.emergencyContact || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Informations académiques */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Informations Académiques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
                  <select 
                    name="institutionId" 
                    value={formData.institutionId || ''} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingInstitutions}
                  >
                    <option value="">Sélectionnez une institution</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Programme</label>
                  <select 
                    name="programId" 
                    value={formData.programId || ''} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loadingPrograms || !formData.institutionId}
                  >
                    <option value="">Sélectionnez un programme</option>
                    {programs.map(program => (
                      <option key={program.id} value={program.id}>{program.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niveau d'étude</label>
                  <select 
                    name="studyLevel" 
                    value={formData.studyLevel || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {studyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Domaine d'étude</label>
                  <select 
                    name="domain" 
                    value={formData.domain || ''} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {domains.map(domain => (
                      <option key={domain} value={domain}>{getDomainLabel(domain)}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Comment nous avez-vous connu ?</label>
                  <select 
                    name="infoChannel" 
                    value={formData.infoChannel || ''} 
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
                onClick={() => navigate(`/admin/students/${id}/view`)}
                className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto text-center"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 w-full sm:w-auto text-center"
              >
                {saving ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default StudentEdit;