import { useState, useEffect } from 'react';
import { programService } from '../api/programs';
import { useAuth } from './useAuth';
import { Program, CreateProgramDto, UpdateProgramDto } from '../types/program';

export const usePrograms = (institutionId?: string) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const loadPrograms = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (institutionId) {
        console.log('Chargement des programmes pour institution:', institutionId);
        const data = await programService.getByInstitution(token, institutionId);
        setPrograms(data);
      } else {
        // NE PAS charger tous les programmes avec un institutionId vide
        // Cette fonctionnalité n'est pas supportée par le backend
        console.log('Aucun institutionId fourni, annulation du chargement des programmes');
        setAllPrograms([]);
      }
    } catch (err) {
      setError('Erreur lors du chargement des programmes');
      console.error('Error loading programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProgram = async (data: CreateProgramDto): Promise<boolean> => {
    if (!token || !data.institutionId) return false;
    
    try {
      setError(null);
      const newProgram = await programService.create(token, data.institutionId, data);
      setPrograms(prev => [...prev, newProgram]);
      setAllPrograms(prev => [...prev, newProgram]);
      return true;
    } catch (err) {
      setError('Erreur lors de la création du programme');
      console.error('Error creating program:', err);
      return false;
    }
  };

  const updateProgram = async (id: string, data: UpdateProgramDto): Promise<boolean> => {
    if (!token) return false;
    
    try {
      setError(null);
      await loadPrograms(); // Recharger la liste
      return true;
    } catch (err) {
      setError('Erreur lors de la modification du programme');
      console.error('Error updating program:', err);
      return false;
    }
  };

  const deleteProgram = async (id: string): Promise<boolean> => {
    if (!token) return false;
    
    try {
      setError(null);
      setPrograms(prev => prev.filter(program => program.id !== id));
      setAllPrograms(prev => prev.filter(program => program.id !== id));
      return true;
    } catch (err) {
      setError('Erreur lors de la suppression du programme');
      console.error('Error deleting program:', err);
      return false;
    }
  };

  useEffect(() => {
    loadPrograms();
  }, [token, institutionId]);

  return {
    programs,
    allPrograms,
    loading,
    error,
    createProgram,
    updateProgram,
    deleteProgram,
    refreshPrograms: loadPrograms
  };
};

export default usePrograms;