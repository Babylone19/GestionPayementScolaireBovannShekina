import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { scanCard } from '../../api/cards';
import ScanResultComponent from '../../components/ScanResult';

const ScanCard: React.FC = () => {
  const [qrData, setQrData] = useState<string>('');
  const [result, setResult] = useState<{ success: boolean; message: string; studentName?: string; institution?: string } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (!token) {
        navigate('/');
        return;
      }
      const scanResult = await scanCard(token, qrData);
      setResult(scanResult);
    } catch (error) {
      console.error('Erreur lors du scan de la carte:', error);
      setResult({ success: false, message: 'Erreur lors du scan.' });
    }
  };

  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Scan de Carte d'Accès</h1>
        <button
          onClick={() => navigate('/guard/dashboard')}
          className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none"
        >
          Retour
        </button>
      </div>
      <form onSubmit={handleSubmit} className="bg-primary p-4 rounded-lg shadow-md max-w-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="qrData">
            Données QR Code
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="qrData"
            rows={4}
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            placeholder='Exemple: {"paymentId":"...","studentId":"...","validFrom":"...","validUntil":"...","amount":2000}'
          />
        </div>
        <button
          type="submit"
          className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none"
        >
          Scanner
        </button>
        {result && (
          <div className="mt-4">
            <ScanResultComponent result={result} />
          </div>
        )}
      </form>
    </div>
  );
};

export default ScanCard;
