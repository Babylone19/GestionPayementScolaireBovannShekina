import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { getPayments } from '../../api/payments';
import { Payment } from '../../types/payment';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaMoneyBillWave,
  FaSync,
  FaUserGraduate,
  FaCalendarAlt
} from 'react-icons/fa';

const PaymentsList: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    let filtered = payments;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.amount.toString().includes(searchTerm) ||
        payment.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  }, [searchTerm, selectedStatus, payments]);

  const fetchPayments = async () => {
    try {
      const token = getToken();
      if (!token) {
        navigate('/');
        return;
      }
      setLoading(true);
      const paymentsData = await getPayments(token);
      setPayments(paymentsData);
      setFilteredPayments(paymentsData);
    } catch (error) {
      console.error('Erreur lors de la récupération des paiements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VALID':
        return <FaCheckCircle className="text-green-500" />;
      case 'PENDING':
        return <FaClock className="text-yellow-500" />;
      case 'EXPIRED':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VALID':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
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

  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifié';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Paiements</h1>
            <p className="text-gray-600 mt-1">
              {payments.length} paiement(s) au total
            </p>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher un paiement
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher par référence, montant ou détails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="lg:w-64">
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
                  <option value="VALID">Validé</option>
                  <option value="EXPIRED">Expiré</option>
                </select>
              </div>

              <div className="lg:w-auto flex items-end">
                <button
                  onClick={fetchPayments}
                  className="bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition flex items-center"
                  title="Rafraîchir la liste"
                >
                  <FaSync />
                </button>
              </div>
            </div>

            {/* Résultats du filtre */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 gap-2">
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                {filteredPayments.length} paiement(s) trouvé(s)
                {selectedStatus !== 'all' && ` - Statut: ${getStatusLabel(selectedStatus)}`}
                {searchTerm && ` pour "${searchTerm}"`}
              </span>
              {(selectedStatus !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedStatus('all');
                    setSearchTerm('');
                  }}
                  className="text-red-600 hover:text-red-800 font-medium flex items-center text-sm"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          </div>

          {/* Statistiques des paiements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
                </div>
                <FaMoneyBillWave className="text-blue-500 text-xl" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {payments.filter(p => p.status === 'PENDING').length}
                  </p>
                </div>
                <FaClock className="text-yellow-500 text-xl" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Validés</p>
                  <p className="text-2xl font-bold text-green-600">
                    {payments.filter(p => p.status === 'VALID').length}
                  </p>
                </div>
                <FaCheckCircle className="text-green-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Liste des paiements */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Liste des Paiements
                <span className="text-gray-500 font-normal ml-2">
                  ({filteredPayments.length})
                </span>
              </h2>
            </div>

            <div className="p-6">
              {filteredPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Référence</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Montant</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Date de paiement</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Détails</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-mono text-sm text-gray-600">
                              {payment.reference}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <FaMoneyBillWave className="text-green-500" />
                              <span className="font-bold text-gray-800">
                                {formatCurrency(payment.amount, payment.currency)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(payment.status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(payment.status)}`}>
                                {getStatusLabel(payment.status)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FaCalendarAlt className="text-gray-400" />
                              <span>{formatDate(payment.paymentDate?.toString())}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {payment.details || 'Aucun détail'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => {/* Voir détails */}}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Voir les détails"
                              >
                                <FaEye />
                              </button>
                              {payment.status === 'PENDING' && (
                                <button
                                  onClick={() => {/* Valider le paiement */}}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Valider le paiement"
                                >
                                  <FaCheckCircle />
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
                  <FaMoneyBillWave className="text-4xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Aucun paiement trouvé</p>
                  <p className="text-gray-400 text-sm mb-6">
                    {selectedStatus !== 'all' || searchTerm 
                      ? "Aucun paiement ne correspond à vos critères de recherche" 
                      : "Aucun paiement dans la base de données"
                    }
                  </p>
                  {(selectedStatus !== 'all' || searchTerm) && (
                    <button
                      onClick={() => {
                        setSelectedStatus('all');
                        setSearchTerm('');
                      }}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsList;