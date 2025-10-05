import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../../utils/auth";
import { getStudents } from "../../api/students";
import { getPayments } from "../../api/payments";
import { Student } from "../../types/student";
import { Payment } from "../../types/payment";
import StudentCard from "../../components/StudentCard";
import { FaSignOutAlt, FaMoneyBillWave, FaUserGraduate, FaUniversity } from "react-icons/fa";
import { extractStudentsFromResponse, extractPaymentsFromResponse, getInstitutionName } from "../../utils/helpers";

const AccountantDashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate("/");
          return;
        }
        setLoading(true);
        
        // Récupérer les étudiants
        const studentsResponse = await getStudents(token);
        const studentsData = extractStudentsFromResponse(studentsResponse);
        setStudents(studentsData);
        
        // Récupérer les paiements
        try {
          const paymentsResponse = await getPayments(token);
          const paymentsData = extractPaymentsFromResponse(paymentsResponse);
          setPayments(paymentsData);
        } catch (paymentError) {
          console.warn("Erreur lors de la récupération des paiements:", paymentError);
        }
        
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setError("Erreur lors de la récupération des données");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    removeToken();
    navigate("/");
  };

  // Statistiques par institution
  const institutionStats = students.reduce((acc, student) => {
    const institutionName = getInstitutionName(student.institution);
    
    if (!acc[institutionName]) {
      acc[institutionName] = {
        count: 0,
        totalPayments: 0
      };
    }
    
    acc[institutionName].count++;
    
    // Calculer les paiements pour cette institution via studentId
    const studentPayments = payments.filter(payment => payment.studentId === student.id);
    acc[institutionName].totalPayments += studentPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    return acc;
  }, {} as Record<string, { count: number; totalPayments: number }>);

  // Calcul des statistiques globales
  const totalStudents = students.length;
  const totalInstitutions = Object.keys(institutionStats).length;
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const validPayments = payments.filter(p => p.status === 'VALID').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Comptable</h1>
              <p className="text-gray-600 mt-1">Gestion des paiements et étudiants</p>
            </div>
            {/* <button
              onClick={handleLogout}
              className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <FaSignOutAlt className="mr-2" />
              Déconnexion
            </button> */}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaUserGraduate className="text-3xl text-blue-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Étudiants total</p>
                <h2 className="text-2xl font-bold text-gray-900">{totalStudents}</h2>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaUniversity className="text-3xl text-purple-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Institutions</p>
                <h2 className="text-2xl font-bold text-gray-900">{totalInstitutions}</h2>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaMoneyBillWave className="text-3xl text-green-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Paiements total</p>
                <h2 className="text-2xl font-bold text-gray-900">{totalPayments.toLocaleString()} FCFA</h2>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <FaMoneyBillWave className="text-3xl text-yellow-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-gray-600">Paiements valides</p>
                <h2 className="text-2xl font-bold text-gray-900">{validPayments}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques par institution */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Statistiques par Institution</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(institutionStats).map(([institution, stats]) => (
                <div key={institution} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 truncate">{institution}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Étudiants:</span>
                      <span className="font-medium">{stats.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paiements:</span>
                      <span className="font-medium">{stats.totalPayments.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={() => navigate("/accountant/payment-management")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition-colors flex-1 text-center"
          >
            Gérer les Paiements
          </button>
          <button
            onClick={() => navigate("/accountant/stats")}
            className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition-colors flex-1 text-center"
          >
            Voir les Statistiques
          </button>
        </div>

        {/* Liste des étudiants */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Liste des Étudiants</h2>
          </div>
          <div className="p-6">
            {students.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FaUserGraduate className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg">Aucun étudiant trouvé</p>
                <button
                  onClick={() => navigate("/secretary/student-registration")}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Ajouter un étudiant
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountantDashboard;