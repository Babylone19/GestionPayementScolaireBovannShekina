import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInstitutions } from '../../hooks/useInstitutions';
import { usePrograms } from '../../hooks/usePrograms';
import { usePaymentTypes } from '../../hooks/usePaymentTypes';
import ProgramModal from '../../components/Modals/ProgramModal';
import PaymentTypeModal from '../../components/Modals/PaymentTypeModal';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import EmptyState from '../../components/Common/EmptyState';
import { Program, ProgramFormData } from '../../types/program';
import { PaymentType, PaymentTypeFormData } from '../../types/paymentType';

const InstitutionView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { institutions, loading: institutionsLoading } = useInstitutions();
  const { 
    programs, 
    loading: programsLoading, 
    createProgram,
    refreshPrograms 
  } = usePrograms(id);
  
  const { 
    paymentTypes, 
    loading: paymentTypesLoading, 
    createPaymentType,
    refreshPaymentTypes 
  } = usePaymentTypes(id);

  const [programModalOpen, setProgramModalOpen] = useState(false);
  const [paymentTypeModalOpen, setPaymentTypeModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const institution = institutions.find(inst => inst.id === id);

  const loading = institutionsLoading || programsLoading || paymentTypesLoading;

  // Gestion des programmes
  const handleCreateProgram = async (data: ProgramFormData): Promise<boolean> => {
    if (!id) return false;
    
    setActionLoading(true);
    try {
      const programData = {
        ...data,
        price: data.price ? Number(data.price) : undefined,
        institutionId: id
      };
      
      const success = await createProgram(programData);
      if (success) {
        await refreshPrograms();
        setProgramModalOpen(false);
      }
      return success;
    } finally {
      setActionLoading(false);
    }
  };

  // Gestion des types de paiement
  const handleCreatePaymentType = async (data: PaymentTypeFormData): Promise<boolean> => {
    if (!id) return false;
    
    setActionLoading(true);
    try {
      const paymentTypeData = {
        ...data,
        amount: data.amount ? Number(data.amount) : undefined,
        institutionId: id
      };
      
      const success = await createPaymentType(paymentTypeData);
      if (success) {
        await refreshPaymentTypes();
        setPaymentTypeModalOpen(false);
      }
      return success;
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Institution non trouvée</h1>
          <Link to="/admin/institutions" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Retour à la liste des institutions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Link 
              to="/admin/institutions" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour aux institutions
            </Link>
          </div>

          {/* En-tête de l'institution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start space-x-4 mb-4 sm:mb-0">
                {institution.logo ? (
                  <img
                    src={institution.logo}
                    alt={`Logo ${institution.name}`}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {institution.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{institution.name}</h1>
                  {institution.description && (
                    <p className="text-gray-600 mt-1">{institution.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    {institution.email && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {institution.email}
                      </div>
                    )}
                    {institution.phone && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {institution.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Programmes de l'institution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Programmes 
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {programs.length}
                  </span>
                </h2>
                <button
                  onClick={() => setProgramModalOpen(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Ajouter</span>
                </button>
              </div>
              
              {programs.length === 0 ? (
                <EmptyState
                  title="Aucun programme"
                  message="Ajoutez le premier programme à cette institution."
                  icon={
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 14l9-5-9-5-9 5 9 5z" />
                    </svg>
                  }
                  action={
                    <button
                      onClick={() => setProgramModalOpen(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Créer un programme</span>
                    </button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {programs.map((program) => (
                    <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{program.name}</h3>
                          {program.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{program.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            {program.duration && (
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {program.duration}
                              </span>
                            )}
                            {program.price && program.price > 0 && (
                              <span className="text-green-600 font-medium">
                                {program.price.toLocaleString('fr-FR')} FCFA
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Types de paiement de l'institution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Types de Paiement
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {paymentTypes.length}
                  </span>
                </h2>
                <button
                  onClick={() => setPaymentTypeModalOpen(true)}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Ajouter</span>
                </button>
              </div>
              
              {paymentTypes.length === 0 ? (
                <EmptyState
                  title="Aucun type de paiement"
                  message="Ajoutez le premier type de paiement à cette institution."
                  icon={
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  }
                  action={
                    <button
                      onClick={() => setPaymentTypeModalOpen(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Créer un type</span>
                    </button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {paymentTypes.map((paymentType) => (
                    <div key={paymentType.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900">{paymentType.name}</h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              paymentType.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {paymentType.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </div>
                          {paymentType.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{paymentType.description}</p>
                          )}
                          {paymentType.amount && paymentType.amount > 0 && (
                            <p className="text-sm text-green-600 font-medium mt-2">
                              {paymentType.amount.toLocaleString('fr-FR')} FCFA
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modales */}
          <ProgramModal
            isOpen={programModalOpen}
            onClose={() => setProgramModalOpen(false)}
            onSubmit={handleCreateProgram}
            loading={actionLoading}
            title="Nouveau programme"
            institutionId={id || ''}
          />

          <PaymentTypeModal
            isOpen={paymentTypeModalOpen}
            onClose={() => setPaymentTypeModalOpen(false)}
            onSubmit={handleCreatePaymentType}
            loading={actionLoading}
            title="Nouveau type de paiement"
            institutionId={id || ''}
          />
        </div>
      </div>
    </div>
  );
};

export default InstitutionView;