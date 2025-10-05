import axios from 'axios';
import { Student, CreateStudentDto, UpdateStudentDto, StudentsResponse } from '../types/student';
import { API_CONFIG } from '../config/apiConfig';

export const studentService = {
  getAll: async (token: string, page = 1, limit = 10, filters = {}): Promise<Student[]> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });
    
    const response = await axios.get(`${API_CONFIG.STUDENTS}?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    return response.data.data || response.data;
  },

  search: async (token: string, query: string): Promise<Student[]> => {
    const response = await axios.get(`${API_CONFIG.STUDENTS}/search?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  getById: async (token: string, id: string): Promise<Student> => {
    const response = await axios.get(`${API_CONFIG.STUDENTS}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  create: async (token: string, data: CreateStudentDto): Promise<Student> => {
    console.log('Envoi des données de création étudiant:', data);
    
    // Validation des données requises
    if (!data.institutionId) {
      throw new Error('institutionId est requis');
    }

    const response = await axios.post(API_CONFIG.STUDENTS, data, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Réponse création étudiant:', response.data);
    return response.data.data || response.data;
  },

  update: async (token: string, id: string, data: UpdateStudentDto): Promise<Student> => {
    const response = await axios.put(`${API_CONFIG.STUDENTS}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  delete: async (token: string, id: string): Promise<void> => {
    await axios.delete(`${API_CONFIG.STUDENTS}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  getPaymentStatus: async (token: string, id: string): Promise<any> => {
    const response = await axios.get(`${API_CONFIG.STUDENTS}/${id}/payment-status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data || response.data;
  },

  generateRegistrationForm: async (token: string, id: string): Promise<Blob> => {
    const response = await axios.get(`${API_CONFIG.STUDENTS}/${id}/registration-form`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response.data;
  },

  generateStudentCard: async (token: string, id: string): Promise<Blob> => {
    const response = await axios.get(`${API_CONFIG.STUDENTS}/${id}/student-card`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response.data;
  }
};

// Export des fonctions individuelles
export const getStudents = studentService.getAll;
export const searchStudents = studentService.search;
export const getStudentById = studentService.getById;
export const createStudent = studentService.create;
export const updateStudent = studentService.update;
export const deleteStudent = studentService.delete;
export const getStudentPaymentStatus = studentService.getPaymentStatus;