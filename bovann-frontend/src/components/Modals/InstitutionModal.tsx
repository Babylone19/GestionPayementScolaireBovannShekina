import React from 'react';
import InstitutionForm from '../Forms/InstitutionForm';
import { Institution, InstitutionFormData } from '../../types/institution';
import { Program } from '../../types/program';

interface InstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  institution?: Institution;
  onSubmit: (data: InstitutionFormData) => Promise<boolean>;
  loading?: boolean;
  title: string;
  availablePrograms: Program[];
}

const InstitutionModal: React.FC<InstitutionModalProps> = ({
  isOpen,
  onClose,
  institution,
  onSubmit,
  loading,
  title,
  availablePrograms
}) => {
  if (!isOpen) return null;

  const handleSubmit = async (data: InstitutionFormData): Promise<boolean> => {
    return await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </h3>
              
              <div className="mt-4">
                <InstitutionForm
                  institution={institution}
                  onSubmit={handleSubmit}
                  onCancel={onClose}
                  loading={loading}
                  availablePrograms={availablePrograms}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionModal;