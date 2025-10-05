import { useState, useEffect } from 'react';

export const usePayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation de chargement des paiements
    setTimeout(() => {
      setPayments([]);
      setLoading(false);
    }, 1000);
  }, []);

  return {
    payments,
    loading,
  };
};

export default usePayments;