import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstitutions } from '../../hooks/useInstitutions';
import { usePrograms } from '../../hooks/usePrograms';
import InstitutionCard from '../../components/InstitutionCard';
import InstitutionModal from '../../components/Modals/InstitutionModal';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import EmptyState from '../../components/Common/EmptyState';
import { Institution, InstitutionFormData } from '../../types/institution';

const InstitutionManagement: React.FC = () => {
  const navigate = useNavigate();
  const {
    institutions,
    loading,
    error,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    refreshInstitutions
  } = useInstitutions();

  const { allPrograms } = usePrograms();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreate = () => {
    setSelectedInstitution(null);
    setIsModalOpen(true);
  };

  const handleEdit = (institution: Institution) => {
    alert('La modification des institutions n\'est pas disponible pour le moment. Contactez l\'administrateur système.');
    return;
  };

  const handleDelete = (institution: Institution) => {
    alert('La suppression des institutions n\'est pas disponible pour le moment. Contactez l\'administrateur système.');
    return;
  };

  const handleView = (institution: Institution) => {
    navigate(`/admin/institutions/${institution.id}`);
  };

  const handleSubmit = async (data: InstitutionFormData): Promise<boolean> => {
    setActionLoading(true);
    let success = false;

    try {
      if (selectedInstitution) {
        alert('La modification des institutions n\'est pas disponible pour le moment.');
        return false;
      } else {
        const { programIds, ...institutionData } = data;
        
        success = await createInstitution(institutionData);
        
        if (success && programIds.length > 0) {
          console.log('Programmes à associer:', programIds);
        }
      }
    } finally {
      setActionLoading(false);
    }

    if (success) {
      setIsModalOpen(false);
      await refreshInstitutions();
    }

    return success;
  };

  const handleConfirmDelete = async () => {
    if (!selectedInstitution) return;

    setActionLoading(true);
    const success = await deleteInstitution(selectedInstitution.id);
    setActionLoading(false);

    if (success) {
      setIsConfirmModalOpen(false);
      setSelectedInstitution(null);
      await refreshInstitutions();
    }
  };

  const institutionIcon = (
    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  const createAction = (
    <button
      onClick={handleCreate}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span>Créer une institution</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Gestion des Institutions
                </h1>
                <p className="text-gray-600 mt-1">
                  Gérez les établissements scolaires de votre système
                </p>
                
              </div>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nouvelle Institution</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {institutions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <EmptyState
                title="Aucune institution"
                message="Commencez par créer votre première institution pour gérer votre établissement scolaire."
                icon={institutionIcon}
                action={createAction}
              />
            </div>
          ) : (
            <>
              

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {institutions.map((institution) => (
                  <InstitutionCard
                    key={institution.id}
                    institution={institution}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
              </div>
            </>
          )}

          <InstitutionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            institution={selectedInstitution || undefined}
            onSubmit={handleSubmit}
            loading={actionLoading}
            title={selectedInstitution ? 'Modifier l\'institution' : 'Nouvelle institution'}
            availablePrograms={allPrograms}
          />
        </div>
      </div>
    </div>
  );
};

export default InstitutionManagement;