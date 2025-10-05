import { Student, Institution, Payment } from '../types';

export const getInstitutionName = (institution: any): string => {
  if (!institution) return 'Non spécifiée';
  if (typeof institution === 'string') return institution;
  if (institution && typeof institution === 'object') {
    if (institution.name) return institution.name;
    if (institution.nom) return institution.nom; // en français
    if (institution.title) return institution.title;
    if (institution.id) return `Institution ${institution.id}`;
  }
  return 'Non spécifiée';
};

export const extractStudentsFromResponse = (response: any): Student[] => {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.students)) return response.students;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
};

export const extractPaymentsFromResponse = (response: any): Payment[] => {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.payments)) return response.payments;
  if (response && Array.isArray(response.data)) return response.data;
  return [];
};

export const getInstitutionBadge = (institution: any): string => {
  const name = getInstitutionName(institution);
  switch (name) {
    case 'BOVANN GROUP ':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'SHEKINA':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};