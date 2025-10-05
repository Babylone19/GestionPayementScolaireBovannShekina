import { useState, useEffect } from 'react';
import { getToken } from '../utils/auth';
import { studentService } from '../api/students';
import { Student } from '../types/student';

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const token = getToken();
        if (!token) {
          setError('Token non trouvé');
          return;
        }

        const studentsData = await studentService.getAll(token);
        setStudents(studentsData);
      } catch (err) {
        console.error('Erreur lors du chargement des étudiants:', err);
        setError('Erreur lors du chargement des étudiants');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const createStudent = async (studentData: any): Promise<Student> => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Token non trouvé');
      }

      const newStudent = await studentService.create(token, studentData);
      setStudents(prev => [...prev, newStudent]);
      return newStudent;
    } catch (err) {
      console.error('Erreur lors de la création de l\'étudiant:', err);
      throw err;
    }
  };

  return {
    students,
    loading,
    error,
    createStudent,
    refetch: () => {
      setLoading(true);
      // Réimplémentez la logique de fetchStudents si nécessaire
    }
  };
};

export default useStudents;