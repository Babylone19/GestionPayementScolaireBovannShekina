import React from 'react';

interface StudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Détails Étudiant</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">Détails de l'étudiant en développement</p>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;