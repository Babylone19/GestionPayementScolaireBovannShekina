// components/StudentHistoryRedirect.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

const StudentHistoryRedirect: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    if (!studentId) {
      setError('ID étudiant manquant');
      return;
    }

    const getBackendUrl = () => {
      // En développement
      if (process.env.NODE_ENV === 'development') {
        return process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
      }
      // En production, utilise l'URL de votre backend
      return process.env.REACT_APP_BACKEND_URL || 'http://195.26.241.68:3000';
    };

    try {
      const backendUrl = getBackendUrl();
      window.location.href = `${backendUrl}/student-history/${studentId}`;
    } catch (err) {
      setError('Erreur lors de la redirection');
      console.error('Redirection error:', err);
    }
  }, [studentId]);

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Erreur</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h3>Chargement de l'historique de l'étudiant...</h3>
      <p>Redirection en cours...</p>
    </div>
  );
};

export default StudentHistoryRedirect;