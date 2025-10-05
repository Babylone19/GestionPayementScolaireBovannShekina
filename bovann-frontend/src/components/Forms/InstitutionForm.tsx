import React, { useState, useEffect } from 'react';
import { Institution, InstitutionFormData } from '../../types/institution';
import { Program } from '../../types/program';

interface InstitutionFormProps {
  institution?: Institution;
  onSubmit: (data: InstitutionFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
  availablePrograms: Program[];
}

const InstitutionForm: React.FC<InstitutionFormProps> = ({
  institution,
  onSubmit,
  onCancel,
  loading = false,
  availablePrograms
}) => {
  const [formData, setFormData] = useState<InstitutionFormData>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    logo: '',
    programIds: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showProgramModal, setShowProgramModal] = useState(false);

  useEffect(() => {
    if (institution) {
      setFormData({
        name: institution.name || '',
        description: institution.description || '',
        address: institution.address || '',
        phone: institution.phone || '',
        email: institution.email || '',
        logo: institution.logo || '',
        programIds: []
      });
    }
  }, [institution]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const success = await onSubmit(formData);
    if (success) {
      onCancel();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleProgramSelection = (programId: string, isSelected: boolean) => {
    setFormData(prev => ({
      ...prev,
      programIds: isSelected 
        ? [...prev.programIds, programId]
        : prev.programIds.filter(id => id !== programId)
    }));
  };

  const selectedPrograms = availablePrograms.filter(program => 
    formData.programIds.includes(program.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nom de l'institution *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          placeholder="Nom de l'établissement"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Description de l'institution"
        />
      </div>

      {/* Section Programmes */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Programmes associés
          </label>
          <button
            type="button"
            onClick={() => setShowProgramModal(true)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Créer un nouveau programme
          </button>
        </div>

        {availablePrograms.length === 0 ? (
          <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 text-sm">Aucun programme disponible</p>
            <button
              type="button"
              onClick={() => setShowProgramModal(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
            >
              Créer le premier programme
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {availablePrograms.map((program) => (
              <div key={program.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  id={`program-${program.id}`}
                  checked={formData.programIds.includes(program.id)}
                  onChange={(e) => handleProgramSelection(program.id, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`program-${program.id}`} className="flex-1 cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">{program.name}</span>
                    {program.price && program.price > 0 && (
                      <span className="text-green-600 text-sm">
                        {program.price.toLocaleString('fr-FR')} FCFA
                      </span>
                    )}
                  </div>
                  {program.description && (
                    <p className="text-sm text-gray-500 mt-1">{program.description}</p>
                  )}
                </label>
              </div>
            ))}
          </div>
        )}

        {selectedPrograms.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Programmes sélectionnés :</h4>
            <div className="flex flex-wrap gap-2">
              {selectedPrograms.map(program => (
                <span
                  key={program.id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {program.name}
                  <button
                    type="button"
                    onClick={() => handleProgramSelection(program.id, false)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Adresse
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Adresse complète"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Téléphone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="+225 01 23 45 67 89"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
            placeholder="contact@institution.ci"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
          Logo URL
        </label>
        <input
          type="url"
          id="logo"
          name="logo"
          value={formData.logo}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="https://example.com/logo.png"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Enregistrement...' : institution ? 'Modifier' : 'Créer'}
        </button>
      </div>

      {showProgramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Créer un nouveau programme</h3>
            <p className="text-gray-600 mb-4">
              Redirection vers la page de création de programme...
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowProgramModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/admin/programs?create=new';
                  setShowProgramModal(false);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
              >
                Créer Programme
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default InstitutionForm;