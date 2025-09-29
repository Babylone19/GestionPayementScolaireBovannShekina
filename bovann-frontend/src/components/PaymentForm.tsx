import React, { useState } from 'react';
import { CreatePaymentDto } from '../types/payment';

interface PaymentFormProps {
  studentId: string;
  onSubmit: (payment: CreatePaymentDto) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ studentId, onSubmit }) => {
  const [amount, setAmount] = useState<number>(2000);
  const [validFrom, setValidFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState<string>(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      studentId,
      amount,
      currency: 'XOF', // Ajouté pour correspondre à CreatePaymentDto
      reference: `PAY-${Date.now()}`, // Ajouté pour correspondre à CreatePaymentDto
      validFrom,
      validUntil,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Montant (FCFA)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Valide à partir de</label>
        <input
          type="date"
          value={validFrom}
          onChange={(e) => setValidFrom(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Valide jusqu'à</label>
        <input
          type="date"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
        />
      </div>
      <button
        type="submit"
        className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
      >
        Enregistrer le paiement
      </button>
    </form>
  );
};

export default PaymentForm;
