import React from 'react';
import { Program } from '../types/program';

interface ProgramCardProps {
  program: Program;
  onEdit: (program: Program) => void;
  onDelete: (program: Program) => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({
  program,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {program.name}
          </h3>
          {program.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {program.description}
            </p>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(program)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(program)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="space-y-1">
          {program.duration && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{program.duration}</span>
            </div>
          )}
          
          {program.institution?.name && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{program.institution.name}</span>
            </div>
          )}
        </div>

        {program.price && program.price > 0 && (
          <div className="text-right">
            <div className="text-lg font-semibold text-green-600">
              {program.price.toLocaleString('fr-FR')} FCFA
            </div>
            <div className="text-xs text-gray-400">Frais de scolarité</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramCard;