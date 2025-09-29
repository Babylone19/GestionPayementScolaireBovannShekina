import React from 'react';
import { ScanResult } from '../types/card';

interface ScanResultProps {
  result: ScanResult;
}

const ScanResultComponent: React.FC<ScanResultProps> = ({ result }) => {
  return (
    <div className={`p-4 rounded-md ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      <h3 className="font-bold">{result.success ? 'Accès autorisé' : 'Accès refusé'}</h3>
      <p>{result.message}</p>
      {result.studentName && <p>Étudiant: {result.studentName}</p>}
      {result.institution && <p>Établissement: {result.institution}</p>}
    </div>
  );
};

export default ScanResultComponent;
