import React, { useState, useEffect } from 'react';
import { getStudents } from '../../api/students';
import { getToken } from '../../utils/auth';
import { Student } from '../../types/student';
import { Payment, PaymentStatus, CreatePaymentDto } from '../../types/payment';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../../config/apiConfig';
const PaymentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [amount, setAmount] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('XOF');
  const [reference, setReference] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [validFrom, setValidFrom] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState<string>(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  );
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // États pour le filtrage et recherche
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [showStudentList, setShowStudentList] = useState<boolean>(true);
  
  // États pour la confirmation
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Générer une référence unique
  const generateReference = () => {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    setReference(generateReference());
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate("/");
          return;
        }
        setLoading(true);
        const studentsList = await getStudents(token);
        setStudents(studentsList);
        setFilteredStudents(studentsList);
      } catch (err) {
        console.error("Erreur détaillée:", err);
        if (err instanceof Error) {
          setError(`Erreur lors de la récupération des étudiants: ${err.message}`);
        } else {
          setError('Erreur lors de la récupération des étudiants.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [navigate]);

  // Obtenir la liste des institutions uniques (version corrigée)
  const getUniqueInstitutions = (): string[] => {
    const institutionsSet = new Set<string>();
    students.forEach(student => {
      institutionsSet.add(student.institution);
    });
    return ['all', ...Array.from(institutionsSet)];
  };

  const institutions = getUniqueInstitutions();

  // Filtrer les étudiants en fonction des critères
  useEffect(() => {
    let filtered = students;

    // Filtre par institution
    if (selectedInstitution !== 'all') {
      filtered = filtered.filter(student => student.institution === selectedInstitution);
    }

    // Filtre par recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.lastName} ${student.firstName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredStudents(filtered);
  }, [searchTerm, selectedInstitution, students]);

  const loadStudentPayments = async (student: Student) => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }
    setSelectedStudent(student);
    setShowStudentList(false);
    try {
      const response = await fetch(`${API_CONFIG.PAYMENTS}?studentId=${student.id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.payments) {
        setPayments(data.payments);
      } else {
        setError('Erreur lors de la récupération des paiements.');
      }
    } catch (err) {
      console.error("Erreur détaillée:", err);
      if (err instanceof Error) {
        setError(`Erreur lors de la récupération des paiements: ${err.message}`);
      } else {
        setError('Erreur lors de la récupération des paiements.');
      }
    }
  };

  const validatePayment = () => {
    if (amount <= 0) {
      setError('Le montant doit être supérieur à 0');
      return false;
    }

    if (!selectedStudent) {
      setError('Aucun étudiant sélectionné');
      return false;
    }

    setError(null);
    return true;
  };

  const handleCreatePaymentClick = () => {
    setSuccess(null);

    if (!validatePayment()) return;

    // Afficher la confirmation au lieu d'ajouter directement
    setShowConfirmation(true);
  };

  const confirmCreatePayment = async () => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }
    if (!selectedStudent) return;

    setLoading(true);
    setError(null);
    setShowConfirmation(false);

    const paymentData: CreatePaymentDto = {
      studentId: selectedStudent.id,
      amount: amount,
      currency,
      reference,
      details: details || `Paiement pour ${selectedStudent.firstName} ${selectedStudent.lastName}`,
      validFrom,
      validUntil,
    };

    try {
      const response = await fetch(API_CONFIG.PAYMENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const newPayment = {
          ...data.payment,
          currency: currency,
          reference: reference,
          details: details,
        };

        setPayments(prevPayments => [...prevPayments, newPayment]);

        if (data.accessCard && data.accessCard.qrData) {
          setQrCodeUrl(data.accessCard.qrData);
        }

        setSuccess(`Paiement de ${amount.toLocaleString()} ${currency} enregistré avec succès !`);
        setAmount(0);
        setDetails('');
        setReference(generateReference());
      } else {
        throw new Error(data.message || 'Erreur lors de l\'enregistrement du paiement.');
      }
    } catch (err) {
      console.error("Erreur détaillée:", err);
      if (err instanceof Error) {
        setError(`Erreur lors de l'enregistrement du paiement: ${err.message}`);
      } else {
        setError('Erreur lors de l\'enregistrement du paiement.');
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelCreatePayment = () => {
    setShowConfirmation(false);
  };

  const handleUpdatePaymentStatus = async (paymentId: string, status: PaymentStatus) => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.PAYMENTS}/${paymentId}/status`,{
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.status === 500) {
        const errorText = await response.text();
        console.error("Erreur serveur détaillée:", errorText);
        throw new Error('Erreur interne du serveur. Veuillez réessayer plus tard.');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Erreur HTTP! statut: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const updatedPayments = payments.map(payment =>
          payment.id === paymentId ? { ...payment, status: data.payment.status } : payment
        );
        setPayments(updatedPayments);
        setSuccess(`Paiement mis à jour avec succès ! Nouveau statut: ${getStatusText(data.payment.status)}`);
      } else {
        throw new Error(data.message || 'Erreur lors de la mise à jour du statut du paiement.');
      }
    } catch (err) {
      console.error("Erreur détaillée:", err);
      if (err instanceof Error) {
        setError(`Erreur lors de la mise à jour du statut du paiement: ${err.message}`);
      } else {
        setError('Erreur lors de la mise à jour du statut du paiement.');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadQrCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-code-${selectedStudent?.lastName}-${selectedStudent?.firstName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/accountant/dashboard');
  };

  const handleBackToStudentList = () => {
    setShowStudentList(true);
    setSelectedStudent(null);
    setPayments([]);
    setQrCodeUrl(null);
    setAmount(0);
    setDetails('');
  };

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: PaymentStatus): string => {
    switch (status) {
      case 'VALID':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'EXPIRED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: PaymentStatus): string => {
    switch (status) {
      case 'VALID':
        return 'Validé';
      case 'PENDING':
        return 'En attente';
      case 'EXPIRED':
        return 'Expiré';
      default:
        return status;
    }
  };

  // Calcul du montant total validé
  const totalValidAmount = payments
    .filter(payment => payment.status === 'VALID')
    .reduce((sum, payment) => sum + payment.amount, 0);

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent">
        <p className="text-gray-800 text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent flex flex-col p-6">
      {/* Header avec bouton retour */}
      <header className="bg-red-600 shadow-md p-4 flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToDashboard}
            className="bg-white text-red-600 px-4 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
          >
            ← Retour au Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Gestion des Paiements</h1>
        </div>
      </header>

      {/* Messages d'alerte */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
          <button
            onClick={() => setSuccess(null)}
            className="float-right text-green-700 hover:text-green-900"
          >
            ×
          </button>
        </div>
      )}

      {/* Content */}
      <main className="flex-1">
        {showStudentList ? (
          <>
            {/* Section Filtres et Recherche */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">Rechercher et Filtrer les Étudiants</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Filtre par institution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrer par Institution
                  </label>
                  <select
                    value={selectedInstitution}
                    onChange={(e) => setSelectedInstitution(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    {institutions.map((institution) => (
                      <option key={institution} value={institution}>
                        {institution === 'all' ? 'Toutes les institutions' : institution}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recherche globale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recherche (Nom, Institution, Email)
                  </label>
                  <input
                    type="text"
                    placeholder="Rechercher un étudiant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                </div>
              </div>

              {/* Statistiques des filtres */}
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  {filteredStudents.length} étudiant(s) trouvé(s)
                  {selectedInstitution !== 'all' && ` dans ${selectedInstitution}`}
                  {searchTerm && ` pour "${searchTerm}"`}
                </span>
                {(selectedInstitution !== 'all' || searchTerm) && (
                  <button
                    onClick={() => {
                      setSelectedInstitution('all');
                      setSearchTerm('');
                    }}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>

            {/* Liste des étudiants filtrés */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">
                Liste des Étudiants {selectedInstitution !== 'all' ? `- ${selectedInstitution}` : ''}
              </h3>

              {filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => loadStudentPayments(student)}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-red-300 hover:bg-red-50 transition-colors duration-200"
                    >
                      <h4 className="font-semibold text-gray-800">
                        {student.lastName} {student.firstName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Institution:</strong> {student.institution}
                      </p>
                      {student.email && (
                        <p className="text-sm text-gray-500 mt-1">
                          <strong>Email:</strong> {student.email}
                        </p>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        Cliquer pour gérer les paiements
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">
                    Aucun étudiant trouvé avec les critères actuels.
                  </p>
                  {(selectedInstitution !== 'all' || searchTerm) && (
                    <button
                      onClick={() => {
                        setSelectedInstitution('all');
                        setSearchTerm('');
                      }}
                      className="mt-2 text-red-600 hover:text-red-800 font-medium"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          selectedStudent && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={handleBackToStudentList}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  ← Retour à la liste
                </button>
                <h3 className="text-xl font-semibold">Paiements pour {selectedStudent.lastName} {selectedStudent.firstName}</h3>
                <div></div> {/* Pour l'alignement */}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Résumé des paiements</h4>
                <p className="text-blue-700">
                  <strong>Montant total validé:</strong> {totalValidAmount.toLocaleString()} {currency}
                </p>
                <p className="text-blue-700">
                  <strong>Institution:</strong> {selectedStudent.institution}
                </p>
              </div>

              {/* Formulaire de création de paiement */}
              <div className="space-y-4 mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
                <h4 className="font-semibold">Nouveau Paiement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Montant à ajouter ({currency})</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                      min="0"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Montant total après ajout: <strong>{(totalValidAmount + amount).toLocaleString()} {currency}</strong>
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Devise</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                    >
                      <option value="XOF">XOF</option>
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Référence</label>
                    <input
                      type="text"
                      value={reference}
                      readOnly
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Détails</label>
                    <input
                      type="text"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Détails du paiement"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valide à partir de</label>
                    <input
                      type="date"
                      value={validFrom}
                      onChange={(e) => setValidFrom(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Valide jusqu'à</label>
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 p-2 border"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCreatePaymentClick}
                  disabled={loading || amount <= 0}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
                >
                  {loading ? 'Enregistrement...' : `Ajouter ${amount.toLocaleString()} ${currency}`}
                </button>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h4 className="font-semibold mb-2">QR Code d'Accès</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Ce QR code contient les informations cumulées de tous les paiements validés.
                    Il sera scanné pour vérifier l'accès de l'étudiant.
                  </p>
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 border border-gray-300 mx-auto" />
                  <div className="mt-4 text-center">
                    <button
                      onClick={downloadQrCode}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Télécharger le QR Code
                    </button>
                  </div>
                </div>
              )}

              {/* Historique des paiements */}
              <h4 className="font-semibold mt-6 mb-2">Historique des Paiements</h4>
              {payments.length > 0 ? (
                <div className="space-y-2">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 bg-white rounded-lg shadow flex justify-between items-center border border-gray-200"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <strong>{payment.amount.toLocaleString()} {payment.currency || currency}</strong>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(payment.status)}`}>
                              {getStatusText(payment.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Ref: {payment.reference}
                          </div>
                        </div>
                        {payment.details && (
                          <p className="text-sm text-gray-600 mt-1">{payment.details}</p>
                        )}
                        <div className="text-sm text-gray-500 mt-1">
                          {payment.validFrom && `Valide du: ${formatDate(payment.validFrom)} au: ${formatDate(payment.validUntil)}`}
                        </div>
                      </div>
                      <div className="ml-4">
                        {payment.status === 'PENDING' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdatePaymentStatus(payment.id, 'VALID')}
                              disabled={loading}
                              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm disabled:bg-gray-400"
                            >
                              Valider
                            </button>
                            <button
                              onClick={() => handleUpdatePaymentStatus(payment.id, 'EXPIRED')}
                              disabled={loading}
                              className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm disabled:bg-gray-400"
                            >
                              Rejeter
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Aucun paiement trouvé pour cet étudiant.</p>
              )}
            </div>
          )
        )}
      </main>

      {/* Modal de confirmation pour l'ajout de paiement */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmer l'ajout du paiement
            </h3>
            <p className="text-gray-600 mb-4">
              Êtes-vous sûr de vouloir ajouter un paiement de{' '}
              <strong>{amount.toLocaleString()} {currency}</strong> pour{' '}
              <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong> ?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Montant total après cet ajout :</strong>{' '}
                {(totalValidAmount + amount).toLocaleString()} {currency}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={cancelCreatePayment}
                className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition w-full sm:w-auto"
              >
                Annuler
              </button>
              <button
                onClick={confirmCreatePayment}
                disabled={loading}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition disabled:bg-gray-400 w-full sm:w-auto"
              >
                {loading ? 'Ajout en cours...' : 'Confirmer l\'ajout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;