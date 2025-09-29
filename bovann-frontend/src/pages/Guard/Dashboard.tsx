import React from "react";
import { useNavigate } from "react-router-dom";
import { getToken, removeToken } from "../../utils/auth";
import { FaSignOutAlt, FaIdCard } from "react-icons/fa";

const GuardDashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    removeToken();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-accent flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Tableau de bord Gardien
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          <FaSignOutAlt className="mr-2" /> Déconnexion
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/guard/scan-card")}
            className="bg-white shadow rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition"
          >
            <FaIdCard className="text-4xl text-blue-500 mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              Scanner une carte
            </h2>
            <p className="text-gray-500 text-center mt-2">
              Accédez au scanner de cartes pour les entrées/sorties
            </p>
          </div>

          {/* Exemple d’action future */}
          {/* <div className="bg-white shadow rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition">
            <FaSomeIcon className="text-4xl text-green-500 mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 text-center">Autre action</h2>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default GuardDashboard;
