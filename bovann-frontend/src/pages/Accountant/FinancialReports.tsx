import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/auth';
import { getPayments } from '../../api/payments';
import { getStudents } from '../../api/students';
import { Payment } from '../../types/payment';
import { Student } from '../../types/student';
import { extractPaymentsFromResponse, extractStudentsFromResponse, getInstitutionName } from '../../utils/helpers';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { FaArrowLeft, FaFilePdf, FaFileExcel, FaFilter, FaSpinner } from 'react-icons/fa';

// Import des bibliothèques d'export
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const FinancialReports: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const navigate = useNavigate();

  // Références pour l'export PDF
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          navigate("/");
          return;
        }

        setLoading(true);
        
        const paymentsResponse = await getPayments(token);
        const paymentsData = extractPaymentsFromResponse(paymentsResponse);
        setPayments(paymentsData);
        
        const studentsResponse = await getStudents(token);
        const studentsData = extractStudentsFromResponse(studentsResponse);
        setStudents(studentsData);

      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Récupérer les institutions uniques
  const getUniqueInstitutions = (): string[] => {
    const institutionsSet = new Set<string>();
    students.forEach(student => {
      const institutionName = getInstitutionName(student.institution);
      institutionsSet.add(institutionName);
    });
    return Array.from(institutionsSet);
  };

  const institutions = ['all', ...getUniqueInstitutions()];

  // Filtrer les paiements selon la période et l'institution
  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.createdAt || new Date());
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    if (paymentDate < startDate || paymentDate > endDate) return false;

    if (selectedInstitution !== 'all') {
      const student = students.find(s => s.id === payment.studentId);
      return student && getInstitutionName(student.institution) === selectedInstitution;
    }

    return true;
  });

  // Générer les rapports financiers
  const financialReport = {
    totalRevenue: filteredPayments.reduce((sum, payment) => sum + payment.amount, 0),
    totalTransactions: filteredPayments.length,
    validTransactions: filteredPayments.filter(p => p.status === 'VALID').length,
    pendingTransactions: filteredPayments.filter(p => p.status === 'PENDING').length,
    expiredTransactions: filteredPayments.filter(p => p.status === 'EXPIRED').length,
    averageTransaction: filteredPayments.length > 0 ? 
      Math.round(filteredPayments.reduce((sum, payment) => sum + payment.amount, 0) / filteredPayments.length) : 0
  };

  // Données pour le graphique des revenus par mois
  const getRevenueByMonth = () => {
    const monthlyRevenue: { [key: string]: number } = {};
    
    filteredPayments.forEach(payment => {
      const date = new Date(payment.createdAt || new Date());
      const monthYear = `${date.toLocaleString('fr-FR', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthlyRevenue[monthYear]) {
        monthlyRevenue[monthYear] = 0;
      }
      
      monthlyRevenue[monthYear] += payment.amount;
    });

    // Trier par date
    const sortedMonths = Object.keys(monthlyRevenue).sort((a, b) => {
      const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      
      const dateA = new Date(parseInt(yearA), months.indexOf(monthA));
      const dateB = new Date(parseInt(yearB), months.indexOf(monthB));
      
      return dateA.getTime() - dateB.getTime();
    });

    return {
      labels: sortedMonths,
      data: sortedMonths.map(month => monthlyRevenue[month])
    };
  };

  const monthlyRevenue = getRevenueByMonth();

  const revenueData = {
    labels: monthlyRevenue.labels,
    datasets: [
      {
        label: 'Revenus (FCFA)',
        data: monthlyRevenue.data,
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: '#16a34a',
        borderWidth: 2,
      },
    ],
  };

  const revenueOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Revenus mensuels'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString() + ' FCFA';
          }
        }
      }
    }
  };

  // Données pour le graphique de comparaison institutionnelle
  const getInstitutionComparison = () => {
    const institutionRevenue: { [key: string]: number } = {};
    
    filteredPayments.forEach(payment => {
      const student = students.find(s => s.id === payment.studentId);
      if (student) {
        const institution = getInstitutionName(student.institution);
        if (!institutionRevenue[institution]) {
          institutionRevenue[institution] = 0;
        }
        institutionRevenue[institution] += payment.amount;
      }
    });

    return {
      labels: Object.keys(institutionRevenue),
      data: Object.values(institutionRevenue)
    };
  };

  const comparisonData = getInstitutionComparison();

  const comparisonChartData = {
    labels: comparisonData.labels,
    datasets: [
      {
        label: 'Revenus par Institution (FCFA)',
        data: comparisonData.data,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#1d4ed8',
        borderWidth: 2,
      },
    ],
  };

  const comparisonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Comparaison des revenus par institution'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString() + ' FCFA';
          }
        }
      }
    }
  };

  // Fonction d'export PDF
  const exportToPDF = async () => {
    if (!reportRef.current) return;
    
    setExporting('pdf');
    
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // En-tête du document
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('RAPPORT FINANCIER', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Période: ${new Date(dateRange.start).toLocaleDateString('fr-FR')} - ${new Date(dateRange.end).toLocaleDateString('fr-FR')}`, 105, 30, { align: 'center' });
      
      if (selectedInstitution !== 'all') {
        doc.text(`Institution: ${selectedInstitution}`, 105, 36, { align: 'center' });
      }
      
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 42, { align: 'center' });
      
      // Ligne de séparation
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 48, 190, 48);
      
      // Statistiques résumées
      let yPosition = 60;
      
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('RÉSUMÉ FINANCIER', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      const stats = [
        `Revenus totaux: ${financialReport.totalRevenue.toLocaleString()} FCFA`,
        `Nombre de transactions: ${financialReport.totalTransactions}`,
        `Transactions valides: ${financialReport.validTransactions}`,
        `Transactions en attente: ${financialReport.pendingTransactions}`,
        `Transactions expirées: ${financialReport.expiredTransactions}`,
        `Moyenne par transaction: ${financialReport.averageTransaction.toLocaleString()} FCFA`
      ];
      
      stats.forEach(stat => {
        doc.text(stat, 25, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
      
      // Tableau des transactions
      if (filteredPayments.length > 0) {
        doc.setFontSize(14);
        doc.text('DÉTAIL DES TRANSACTIONS', 20, yPosition);
        yPosition += 10;
        
        // En-têtes du tableau
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPosition, 170, 8, 'F');
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        
        const headers = ['Étudiant', 'Institution', 'Montant', 'Statut', 'Date'];
        const colWidths = [40, 40, 30, 30, 30];
        let xPosition = 22;
        
        headers.forEach((header, index) => {
          doc.text(header, xPosition, yPosition + 6);
          xPosition += colWidths[index];
        });
        
        yPosition += 10;
        
        // Données du tableau
        doc.setFontSize(7);
        doc.setTextColor(40, 40, 40);
        
        filteredPayments.slice(0, 20).forEach((payment, index) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          const student = students.find(s => s.id === payment.studentId);
          const rowData = [
            student ? `${student.firstName} ${student.lastName}`.substring(0, 20) : 'N/A',
            student ? getInstitutionName(student.institution).substring(0, 20) : 'N/A',
            `${payment.amount.toLocaleString()} FCFA`,
            payment.status === 'VALID' ? 'Valide' : payment.status === 'PENDING' ? 'En attente' : 'Expiré',
            new Date(payment.createdAt || new Date()).toLocaleDateString('fr-FR')
          ];
          
          xPosition = 22;
          rowData.forEach((cell, cellIndex) => {
            doc.text(cell, xPosition, yPosition + 4);
            xPosition += colWidths[cellIndex];
          });
          
          yPosition += 6;
          
          // Ligne de séparation
          if (index < filteredPayments.slice(0, 20).length - 1) {
            doc.setDrawColor(240, 240, 240);
            doc.line(20, yPosition - 1, 190, yPosition - 1);
          }
        });
        
        if (filteredPayments.length > 20) {
          yPosition += 5;
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`... et ${filteredPayments.length - 20} transactions supplémentaires`, 20, yPosition);
        }
      }
      
      // Pied de page
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} sur ${pageCount}`, 105, 285, { align: 'center' });
        doc.text('Système de Gestion Scolaire - Rapport Généré Automatiquement', 105, 290, { align: 'center' });
      }
      
      // Sauvegarder le PDF
      doc.save(`rapport-financier-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
    } finally {
      setExporting(null);
    }
  };

  // Fonction d'export Excel
  const exportToExcel = () => {
    setExporting('excel');
    
    try {
      // Données pour l'onglet Résumé
      const summaryData = [
        ['RAPPORT FINANCIER'],
        [''],
        ['Période', `${new Date(dateRange.start).toLocaleDateString('fr-FR')} - ${new Date(dateRange.end).toLocaleDateString('fr-FR')}`],
        ['Institution', selectedInstitution === 'all' ? 'Toutes les institutions' : selectedInstitution],
        ['Date de génération', new Date().toLocaleDateString('fr-FR')],
        [''],
        ['RÉSUMÉ FINANCIER'],
        ['Revenus totaux', `${financialReport.totalRevenue.toLocaleString()} FCFA`],
        ['Nombre total de transactions', financialReport.totalTransactions],
        ['Transactions valides', financialReport.validTransactions],
        ['Transactions en attente', financialReport.pendingTransactions],
        ['Transactions expirées', financialReport.expiredTransactions],
        ['Moyenne par transaction', `${financialReport.averageTransaction.toLocaleString()} FCFA`],
        ['Taux de validation', financialReport.totalTransactions > 0 ? 
          `${Math.round((financialReport.validTransactions / financialReport.totalTransactions) * 100)}%` : '0%'
        ],
        [''],
        ['DÉTAIL DES TRANSACTIONS']
      ];

      // En-têtes pour les transactions
      const transactionsHeaders = [
        'Étudiant',
        'Institution', 
        'Montant (FCFA)',
        'Statut',
        'Date',
        'Référence',
        'Email Étudiant'
      ];

      // Données des transactions
      const transactionsData = filteredPayments.map(payment => {
        const student = students.find(s => s.id === payment.studentId);
        return [
          student ? `${student.firstName} ${student.lastName}` : 'N/A',
          student ? getInstitutionName(student.institution) : 'N/A',
          payment.amount,
          payment.status === 'VALID' ? 'Valide' : payment.status === 'PENDING' ? 'En attente' : 'Expiré',
          new Date(payment.createdAt || new Date()).toISOString().split('T')[0],
          payment.reference || 'N/A',
          student?.email || 'N/A'
        ];
      });

      // Création du classeur Excel
      const wb = XLSX.utils.book_new();
      
      // Onglet Résumé
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Résumé');
      
      // Onglet Transactions
      const wsTransactions = XLSX.utils.aoa_to_sheet([transactionsHeaders, ...transactionsData]);
      
      // Formatage des colonnes
      const colWidths = [
        { wch: 25 }, // Étudiant
        { wch: 25 }, // Institution
        { wch: 15 }, // Montant
        { wch: 12 }, // Statut
        { wch: 12 }, // Date
        { wch: 20 }, // Référence
        { wch: 30 }  // Email
      ];
      wsTransactions['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions');
      
      // Données statistiques par institution
      const institutionStats = students.reduce((acc, student) => {
        const institutionName = getInstitutionName(student.institution);
        if (!acc[institutionName]) {
          acc[institutionName] = {
            students: 0,
            totalRevenue: 0,
            transactions: 0
          };
        }
        acc[institutionName].students++;
        
        const studentPayments = filteredPayments.filter(p => p.studentId === student.id);
        acc[institutionName].totalRevenue += studentPayments.reduce((sum, p) => sum + p.amount, 0);
        acc[institutionName].transactions += studentPayments.length;
        
        return acc;
      }, {} as Record<string, { students: number; totalRevenue: number; transactions: number }>);

      const institutionData = [
        ['STATISTIQUES PAR INSTITUTION'],
        [''],
        ['Institution', 'Nombre d\'étudiants', 'Nombre de transactions', 'Revenus totaux (FCFA)']
      ];

      Object.entries(institutionStats).forEach(([institution, stats]) => {
        institutionData.push([
          institution,
          stats.students.toString(),
          stats.transactions.toString(),
          stats.totalRevenue.toString()
        ]);
      });

      const wsInstitutions = XLSX.utils.aoa_to_sheet(institutionData);
      wsInstitutions['!cols'] = [
        { wch: 30 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 }
      ];
      XLSX.utils.book_append_sheet(wb, wsInstitutions, 'Par Institution');

      // Génération du fichier Excel
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      
      // Alternative à file-saver : création d'un blob et téléchargement manuel
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Création d'un URL et téléchargement
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-financier-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
      alert('Erreur lors de l\'export Excel. Veuillez réessayer.');
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={reportRef} className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/accountant/dashboard')}
            className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Rapports Financiers</h1>
            <p className="text-gray-600">Analyse financière détaillée et rapports</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={exportToPDF}
            disabled={exporting !== null}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400 flex items-center transition-colors"
          >
            {exporting === 'pdf' ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaFilePdf className="mr-2" />
            )}
            {exporting === 'pdf' ? 'Génération...' : 'PDF'}
          </button>
          <button 
            onClick={exportToExcel}
            disabled={exporting !== null}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-green-400 flex items-center transition-colors"
          >
            {exporting === 'excel' ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaFileExcel className="mr-2" />
            )}
            {exporting === 'excel' ? 'Génération...' : 'Excel'}
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <FaFilter className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Institution
            </label>
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {institutions.map(institution => (
                <option key={institution} value={institution}>
                  {institution === 'all' ? 'Toutes les institutions' : institution}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Période sélectionnée: <strong>{new Date(dateRange.start).toLocaleDateString('fr-FR')}</strong> à <strong>{new Date(dateRange.end).toLocaleDateString('fr-FR')}</strong>
            {selectedInstitution !== 'all' && ` • Institution: ${selectedInstitution}`}
          </p>
        </div>
      </div>

      {/* Résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Revenus Totaux</h3>
          <p className="text-2xl font-bold text-gray-800">
            {financialReport.totalRevenue.toLocaleString()} FCFA
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {financialReport.totalTransactions} transactions
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Transactions Total</h3>
          <p className="text-2xl font-bold text-gray-800">{financialReport.totalTransactions}</p>
          <p className="text-xs text-gray-500 mt-1">
            {filteredPayments.length} filtrée(s)
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-emerald-500">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Transactions Valides</h3>
          <p className="text-2xl font-bold text-gray-800">{financialReport.validTransactions}</p>
          <p className="text-xs text-gray-500 mt-1">
            {financialReport.totalTransactions > 0 ? 
              Math.round((financialReport.validTransactions / financialReport.totalTransactions) * 100) : 0
            }% du total
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Moyenne/Transaction</h3>
          <p className="text-2xl font-bold text-gray-800">
            {financialReport.averageTransaction.toLocaleString()} FCFA
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Par transaction
          </p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="h-80">
            <Bar data={revenueData} options={revenueOptions} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="h-80">
            <Bar data={comparisonChartData} options={comparisonOptions} />
          </div>
        </div>
      </div>

      {/* Tableau détaillé des transactions */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Détail des Transactions
          </h2>
          <span className="text-sm text-gray-500">
            {filteredPayments.length} transaction(s) trouvée(s)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => {
                  const student = students.find(s => s.id === payment.studentId);
                  return (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student ? `${student.firstName} ${student.lastName}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student ? getInstitutionName(student.institution) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {payment.amount.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'VALID' 
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.status === 'VALID' ? 'Valide' : payment.status === 'PENDING' ? 'En attente' : 'Expiré'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt || new Date()).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {payment.reference || 'N/A'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <FaFilter className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p>Aucune transaction trouvée avec les filtres actuels</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;