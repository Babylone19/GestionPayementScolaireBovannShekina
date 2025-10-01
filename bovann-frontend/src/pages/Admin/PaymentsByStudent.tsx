import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentsByStudent: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Paiements par Étudiant</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Page des paiements par étudiant en construction...</p>
          <button 
            onClick={() => navigate('/admin/payments/list')}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentsByStudent;