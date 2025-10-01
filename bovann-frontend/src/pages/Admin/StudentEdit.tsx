import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const StudentEdit: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Modifier l'Étudiant</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Page de modification d'étudiant en construction...</p>
          <button 
            onClick={() => navigate('/admin/students/list')}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentEdit;