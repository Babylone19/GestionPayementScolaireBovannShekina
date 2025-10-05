import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { getPayments } from '../../api/payments';
import { Payment } from '../../types/payment';
import { Student } from '../../types/student';
import { FaSearch, FaFilePdf, FaEye, FaFilter, FaTimes, FaMoneyBillWave } from 'react-icons/fa';

interface PaymentWithStudent extends Omit<Payment, 'validFrom' | 'student'> {
  validFrom: string;
  student?: Student;
}

const PaymentsList: React.FC = () => {
  const [payments, setPayments] = useState<PaymentWithStudent[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentWithStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const navigate = useNavigate();

  const token = getToken();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        if (!token) {
          navigate('/');
          return;
        }

        const response = await getPayments(token);
        let paymentsData: PaymentWithStudent[] = [];

        if (Array.isArray(response)) {
          paymentsData = response as PaymentWithStudent[];
        } else if (response && typeof response === 'object') {
          paymentsData = (response as any).payments || [];
        }

        setPayments(paymentsData);
        setFilteredPayments(paymentsData);
      } catch (error) {
        console.error('Erreur lors de la récupération des paiements:', error);
        setError('Erreur lors de la récupération des paiements');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [token, navigate]);

  useEffect(() => {
    let filtered = [...payments];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.student?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.student?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.student?.phone.includes(searchTerm) ||
        (payment.reference && payment.reference.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPayments(filtered);
  }, [searchTerm, statusFilter, payments]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
      'VALID': { color: 'text-green-800', bgColor: 'bg-green-100', label: 'Validé' },
      'PENDING': { color: 'text-yellow-800', bgColor: 'bg-yellow-100', label: 'En attente' },
      'EXPIRED': { color: 'text-red-800', bgColor: 'bg-red-100', label: 'Expiré' },
      'CANCELLED': { color: 'text-gray-800', bgColor: 'bg-gray-100', label: 'Annulé' }
    };

    const config = statusConfig[status] || { color: 'text-gray-800', bgColor: 'bg-gray-100', label: status };
    return `${config.bgColor} ${config.color} px-2 py-1 rounded-full text-xs font-medium`;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des paiements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion des Paiements</h1>
              <p className="text-gray-600 mt-1">
                {filteredPayments.length} paiement(s) trouvé(s)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-medium">Erreur:</span>
                <span className="ml-2">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Filtres et Recherche</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nom étudiant, téléphone ou référence..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-10"
                  />
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="VALID">Validé</option>
                  <option value="PENDING">En attente</option>
                  <option value="EXPIRED">Expiré</option>
                  <option value="CANCELLED">Annulé</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaMoneyBillWave className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {payment.student?.firstName} {payment.student?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.student?.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatAmount(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Du {formatDate(payment.validFrom)}</div>
                        <div>Au {formatDate(payment.validUntil)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(payment.status)}>
                          {getStatusBadge(payment.status).includes('bg-green') ? 'Validé' : 
                           getStatusBadge(payment.status).includes('bg-yellow') ? 'En attente' :
                           getStatusBadge(payment.status).includes('bg-red') ? 'Expiré' : 'Annulé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {payment.reference || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.createdAt ? formatDate(payment.createdAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/admin/payment-view/${payment.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir détails"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => {/* Générer reçu */}}
                            className="text-purple-600 hover:text-purple-900"
                            title="Générer reçu"
                          >
                            <FaFilePdf />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-24 text-center">
                      <FaMoneyBillWave className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun paiement trouvé</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Aucun paiement ne correspond à vos critères de recherche.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsList;