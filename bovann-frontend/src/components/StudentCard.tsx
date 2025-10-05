import React from 'react';
import { Student } from '../types/student';
import { FaUserGraduate, FaPhone, FaEnvelope, FaUniversity, FaGraduationCap } from 'react-icons/fa';

interface StudentCardProps {
  student: Student;
  onViewDetails?: (student: Student) => void;
  onEdit?: (student: Student) => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ student, onViewDetails, onEdit }) => {
  
  const getInstitutionName = (): string => {
    if (typeof student.institution === 'string') {
      return student.institution;
    }
    // Vérifier si c'est un objet avec une propriété name
    if (student.institution && typeof student.institution === 'object') {
      return (student.institution as any).name || 'Non assigné';
    }
    return 'Non assigné';
  };

  const getProgramName = (): string => {
    if (typeof student.program === 'string') {
      return student.program;
    }
    // Vérifier si c'est un objet avec une propriété name
    if (student.program && typeof student.program === 'object') {
      return (student.program as any).name || 'Non assigné';
    }
    return 'Non assigné';
  };

  const getInstitutionBadgeClass = (institution: any): string => {
    // Convertir en string pour éviter l'erreur
    let institutionStr = '';
    
    if (typeof institution === 'string') {
      institutionStr = institution;
    } else if (institution && typeof institution === 'object') {
      institutionStr = (institution as any).name || '';
    }

    if (!institutionStr) return 'bg-gray-100 text-gray-800';
    
    if (institutionStr.includes('BOVANN') || institutionStr.includes('bovann')) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <FaUserGraduate className="text-blue-600 text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {student.lastName} {student.firstName}
            </h3>
            <p className="text-sm text-gray-600 capitalize">{student.profession?.toLowerCase() || 'Non spécifié'}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(student)}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
              title="Voir détails"
            >
              <FaUserGraduate className="text-sm" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(student)}
              className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors"
              title="Modifier"
            >
              <FaGraduationCap className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <FaPhone className="mr-2 text-gray-400" />
          <span>{student.phone}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <FaEnvelope className="mr-2 text-gray-400" />
          <span>{student.email}</span>
        </div>
      </div>

      {/* Institution & Program */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <FaUniversity className="mr-2 text-gray-400" />
            <span>Institution</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getInstitutionBadgeClass(student.institution)}`}>
            {getInstitutionName()}
          </span>
        </div>
        
        {student.programId && (
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <FaGraduationCap className="mr-2 text-gray-400" />
              <span>Programme</span>
            </div>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              {getProgramName()}
            </span>
          </div>
        )}
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span className="capitalize">{student.studyLevel?.toLowerCase() || 'Non spécifié'}</span>
          <span className="capitalize">{student.domain?.toLowerCase().replace(/_/g, ' ') || 'Non spécifié'}</span>
        </div>
        {student.createdAt && (
          <div className="mt-2 text-xs text-gray-400">
            Inscrit le {new Date(student.createdAt).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCard;