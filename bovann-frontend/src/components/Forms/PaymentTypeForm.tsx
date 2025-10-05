import React, { useState, useEffect } from 'react';
import { PaymentType, PaymentTypeFormData } from '../../types/paymentType';

interface PaymentTypeFormProps {
  paymentType?: PaymentType;
  onSubmit: (data: PaymentTypeFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
  institutionId: string;
}

const PaymentTypeForm: React.FC<PaymentTypeFormProps> = ({
  paymentType,
  onSubmit,
  onCancel,
  loading = false,
  institutionId
}) => {
  const [formData, setFormData] = useState<PaymentTypeFormData>({
    name: '',
    description: '',
    amount: '',
    isActive: true,
    institutionId
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (paymentType) {
      setFormData({
        name: paymentType.name || '',
        description: paymentType.description || '',
        amount: paymentType.amount?.toString() || '',
        isActive: paymentType.isActive,
        institutionId: paymentType.institutionId
      });
    } else {
      setFormData(prev => ({ ...prev, institutionId }));
    }
  }, [paymentType, institutionId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }

    if (formData.amount && isNaN(Number(formData.amount))) {
      newErrors.amount = 'Le montant doit être un nombre';
    }

    if (formData.amount && Number(formData.amount) < 0) {
      newErrors.amount = 'Le montant ne peut pas être négatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const success = await onSubmit(formData);
    if (success) {
      onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nom du type de paiement *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          placeholder="Ex: Frais de scolarité, Frais d'inscription..."
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Description détaillée du type de paiement..."
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Montant (FCFA)
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          min="0"
          step="1"
          className={`mt-1 block w-full rounded-md border ${
            errors.amount ? 'border-red-300' : 'border-gray-300'
          } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          placeholder="0"
        />
        {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
          Type de paiement actif
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : paymentType ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default PaymentTypeForm;