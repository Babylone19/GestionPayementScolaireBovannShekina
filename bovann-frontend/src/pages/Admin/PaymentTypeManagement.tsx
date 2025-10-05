import React, { useState } from 'react';
import { usePaymentTypes } from '../../hooks/usePaymentTypes';
import { useAuth } from '../../hooks/useAuth';
import PaymentTypeCard from '../../components/PaymentTypeCard';
import PaymentTypeModal from '../../components/Modals/PaymentTypeModal';
import ConfirmModal from '../../components/Modals/ConfirmModal';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import EmptyState from '../../components/Common/EmptyState';
import { PaymentType, PaymentTypeFormData, CreatePaymentTypeDto, UpdatePaymentTypeDto } from '../../types/paymentType';

const PaymentTypeManagement: React.FC = () => {
  const { user } = useAuth();
  const institutionId = user?.institutionId || '';
  
  const {
    paymentTypes,
    loading,
    error,
    createPaymentType,
    updatePaymentType,
    deletePaymentType,
    togglePaymentTypeStatus,
    refreshPaymentTypes
  } = usePaymentTypes(institutionId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<PaymentType | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreate = () => {
    setSelectedPaymentType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (paymentType: PaymentType) => {
    setSelectedPaymentType(paymentType);
    setIsModalOpen(true);
  };

  const handleDelete = (paymentType: PaymentType) => {
    setSelectedPaymentType(paymentType);
    setIsConfirmModalOpen(true);
  };

  const handleToggleStatus = async (paymentType: PaymentType, isActive: boolean) => {
    setActionLoading(true);
    const success = await togglePaymentTypeStatus(paymentType.id, isActive);
    setActionLoading(false);
    
    if (success) {
      await refreshPaymentTypes();
    }
  };

  const handleSubmit = async (data: PaymentTypeFormData): Promise<boolean> => {
    setActionLoading(true);
    let success = false;

    try {
      // Convertir amount de string à number
      const paymentTypeData: CreatePaymentTypeDto | UpdatePaymentTypeDto = {
        name: data.name,
        description: data.description,
        amount: data.amount ? Number(data.amount) : undefined,
        isActive: data.isActive,
        institutionId: data.institutionId
      };

      if (selectedPaymentType) {
        // Édition
        success = await updatePaymentType(selectedPaymentType.id, paymentTypeData as UpdatePaymentTypeDto);
      } else {
        // Création
        success = await createPaymentType(paymentTypeData as CreatePaymentTypeDto);
      }
    } finally {
      setActionLoading(false);
    }

    if (success) {
      setIsModalOpen(false);
      await refreshPaymentTypes();
    }

    return success;
  };

  const handleConfirmDelete = async () => {
    if (!selectedPaymentType) return;

    setActionLoading(true);
    const success = await deletePaymentType(selectedPaymentType.id);
    setActionLoading(false);

    if (success) {
      setIsConfirmModalOpen(false);
      setSelectedPaymentType(null);
      await refreshPaymentTypes();
    }
  };

  // Icône personnalisée pour EmptyState
  const paymentTypeIcon = (
    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );

  // Action personnalisée pour EmptyState
  const createAction = (
    <button
      onClick={handleCreate}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <span>Créer un type de paiement</span>
    </button>
  );

  // Filtrer les types de paiement actifs/inactifs
  const activePaymentTypes = paymentTypes.filter(pt => pt.isActive);
  const inactivePaymentTypes = paymentTypes.filter(pt => !pt.isActive);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!institutionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Institution requise</h3>
          <p className="mt-2 text-gray-500">
            Vous devez être associé à une institution pour gérer les types de paiement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Gestion des Types de Paiement
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Gérez les différents types de paiement acceptés par votre institution
                </p>
              </div>
              <button
                onClick={handleCreate}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 w-full sm:w-auto justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="whitespace-nowrap">Nouveau Type</span>
              </button>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800 text-sm sm:text-base">{error}</span>
              </div>
            </div>
          )}

          {/* Liste des types de paiement */}
          {paymentTypes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
              <EmptyState
                title="Aucun type de paiement"
                message="Commencez par créer votre premier type de paiement."
                icon={paymentTypeIcon}
                action={createAction}
              />
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-8">
              {/* Types de paiement actifs */}
              {activePaymentTypes.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Types de paiement actifs 
                    <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {activePaymentTypes.length}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {activePaymentTypes.map((paymentType) => (
                      <PaymentTypeCard
                        key={paymentType.id}
                        paymentType={paymentType}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Types de paiement inactifs */}
              {inactivePaymentTypes.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Types de paiement inactifs
                    <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      {inactivePaymentTypes.length}
                    </span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {inactivePaymentTypes.map((paymentType) => (
                      <PaymentTypeCard
                        key={paymentType.id}
                        paymentType={paymentType}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggleStatus={handleToggleStatus}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modales */}
          <PaymentTypeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            paymentType={selectedPaymentType || undefined}
            onSubmit={handleSubmit}
            loading={actionLoading}
            title={selectedPaymentType ? 'Modifier le type de paiement' : 'Nouveau type de paiement'}
            institutionId={institutionId}
          />

          <ConfirmModal
            isOpen={isConfirmModalOpen}
            onClose={() => setIsConfirmModalOpen(false)}
            onConfirm={handleConfirmDelete}
            loading={actionLoading}
            title="Supprimer le type de paiement"
            message={`Êtes-vous sûr de vouloir supprimer "${selectedPaymentType?.name}" ? Cette action est irréversible.`}
            confirmText="Supprimer"
            cancelText="Annuler"
            variant="danger"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentTypeManagement;