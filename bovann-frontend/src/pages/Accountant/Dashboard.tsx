import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../../utils/auth";
import { getStudents } from "../../api/students";
import { getPayments } from "../../api/payments";
import { Student } from "../../types/student";
import { Payment } from "../../types/payment";
import StudentCard from "../../components/StudentCard";
import { FaSignOutAlt, FaMoneyBillWave, FaUserGraduate, FaUniversity } from "react-icons/fa";

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
        
        // Récupérer seulement les étudiants d'abord
        const studentsData = await getStudents(token);
        setStudents(studentsData);
        
        // Ensuite récupérer les paiements si besoin
        try {
          const paymentsData = await getPayments(token);
          setPayments(paymentsData);
        } catch (paymentError) {
          console.warn("Erreur lors de la récupération des paiements:", paymentError);
          // On continue même si les paiements échouent
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
    const institution = student.institution || 'Non spécifiée';
    if (!acc[institution]) {
      acc[institution] = {
        count: 0,
      };
    }
    
    acc[institution].count++;
    
    return acc;
  }, {} as Record<string, { count: number }>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent">
        <p className="text-gray-800 text-lg">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-accent">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center sm:text-left">
          Tableau de bord Comptable
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition w-full sm:w-auto justify-center"
        >
          <FaSignOutAlt className="mr-2" /> Déconnexion
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6">
        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-white shadow rounded-xl p-4 sm:p-6 flex items-center">
            <FaUserGraduate className="text-2xl sm:text-3xl text-blue-500 mr-3 sm:mr-4" />
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Étudiants total</p>
              <h2 className="text-lg sm:text-xl font-bold">{students.length}</h2>
            </div>
          </div>
          <div className="bg-white shadow rounded-xl p-4 sm:p-6 flex items-center">
            <FaUniversity className="text-2xl sm:text-3xl text-purple-500 mr-3 sm:mr-4" />
            <div>
              <p className="text-gray-600 text-sm sm:text-base">Institutions</p>
              <h2 className="text-lg sm:text-xl font-bold">{Object.keys(institutionStats).length}</h2>
            </div>
          </div>
        </div>

        {/* Statistiques par institution */}
        <div className="bg-white shadow rounded-xl p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            Statistiques par Institution
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {Object.entries(institutionStats).map(([institution, stats]) => (
              <div key={institution} className="border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-gray-700 text-sm sm:text-base mb-2 truncate" title={institution}>
                  {institution}
                </h3>
                <div className="space-y-1 text-xs sm:text-sm">
                  <p className="flex justify-between">
                    <span>Étudiants:</span>
                    <span className="font-medium">{stats.count}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bouton d'action */}
        <div className="flex justify-center sm:justify-end mb-6">
          <button
            onClick={() => navigate("/accountant/payment-management")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition w-full sm:w-auto text-center"
          >
            Gérer les paiements
          </button>
        </div>

        {/* Liste des étudiants */}
        <div className="bg-white shadow rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
            Liste des Étudiants
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {students.length > 0 ? (
              students.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))
            ) : (
              <p className="text-gray-600 text-center col-span-full py-8">
                Aucun étudiant trouvé.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AccountantDashboard;