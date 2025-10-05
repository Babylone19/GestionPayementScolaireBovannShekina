import { useState, useEffect } from 'react';
import { institutionService } from '../api/institutions';
import { useAuth } from './useAuth';
import { Institution, CreateInstitutionDto, UpdateInstitutionDto } from '../types/institution';

export const useInstitutions = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const loadInstitutions = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await institutionService.getAll(token);
      setInstitutions(data);
    } catch (err) {
      setError('Erreur lors du chargement des institutions');
      console.error('Error loading institutions:', err);
    } finally {
      setLoading(false);
    }
  };

  const createInstitution = async (data: CreateInstitutionDto): Promise<boolean> => {
    if (!token) return false;
    
    try {
      setError(null);
      const newInstitution = await institutionService.create(token, data);
      setInstitutions(prev => [...prev, newInstitution]);
      return true;
    } catch (err) {
      setError('Erreur lors de la création de l\'institution');
      console.error('Error creating institution:', err);
      return false;
    }
  };

  const updateInstitution = async (id: string, data: UpdateInstitutionDto): Promise<boolean> => {
    if (!token) return false;
    
    try {
      setError(null);
      const updatedInstitution = await institutionService.update(token, id, data);
      setInstitutions(prev => prev.map(inst => 
        inst.id === id ? updatedInstitution : inst
      ));
      return true;
    } catch (err) {
      setError('Erreur lors de la modification de l\'institution');
      console.error('Error updating institution:', err);
      return false;
    }
  };

  const deleteInstitution = async (id: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      setError(null);
      await institutionService.delete(token, id);
      setInstitutions(prev => prev.filter(inst => inst.id !== id));
      return true;
    } catch (err) {
      setError('Erreur lors de la suppression de l\'institution');
      console.error('Error deleting institution:', err);
      return false;
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, [token]);

  return {
    institutions,
    loading,
    error,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    refreshInstitutions: loadInstitutions
  };
};

export default useInstitutions;