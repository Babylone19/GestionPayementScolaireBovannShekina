import { useState, useEffect } from 'react';
import { paymentTypeService } from '../api/paymentTypes';
import { useAuth } from './useAuth';
import { PaymentType, CreatePaymentTypeDto, UpdatePaymentTypeDto } from '../types/paymentType';

export const usePaymentTypes = (institutionId?: string) => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const loadPaymentTypes = async () => {
    if (!token || !institutionId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await paymentTypeService.getByInstitution(token, institutionId);
      setPaymentTypes(data);
    } catch (err) {
      setError('Erreur lors du chargement des types de paiement');
      console.error('Error loading payment types:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPaymentType = async (data: CreatePaymentTypeDto): Promise<boolean> => {
    if (!token || !institutionId) return false;
    
    try {
      setError(null);
      const newPaymentType = await paymentTypeService.create(token, institutionId, data);
      setPaymentTypes(prev => [...prev, newPaymentType]);
      return true;
    } catch (err) {
      setError('Erreur lors de la création du type de paiement');
      console.error('Error creating payment type:', err);
      return false;
    }
  };

  const updatePaymentType = async (id: string, data: UpdatePaymentTypeDto): Promise<boolean> => {
    if (!token) return false;
    
    try {
      setError(null);
      // À implémenter quand le service sera complet
      await loadPaymentTypes(); // Recharger la liste
      return true;
    } catch (err) {
      setError('Erreur lors de la modification du type de paiement');
      console.error('Error updating payment type:', err);
      return false;
    }
  };

  const deletePaymentType = async (id: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      setError(null);
      // À implémenter quand le service sera complet
      setPaymentTypes(prev => prev.filter(paymentType => paymentType.id !== id));
      return true;
    } catch (err) {
      setError('Erreur lors de la suppression du type de paiement');
      console.error('Error deleting payment type:', err);
      return false;
    }
  };

  const togglePaymentTypeStatus = async (id: string, isActive: boolean): Promise<boolean> => {
    if (!token) return false;
    
    try {
      setError(null);
      // Mettre à jour localement en attendant l'implémentation backend
      setPaymentTypes(prev => prev.map(pt => 
        pt.id === id ? { ...pt, isActive } : pt
      ));
      return true;
    } catch (err) {
      setError('Erreur lors du changement de statut');
      console.error('Error toggling payment type status:', err);
      return false;
    }
  };

  useEffect(() => {
    if (institutionId) {
      loadPaymentTypes();
    }
  }, [token, institutionId]);

  return {
    paymentTypes,
    loading,
    error,
    createPaymentType,
    updatePaymentType,
    deletePaymentType,
    togglePaymentTypeStatus,
    refreshPaymentTypes: loadPaymentTypes
  };
};

export default usePaymentTypes;