import React from 'react';
import PaymentTypeForm from '../Forms/PaymentTypeForm';
import { PaymentType, PaymentTypeFormData } from '../../types/paymentType';

interface PaymentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentType?: PaymentType;
  onSubmit: (data: PaymentTypeFormData) => Promise<boolean>;
  loading?: boolean;
  title: string;
  institutionId: string;
}

const PaymentTypeModal: React.FC<PaymentTypeModalProps> = ({
  isOpen,
  onClose,
  paymentType,
  onSubmit,
  loading,
  title,
  institutionId
}) => {
  if (!isOpen) return null;

  const handleSubmit = async (data: PaymentTypeFormData): Promise<boolean> => {
    return await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </h3>
              
              <div className="mt-4">
                <PaymentTypeForm
                  paymentType={paymentType}
                  onSubmit={handleSubmit}
                  onCancel={onClose}
                  loading={loading}
                  institutionId={institutionId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTypeModal;