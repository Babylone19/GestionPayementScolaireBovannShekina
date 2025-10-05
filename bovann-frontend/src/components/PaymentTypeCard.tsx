import React from 'react';
import { PaymentType } from '../types/paymentType';

interface PaymentTypeCardProps {
  paymentType: PaymentType;
  onEdit: (paymentType: PaymentType) => void;
  onDelete: (paymentType: PaymentType) => void;
  onToggleStatus: (paymentType: PaymentType, isActive: boolean) => void;
}

const PaymentTypeCard: React.FC<PaymentTypeCardProps> = ({
  paymentType,
  onEdit,
  onDelete,
  onToggleStatus
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
              {paymentType.name}
            </h3>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${
                paymentType.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {paymentType.isActive ? 'Actif' : 'Inactif'}
            </span>
          </div>
          
          {paymentType.description && (
            <p className="text-gray-600 text-sm line-clamp-2 sm:line-clamp-3">
              {paymentType.description}
            </p>
          )}
        </div>
        
        <div className="flex justify-end sm:justify-start space-x-2 sm:ml-4">
          <button
            onClick={() => onToggleStatus(paymentType, !paymentType.isActive)}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              paymentType.isActive
                ? 'text-yellow-600 hover:bg-yellow-50'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={paymentType.isActive ? 'Désactiver' : 'Activer'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {paymentType.isActive ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              )}
            </svg>
          </button>
          <button
            onClick={() => onEdit(paymentType)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
            title="Modifier"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(paymentType)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 gap-2">
        <div className="space-y-1">
          {paymentType.institution?.name && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="truncate">{paymentType.institution.name}</span>
            </div>
          )}
        </div>

        {paymentType.amount && paymentType.amount > 0 && (
          <div className="text-right sm:text-left">
            <div className="text-base sm:text-lg font-semibold text-green-600 whitespace-nowrap">
              {paymentType.amount.toLocaleString('fr-FR')} FCFA
            </div>
            <div className="text-xs text-gray-400">Montant</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTypeCard;