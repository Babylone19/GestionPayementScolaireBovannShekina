import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';

interface ScanResult {
  success: boolean;
  studentName: string;
  institution: string;
  amount?: number;
  validUntil?: string;
  message: string;
  status: 'AUTHORIZED' | 'EXPIRED' | 'REFUSED';
}

const ScanResult: React.FC = () => {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyStudent = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const studentId = searchParams.get('studentId');

        if (!studentId) {
          setError('ID étudiant manquant');
          setLoading(false);
          return;
        }

        const token = getToken();
        if (!token) {
          navigate('/');
          return;
        }

        const response = await fetch(`http://localhost:3000/api/cards/verify?studentId=${studentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la vérification');
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    verifyStudent();
  }, [location, navigate]);

  const getStatusColor = () => {
    if (!result) return 'bg-gray-100';
    
    switch (result.status) {
      case 'AUTHORIZED':
        return 'bg-green-100 border-green-500';
      case 'EXPIRED':
        return 'bg-red-100 border-red-500';
      case 'REFUSED':
        return 'bg-red-100 border-red-500';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  };

  const getStatusText = () => {
    if (!result) return '';
    
    switch (result.status) {
      case 'AUTHORIZED':
        return 'ACCES AUTORISE';
      case 'EXPIRED':
        return 'PAIEMENT EXPIRE';
      case 'REFUSED':
        return 'ACCES REFUSE';
      default:
        return 'STATUT INCONNU';
    }
  };

  const getStatusIcon = () => {
    if (!result) return '';
    
    switch (result.status) {
      case 'AUTHORIZED':
        return '✓';
      case 'EXPIRED':
        return '✗';
      case 'REFUSED':
        return '✗';
      default:
        return '?';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verification en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-6xl mb-4 text-red-500">✗</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/guard/dashboard')}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className={`w-full max-w-md p-8 rounded-lg shadow-md border-2 ${getStatusColor()} transition-all duration-300`}>
        <div className="text-center">
          <div className="text-6xl mb-4">{getStatusIcon()}</div>
          <h1 className="text-3xl font-bold mb-4">{getStatusText()}</h1>
          
          {result && (
            <div className="space-y-4 mt-6">
              <div className="bg-white p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">{result.studentName}</h2>
                <p className="text-gray-600">{result.institution}</p>
              </div>

              {result.amount && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Montant paye:</strong> {result.amount} FCFA
                  </p>
                </div>
              )}

              {result.validUntil && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Valide jusqu'au:</strong> {new Date(result.validUntil).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}

              <div className="bg-white p-4 rounded-lg">
                <p className={`font-semibold ${
                  result.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.message}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/guard/dashboard')}
            className="mt-8 bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors w-full"
          >
            Nouveau Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScanResult;