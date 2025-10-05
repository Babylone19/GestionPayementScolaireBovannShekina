import React, { useState } from 'react';
import { usePrograms } from '../../hooks/usePrograms';
import { useAuth } from '../../hooks/useAuth';
import ProgramCard from '../../components/ProgramCard';
import ProgramModal from '../../components/Modals/ProgramModal';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import EmptyState from '../../components/Common/EmptyState';
import { Program, ProgramFormData, CreateProgramDto } from '../../types/program';

const ProgramManagement: React.FC = () => {
  const { user } = useAuth();
  const institutionId = user?.institutionId || '';
  
  const {
    programs,
    loading,
    error,
    createProgram,
    updateProgram,
    deleteProgram,
    refreshPrograms
  } = usePrograms(institutionId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreate = () => {
    setSelectedProgram(null);
    setIsModalOpen(true);
  };

  const handleEdit = (program: Program) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const handleDelete = (program: Program) => {
    setSelectedProgram(program);
    setIsConfirmModalOpen(true);
  };

  const handleSubmit = async (data: ProgramFormData): Promise<boolean> => {
    setActionLoading(true);
    let success = false;

    try {
      // Convertir le prix de string à number
      const programData: CreateProgramDto = {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price ? Number(data.price) : undefined,
        institutionId: data.institutionId
      };

      if (selectedProgram) {
        // Édition
        success = await updateProgram(selectedProgram.id, programData);
      } else {
        // Création
        success = await createProgram(programData);
      }
    } finally {
      setActionLoading(false);
    }

    if (success) {
      setIsModalOpen(false);
      await refreshPrograms();
    }

    return success;
  };

  const handleConfirmDelete = async () => {
    if (!selectedProgram) return;

    setActionLoading(true);
    const success = await deleteProgram(selectedProgram.id);
    setActionLoading(false);

    if (success) {
      setIsConfirmModalOpen(false);
      setSelectedProgram(null);
      await refreshPrograms();
    }
  };

  // Icône personnalisée pour EmptyState
  const programIcon = (
    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14v6l9-5-9-5-9 5 9 5z" />
    </svg>
  );

  // Action personnalisée pour EmptyState
  const createAction = (
    <button
      onClick={handleCreate}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span>Créer un programme</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!institutionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Institution requise</h3>
          <p className="mt-2 text-gray-500">
            Vous devez être associé à une institution pour gérer les programmes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Gestion des Programmes
                </h1>
                <p className="text-gray-600 mt-1">
                  Gérez les programmes académiques de votre institution
                </p>
              </div>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Nouveau Programme</span>
              </button>
            </div>
          </div>

          {/* Message d'erreur */}
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

          {/* Liste des programmes */}
          {programs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <EmptyState
                title="Aucun programme"
                message="Commencez par créer votre premier programme académique."
                icon={programIcon}
                action={createAction}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Modales */}
          <ProgramModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            program={selectedProgram || undefined}
            onSubmit={handleSubmit}
            loading={actionLoading}
            title={selectedProgram ? 'Modifier le programme' : 'Nouveau programme'}
            institutionId={institutionId}
          />

          <ConfirmModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmDelete}
            loading={actionLoading}
            title="Supprimer le programme"
            message={`Êtes-vous sûr de vouloir supprimer "${selectedProgram?.name}" ? Cette action est irréversible.`}
            confirmText="Supprimer"
            cancelText="Annuler"
            variant="danger"
          />
        </div>
      </div>
    </div>
  );
};

export default ProgramManagement;