import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { getPayments } from '../../api/payments';
import { Payment } from '../../types/payment';

const PaymentsByStudent: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    let filtered = payments;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === selectedStatus);
    }

    if (selectedStudent !== 'all') {
      filtered = filtered.filter(payment => 
        (payment as any).student?.id === selectedStudent
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.amount?.toString().includes(searchTerm) ||
        payment.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment as any).student?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment as any).student?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  }, [searchTerm, selectedStatus, selectedStudent, payments]);

  const students = Array.from(
    new Map(
      payments
        .filter(payment => (payment as any).student)
        .map(payment => [(payment as any).student.id, (payment as any).student])
    ).values()
  );

  const fetchPayments = async () => {
    try {
      const token = getToken();
      
      if (!token) {
        setError('Token d authentification manquant');
        navigate('/');
        return;
      }

      setLoading(true);
      setError('');
      const response = await getPayments(token);
      
      let paymentsData: Payment[] = [];
      
      if (Array.isArray(response)) {
        paymentsData = response;
      } else if (response && typeof response === 'object') {
        paymentsData = (response as any).payments || 
                      (response as any).data || 
                      [];
      }
      
      setPayments(paymentsData);
      setFilteredPayments(paymentsData);
    } catch (error) {
      console.error('Erreur lors de la recuperation des paiements:', error);
      setError('Erreur lors du chargement des paiements.');
      setPayments([]);
      setFilteredPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALID':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'VALID':
        return 'Valide';
      case 'PENDING':
        return 'En attente';
      case 'EXPIRED':
        return 'Expire';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non specifie';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

  const getStudentName = (payment: Payment) => {
    const student = (payment as any).student;
    return student ? `${student.firstName} ${student.lastName}` : 'Etudiant inconnu';
  };

  const getStudentInstitution = (payment: Payment) => {
    const student = (payment as any).student;
    return student?.institution || 'Non specifiee';
  };

  const viewPaymentDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPayment(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des paiements...</p>
        </div>
      </div>
    );
  }

  const totalAmount = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const filteredAmount = filteredPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour au tableau de bord
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Paiements par Etudiant</h1>
            <p className="text-gray-600 mt-1">
              {payments.length} paiement(s) au total - {formatCurrency(totalAmount)}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-red-500 rounded-full mr-2"></div>
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={fetchPayments}
                className="mt-2 bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 transition"
              >
                Reessayer
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher par reference, montant, etudiant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par statut
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="PENDING">En attente</option>
                  <option value="VALID">Valide</option>
                  <option value="EXPIRED">Expire</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrer par etudiant
                </label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les etudiants</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 gap-2">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                {filteredPayments.length} paiement(s) trouve(s) - {formatCurrency(filteredAmount)}
                {selectedStatus !== 'all' && ` - Statut: ${getStatusLabel(selectedStatus)}`}
                {selectedStudent !== 'all' && ` - Etudiant selectionne`}
                {searchTerm && ` pour "${searchTerm}"`}
              </span>
              {(selectedStatus !== 'all' || selectedStudent !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedStatus('all');
                    setSelectedStudent('all');
                    setSearchTerm('');
                  }}
                  className="text-red-600 hover:text-red-800 font-medium flex items-center text-sm"
                >
                  Reinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Paiements</p>
                  <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
                  <p className="text-sm text-green-600 font-medium">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Etudiants</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {students.length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resultats filtres</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {filteredPayments.length}
                  </p>
                  <p className="text-sm text-green-600 font-medium">{formatCurrency(filteredAmount)}</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Liste des Paiements
                  <span className="text-gray-500 font-normal ml-2">
                    ({filteredPayments.length})
                  </span>
                </h2>
                <button
                  onClick={fetchPayments}
                  className="bg-gray-500 text-white p-2 rounded-lg hover:bg-gray-600 transition flex items-center"
                  title="Rafraichir la liste"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {filteredPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Etudiant</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Institution</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Reference</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Montant</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date de paiement</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Details</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-800">
                              {getStudentName(payment)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-600">
                              {getStudentInstitution(payment)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-mono text-sm text-gray-600">
                              {payment.reference || 'N/A'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                                <svg className="w-2 h-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                              </div>
                              <span className="font-bold text-gray-800">
                                {formatCurrency(payment.amount || 0, payment.currency)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(payment.status || 'PENDING')}`}>
                                {getStatusLabel(payment.status || 'PENDING')}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
                                <svg className="w-2 h-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <span>{formatDate(payment.paymentDate?.toString())}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {payment.details || 'Aucun detail'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => viewPaymentDetails(payment)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                                title="Voir les details"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              {payment.status === 'PENDING' && (
                                <button
                                  onClick={() => {/* Valider le paiement */}}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                                  title="Valider le paiement"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg mb-2">Aucun paiement trouve</p>
                  <p className="text-gray-400 text-sm mb-6">
                    {selectedStatus !== 'all' || selectedStudent !== 'all' || searchTerm 
                      ? "Aucun paiement ne correspond a vos criteres de recherche" 
                      : "Aucun paiement dans la base de donnees"
                    }
                  </p>
                  {(selectedStatus !== 'all' || selectedStudent !== 'all' || searchTerm) && (
                    <button
                      onClick={() => {
                        setSelectedStatus('all');
                        setSelectedStudent('all');
                        setSearchTerm('');
                      }}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                      Reinitialiser les filtres
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de details */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">Details du Paiement</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-4">Informations Etudiant</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Nom complet</label>
                      <p className="font-medium">{getStudentName(selectedPayment)}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Institution</label>
                      <p className="font-medium">{getStudentInstitution(selectedPayment)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-4">Details du Paiement</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-500">Reference</label>
                      <p className="font-mono font-medium">{selectedPayment.reference || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Montant</label>
                      <p className="font-bold text-lg text-green-600">
                        {formatCurrency(selectedPayment.amount || 0, selectedPayment.currency)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Statut</label>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(selectedPayment.status || 'PENDING')}`}>
                        {getStatusLabel(selectedPayment.status || 'PENDING')}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Date de paiement</label>
                      <p className="font-medium">{formatDate(selectedPayment.paymentDate?.toString())}</p>
                    </div>
                  </div>
                </div>
              </div>
              {selectedPayment.details && (
                <div className="mt-6">
                  <label className="text-sm text-gray-500">Details supplementaires</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {selectedPayment.details}
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsByStudent;