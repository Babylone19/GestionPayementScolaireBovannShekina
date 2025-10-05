import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { scanCard, ScanCardDto } from '../../api/cards';
import { FaQrcode, FaCheck, FaTimes, FaUser } from 'react-icons/fa';

const ScanCard: React.FC = () => {
  const [qrData, setQrData] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = getToken();

  const handleScan = async (data: string) => {
    try {
      if (!token) {
        setError('Non authentifié');
        return;
      }
      
      setLoading(true);
      setError(null);
      setResult(null);

      const scanData: ScanCardDto = { 
        studentId: data, 
        guardianId: 'guard-user-id', // À remplacer par l'ID réel du gardien
        location: 'Entrée principale' 
      };
      
      const scanResult = await scanCard(token, scanData);
      setResult(scanResult);
    } catch (error) {
      console.error('Erreur lors du scan de la carte:', error);
      setError('Erreur lors du scan de la carte');
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = () => {
    if (qrData.trim()) {
      handleScan(qrData.trim());
    }
  };

  const resetScan = () => {
    setQrData('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scan de Carte</h1>
              <p className="text-gray-600 mt-1">Scanner une carte d'accès étudiant</p>
            </div>
            <button
              onClick={() => navigate('/guard/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Retour
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaQrcode className="mr-2 text-blue-500" />
              Scanner une carte
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Données QR Code
                </label>
                <textarea
                  placeholder="Scannez le QR code ou entrez manuellement l'ID étudiant..."
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleManualInput}
                  disabled={loading || !qrData.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FaQrcode className="mr-2" />
                      Vérifier l'accès
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetScan}
                  className="bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Résultat du scan</h2>
            
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Vérification en cours...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaTimes className="text-red-500 mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {result && (
              <div className={`p-4 rounded-lg ${
                result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center mb-3">
                  {result.success ? (
                    <FaCheck className="text-green-500 text-xl mr-2" />
                  ) : (
                    <FaTimes className="text-red-500 text-xl mr-2" />
                  )}
                  <span className={`font-semibold ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? 'Accès Autorisé' : 'Accès Refusé'}
                  </span>
                </div>

                {result.student && (
                  <div className="bg-white rounded p-3 border">
                    <div className="flex items-center mb-2">
                      <FaUser className="text-gray-400 mr-2" />
                      <span className="font-medium">
                        {result.student.firstName} {result.student.lastName}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Téléphone: {result.student.phone}</div>
                      <div>Institution: {result.student.institution}</div>
                      {result.scan && (
                        <div className="text-xs text-gray-500 mt-2">
                          Scanné à: {new Date(result.scan.scannedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.message && (
                  <p className={`text-sm mt-2 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>
                )}
              </div>
            )}

            {!loading && !error && !result && (
              <div className="text-center py-8 text-gray-500">
                <FaQrcode className="text-4xl mx-auto mb-4 text-gray-300" />
                <p>En attente du scan...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanCard;