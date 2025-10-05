import React, { useState, useEffect } from 'react';
import { getStudents } from '../../api/students';
import { getToken } from '../../utils/auth';
import { Student } from '../../types/student';
import { Payment, PaymentStatus, CreatePaymentDto } from '../../types/payment';
import { useNavigate } from 'react-router-dom';
import API_CONFIG from '../../config/apiConfig';
import { extractStudentsFromResponse, getInstitutionName } from '../../utils/helpers';
import { usePaymentTypes } from '../../hooks/usePaymentTypes';
import { PaymentType } from '../../types/paymentType';

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
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [showStudentList, setShowStudentList] = useState<boolean>(true);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Utiliser le hook pour les types de paiement
  const { paymentTypes, loading: paymentTypesLoading } = usePaymentTypes(
    selectedStudent?.institutionId
  );

  const generateReference = () => {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  useEffect(() => {
    setReference(generateReference());
  }, []);

  // Filtrer les types de paiement actifs
  const activePaymentTypes = paymentTypes.filter(pt => pt.isActive);

  // Mettre à jour le montant quand un type de paiement est sélectionné
  useEffect(() => {
    if (selectedPaymentType) {
      const selectedType = activePaymentTypes.find(pt => pt.id === selectedPaymentType);
      if (selectedType && selectedType.amount) {
        setAmount(selectedType.amount);
      }
    }
  }, [selectedPaymentType, activePaymentTypes]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate("/");
          return;
        }
        setLoading(true);
        const studentsResponse = await getStudents(token);
        const studentsList = extractStudentsFromResponse(studentsResponse);
        setStudents(studentsList);
        setFilteredStudents(studentsList);
      } catch (err) {
        console.error("Erreur detaillee:", err);
        if (err instanceof Error) {
          setError(`Erreur lors de la recuperation des etudiants: ${err.message}`);
        } else {
          setError('Erreur lors de la recuperation des etudiants.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [navigate]);

  const getUniqueInstitutions = (): string[] => {
    const institutionsSet = new Set<string>();
    students.forEach(student => {
      const institutionName = getInstitutionName(student.institution);
      institutionsSet.add(institutionName);
    });
    return ['all', ...Array.from(institutionsSet)];
  };

  const institutions = getUniqueInstitutions();

  useEffect(() => {
    let filtered = students;

    if (selectedInstitution !== 'all') {
      filtered = filtered.filter(student => {
        const studentInstitution = getInstitutionName(student.institution);
        return studentInstitution === selectedInstitution;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter(student =>
        `${student.lastName} ${student.firstName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getInstitutionName(student.institution).toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    
    console.log("Etudiant selectionne:", student);
    console.log("ID etudiant:", student.id);
    console.log("Institution etudiant:", student.institutionId);

    setSelectedStudent(student);
    setShowStudentList(false);
    // Réinitialiser le formulaire de paiement
    setSelectedPaymentType('');
    setAmount(0);
    setDetails('');
    setReference(generateReference());
    setQrCodeUrl(null); // Réinitialiser le QR code
    setError(null); // CORRECTION : Réinitialiser les erreurs
    setSuccess(null); // CORRECTION : Réinitialiser les messages de succès
    
    try {
      const response = await fetch(`${API_CONFIG.PAYMENTS}?studentId=${student.id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur reponse paiements:", errorText);
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorText;
        } catch {
          errorMessage = errorText || `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Donnees paiements recus:", data); // DEBUG
      
      if (data.success) {
        // CORRECTION : Vérifier si data.payments existe, sinon utiliser data.data.payments
        const paymentsData = data.payments || data.data?.payments || [];
        setPayments(paymentsData);
        
        if (paymentsData.length === 0) {
          console.log("Aucun paiement trouve pour cet etudiant");
        }
      } else {
        throw new Error(data.message || 'Erreur lors de la recuperation des paiements.');
      }
    } catch (err) {
      console.error("Erreur detaillee:", err);
      if (err instanceof Error) {
        setError(`Erreur lors de la recuperation des paiements: ${err.message}`);
      } else {
        setError('Erreur lors de la recuperation des paiements.');
      }
    }
  };

  const validatePayment = () => {
    if (amount <= 0) {
      setError('Le montant doit etre superieur a 0');
      return false;
    }

    if (!selectedStudent) {
      setError('Aucun etudiant selectionne');
      return false;
    }

    if (!selectedStudent.id) {
      setError('ID etudiant invalide');
      return false;
    }

    if (!selectedPaymentType) {
      setError('Veuillez selectionner un type de paiement');
      return false;
    }

    // Validation des dates
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Réinitialiser l'heure à minuit

    const fromDate = new Date(validFrom);
    fromDate.setHours(0, 0, 0, 0);

    const untilDate = new Date(validUntil);
    untilDate.setHours(23, 59, 59, 999); // Fin de journée

    if (fromDate < today) {
      setError("La date de début ne peut pas être dans le passé");
      return false;
    }

    if (untilDate <= fromDate) {
      setError("La date de fin doit être après la date de début");
      return false;
    }

    setError(null);
    return true;
  };

  const handleCreatePaymentClick = () => {
    setSuccess(null);

    if (!validatePayment()) return;

    setShowConfirmation(true);
  };

  const confirmCreatePayment = async () => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }
    
    if (!selectedStudent || !selectedStudent.id) {
      setError("Aucun etudiant selectionne ou ID etudiant manquant");
      return;
    }

    if (!selectedPaymentType) {
      setError("Type de paiement non selectionne");
      return;
    }

    setLoading(true);
    setError(null);
    setShowConfirmation(false);

    // DEBUG: Afficher les IDs pour le debug
    console.log("DEBUG IDs:", {
      studentId: selectedStudent.id,
      studentInstitutionId: selectedStudent.institutionId,
      selectedPaymentType: selectedPaymentType
    });

    // CORRECTION : Préparation des dates pour éviter les problèmes de fuseau horaire
    const fromDate = new Date(validFrom);
    fromDate.setHours(0, 0, 0, 0); // Début de journée

    const untilDate = new Date(validUntil);
    untilDate.setHours(23, 59, 59, 999); // Fin de journée

    console.log("DEBUG Dates corrigées:", {
      validFrom,
      validUntil,
      fromDate: fromDate.toISOString(),
      untilDate: untilDate.toISOString()
    });

    // CORRECTION : Vérifier que l'institutionId de l'étudiant est valide
    if (!selectedStudent.institutionId) {
      setError("L'étudiant n'a pas d'institution associée");
      setLoading(false);
      return;
    }

    // Données de paiement complètes avec paymentTypeId et institutionId
    const paymentData = {
      studentId: selectedStudent.id,
      amount: amount,
      currency,
      reference,
      details: details || `Paiement pour ${selectedStudent.firstName} ${selectedStudent.lastName}`,
      validFrom: fromDate.toISOString(),
      validUntil: untilDate.toISOString(),
      paymentTypeId: selectedPaymentType,
      institutionId: selectedStudent.institutionId
    };

    console.log("Donnees de paiement envoyees:", paymentData);
    console.log("Type de validFrom:", typeof paymentData.validFrom);
    console.log("Type de validUntil:", typeof paymentData.validUntil);

    try {
      const response = await fetch(API_CONFIG.PAYMENTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      console.log("Reponse status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur reponse texte:", errorText);
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorText;
        } catch {
          errorMessage = errorText || `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Donnees reponse completes:", data);
      console.log("Structure data:", {
        success: data.success,
        hasData: !!data.data,
        hasAccessCard: data.data?.accessCard ? 'OUI' : 'NON',
        hasQrData: data.data?.accessCard?.qrData ? 'OUI' : 'NON'
      });

      if (data.success) {
        // CORRECTION : Le payment est dans data.data.payment
        const newPayment = {
          ...data.data.payment, // Changé de data.payment à data.data.payment
          currency: currency,
          reference: reference,
          details: details,
        };

        setPayments(prevPayments => [...prevPayments, newPayment]);

        // CORRECTION : Accéder correctement au QR code via data.data.accessCard
        let qrCodeData = null;
        
        // Vérifier d'abord si data.data.accessCard existe
        if (data.data && data.data.accessCard && data.data.accessCard.qrData) {
          const qrData = data.data.accessCard.qrData;
          console.log("QR Data reçu:", qrData.substring(0, 100) + "...");
          
          if (qrData.startsWith('data:image')) {
            qrCodeData = qrData;
          } else if (qrData.startsWith('http')) {
            qrCodeData = qrData;
          } else {
            // Supposer que c'est du base64 sans le prefixe
            qrCodeData = `data:image/png;base64,${qrData}`;
          }
          
          setQrCodeUrl(qrCodeData);
          console.log("QR Code configuré avec succès");
        } else {
          console.log("DEBUG - Pas de QR code trouvé:", {
            hasData: !!data.data,
            hasAccessCard: data.data?.accessCard ? 'OUI' : 'NON',
            hasQrData: data.data?.accessCard?.qrData ? 'OUI' : 'NON',
            dataKeys: data.data ? Object.keys(data.data) : 'none',
            accessCardKeys: data.data?.accessCard ? Object.keys(data.data.accessCard) : 'none'
          });
          setQrCodeUrl(null);
        }

        setSuccess(`Paiement de ${amount.toLocaleString()} ${currency} enregistre avec succes !`);
        
        // Réinitialiser le formulaire
        setAmount(0);
        setDetails('');
        setSelectedPaymentType('');
        setReference(generateReference());
        setValidFrom(new Date().toISOString().split('T')[0]);
        setValidUntil(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
      } else {
        throw new Error(data.message || 'Erreur lors de l\'enregistrement du paiement.');
      }
    } catch (err) {
      console.error("Erreur complete:", err);
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
        console.error("Erreur serveur detaillee:", errorText);
        throw new Error('Erreur interne du serveur. Veuillez reessayer plus tard.');
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
        setSuccess(`Paiement mis a jour avec succes ! Nouveau statut: ${getStatusText(data.payment.status)}`);
      } else {
        throw new Error(data.message || 'Erreur lors de la mise a jour du statut du paiement.');
      }
    } catch (err) {
      console.error("Erreur detaillee:", err);
      if (err instanceof Error) {
        setError(`Erreur lors de la mise a jour du statut du paiement: ${err.message}`);
      } else {
        setError('Erreur lors de la mise a jour du statut du paiement.');
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
    setSelectedPaymentType('');
    setError(null); // CORRECTION : Réinitialiser les erreurs
    setSuccess(null); // CORRECTION : Réinitialiser les messages de succès
  };

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // CORRECTION : Gestion des valeurs undefined
  const getStatusColor = (status: PaymentStatus | string | undefined): string => {
    const statusValue = status || 'PENDING';
    switch (statusValue) {
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

  // CORRECTION : Gestion des valeurs undefined
  const getStatusText = (status: PaymentStatus | string | undefined): string => {
    const statusValue = status || 'PENDING';
    switch (statusValue) {
      case 'VALID':
        return 'Valide';
      case 'PENDING':
        return 'En attente';
      case 'EXPIRED':
        return 'Expire';
      default:
        return statusValue;
    }
  };

  const totalValidAmount = payments
    .filter(payment => payment.status === 'VALID')
    .reduce((sum, payment) => sum + (payment.amount || 0), 0);

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-800 text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-6">
      <header className="bg-white shadow-md p-4 flex justify-between items-center mb-6 rounded-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToDashboard}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            ← Retour au Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Paiements</h1>
        </div>
      </header>

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

      <main className="flex-1">
        {showStudentList ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">Rechercher et Filtrer les Etudiants</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrer par Institution
                  </label>
                  <select
                    value={selectedInstitution}
                    onChange={(e) => setSelectedInstitution(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {institutions.map((institution) => (
                      <option key={institution} value={institution}>
                        {institution === 'all' ? 'Toutes les institutions' : institution}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recherche (Nom, Institution, Email)
                  </label>
                  <input
                    type="text"
                    placeholder="Rechercher un etudiant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  {filteredStudents.length} etudiant(s) trouve(s)
                  {selectedInstitution !== 'all' && ` dans ${selectedInstitution}`}
                  {searchTerm && ` pour "${searchTerm}"`}
                </span>
                {(selectedInstitution !== 'all' || searchTerm) && (
                  <button
                    onClick={() => {
                      setSelectedInstitution('all');
                      setSearchTerm('');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Reinitialiser les filtres
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">
                Liste des Etudiants {selectedInstitution !== 'all' ? `- ${selectedInstitution}` : ''}
              </h3>

              {filteredStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => loadStudentPayments(student)}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <h4 className="font-semibold text-gray-800">
                        {student.lastName} {student.firstName}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Institution:</strong> {getInstitutionName(student.institution)}
                      </p>
                      {student.email && (
                        <p className="text-sm text-gray-500 mt-1">
                          <strong>Email:</strong> {student.email}
                        </p>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        Cliquer pour gerer les paiements
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">
                    Aucun etudiant trouve avec les criteres actuels.
                  </p>
                  {(selectedInstitution !== 'all' || searchTerm) && (
                    <button
                      onClick={() => {
                        setSelectedInstitution('all');
                        setSearchTerm('');
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Reinitialiser les filtres
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
                  ← Retour a la liste
                </button>
                <h3 className="text-xl font-semibold">Paiements pour {selectedStudent.lastName} {selectedStudent.firstName}</h3>
                <div></div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Resume des paiements</h4>
                <p className="text-blue-700">
                  <strong>Montant total valide:</strong> {totalValidAmount.toLocaleString()} {currency}
                </p>
                <p className="text-blue-700">
                  <strong>Institution:</strong> {getInstitutionName(selectedStudent.institution)}
                </p>
              </div>

              <div className="space-y-4 mb-6 bg-white p-4 rounded-lg shadow border border-gray-200">
                <h4 className="font-semibold">Nouveau Paiement</h4>
                
                {paymentTypesLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Chargement des types de paiement...</p>
                  </div>
                ) : activePaymentTypes.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800 text-sm">
                      Aucun type de paiement actif disponible pour cette institution.
                      Veuillez contacter l'administrateur.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type de paiement *</label>
                        <select
                          value={selectedPaymentType}
                          onChange={(e) => setSelectedPaymentType(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          required
                        >
                          <option value="">Sélectionner un type de paiement</option>
                          {activePaymentTypes.map((paymentType) => (
                            <option key={paymentType.id} value={paymentType.id}>
                              {paymentType.name} {paymentType.amount ? `- ${paymentType.amount.toLocaleString()} ${currency}` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Montant ({currency})</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          min="0"
                          disabled={selectedPaymentType !== ''}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedPaymentType ? 
                            'Montant prédéfini par le type de paiement' : 
                            'Sélectionnez un type de paiement ou saisissez un montant'
                          }
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Devise</label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        >
                          <option value="XOF">XOF</option>
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Reference</label>
                        <input
                          type="text"
                          value={reference}
                          readOnly
                          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 border"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Details</label>
                        <input
                          type="text"
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          placeholder="Details du paiement"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Valide a partir de</label>
                        <input
                          type="date"
                          value={validFrom}
                          onChange={(e) => setValidFrom(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          min={new Date().toISOString().split('T')[0]} // Empêcher la sélection de dates passées
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Valide jusqu'a</label>
                        <input
                          type="date"
                          value={validUntil}
                          onChange={(e) => setValidUntil(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                          min={validFrom} // La date de fin ne peut pas être avant la date de début
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCreatePaymentClick}
                      disabled={loading || amount <= 0 || !selectedPaymentType}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                    >
                      {loading ? 'Enregistrement...' : `Ajouter ${amount.toLocaleString()} ${currency}`}
                    </button>
                  </>
                )}
              </div>

              {qrCodeUrl && (
                <div className="mt-6 bg-white p-4 rounded-lg shadow border border-gray-200">
                  <h4 className="font-semibold mb-2">QR Code d'Acces</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Ce QR code contient les informations cumulees de tous les paiements valides.
                    Il sera scanne pour verifier l'acces de l'etudiant.
                  </p>
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 border border-gray-300 mx-auto" />
                  <div className="mt-4 text-center">
                    <button
                      onClick={downloadQrCode}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      Telecharger le QR Code
                    </button>
                  </div>
                </div>
              )}

              <h4 className="font-semibold mt-6 mb-2">Historique des Paiements</h4>
              {payments.length > 0 ? (
                <div className="space-y-2">
                  {payments.map((payment) => {
                    // Trouver le type de paiement correspondant
                    const paymentType = paymentTypes.find(pt => pt.id === payment.paymentTypeId);
                    
                    return (
                      <div
                        key={payment.id}
                        className="p-4 bg-white rounded-lg shadow flex justify-between items-center border border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <strong>{(payment.amount || 0).toLocaleString()} {payment.currency || currency}</strong>
                              <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(payment.status)}`}>
                                {getStatusText(payment.status)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              Ref: {payment.reference || 'N/A'}
                            </div>
                          </div>
                          
                          {/* AFFICHAGE DU TYPE DE FRAIS */}
                          {paymentType && (
                            <p className="text-sm text-gray-700 mt-1">
                              <strong>Type de frais:</strong> {paymentType.name}
                              {paymentType.amount && ` (${paymentType.amount.toLocaleString()} ${currency})`}
                            </p>
                          )}
                          
                          {payment.details && (
                            <p className="text-sm text-gray-600 mt-1">{payment.details}</p>
                          )}
                          <div className="text-sm text-gray-500 mt-1">
                            {payment.validFrom && `Valide du: ${formatDate(payment.validFrom)} au: ${formatDate(payment.validUntil)}`}
                          </div>
                        </div>
                        <div className="ml-4">
                          {(payment.status === 'PENDING') && (
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
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">Aucun paiement trouve pour cet etudiant.</p>
              )}
            </div>
          )
        )}
      </main>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmer l'ajout du paiement
            </h3>
            <p className="text-gray-600 mb-4">
              Etes-vous sur de vouloir ajouter un paiement de{' '}
              <strong>{amount.toLocaleString()} ${currency}</strong> pour{' '}
              <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong> ?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Montant total apres cet ajout :</strong>{' '}
                {(totalValidAmount + amount).toLocaleString()} ${currency}
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
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:bg-gray-400 w-full sm:w-auto"
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