import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  FaSignOutAlt, 
  FaTachometerAlt, 
  FaUsers, 
  FaUserGraduate, 
  FaMoneyBillWave,
  FaQrcode,
  FaUniversity,
  FaUserShield,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaCog,
  FaBuilding
} from 'react-icons/fa';
import { UserRole } from '../../types/user';

interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

const Layout: React.FC<LayoutProps> = ({ children, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth(); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    logout(); 
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSubMenu = (menuKey: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrateur';
      case 'ADMIN': return 'Administrateur';
      case 'ACCOUNTANT': return 'Comptable';
      case 'SECRETARY': return 'Secrétaire';
      case 'GUARD': return 'Agent de sécurité';
      default: return 'Utilisateur';
    }
  };

  const menuItems = {
    SUPER_ADMIN: [
      { 
        path: '/admin/dashboard', 
        label: 'Tableau de bord', 
        icon: FaTachometerAlt 
      },
      { 
        key: 'user-management',
        label: 'Gestion des utilisateurs', 
        icon: FaUsers,
        submenu: [
          { path: '/admin/users/list', label: 'Liste des utilisateurs' },
          { path: '/admin/users/create', label: 'Créer un utilisateur' }
        ]
      },
      { 
        key: 'student-management',
        label: 'Gestion des étudiants', 
        icon: FaUserGraduate,
        submenu: [
          { path: '/admin/students/list', label: 'Liste des étudiants' },
          { path: '/admin/students/create', label: 'Ajouter un étudiant' }
        ]
      },
      { 
        key: 'payment-management',
        label: 'Gestion des paiements', 
        icon: FaMoneyBillWave,
        submenu: [
          { path: '/admin/payments/list', label: 'Liste des paiements' },
          { path: '/admin/payments/by-student', label: 'Paiements par étudiant' }
        ]
      },
      { 
        key: 'institution-management',
        label: 'Gestion institution', 
        icon: FaBuilding,
        submenu: [
          { path: '/admin/institutions', label: 'Institutions' },
          { path: '/admin/programs', label: 'Programmes' },
          { path: '/admin/payment-types', label: 'Types de paiement' }
        ]
      }
    ],
    ADMIN: [
      { 
        path: '/admin/dashboard', 
        label: 'Tableau de bord', 
        icon: FaTachometerAlt 
      },
      { 
        key: 'user-management',
        label: 'Gestion des utilisateurs', 
        icon: FaUsers,
        submenu: [
          { path: '/admin/users/list', label: 'Liste des utilisateurs' },
          { path: '/admin/users/create', label: 'Créer un utilisateur' }
        ]
      },
      { 
        key: 'student-management',
        label: 'Gestion des étudiants', 
        icon: FaUserGraduate,
        submenu: [
          { path: '/admin/students/list', label: 'Liste des étudiants' },
          { path: '/admin/students/create', label: 'Ajouter un étudiant' }
        ]
      },
      { 
        key: 'payment-management',
        label: 'Gestion des paiements', 
        icon: FaMoneyBillWave,
        submenu: [
          { path: '/admin/payments/list', label: 'Liste des paiements' },
          { path: '/admin/payments/by-student', label: 'Paiements par étudiant' }
        ]
      },
      { 
        key: 'institution-management',
        label: 'Gestion institution', 
        icon: FaBuilding,
        submenu: [
          { path: '/admin/institutions', label: 'Institutions' },
          { path: '/admin/programs', label: 'Programmes' },
          { path: '/admin/payment-types', label: 'Types de paiement' }
        ]
      }
    ],
    ACCOUNTANT: [
      { path: '/accountant/dashboard', label: 'Tableau de bord', icon: FaTachometerAlt },
      { 
        key: 'payment-management',
        label: 'Gestion des paiements', 
        icon: FaMoneyBillWave,
        submenu: [
          { path: '/accountant/payment-management', label: 'Gestion des paiements' },
          { path: '/accountant/stats', label: 'Statistiques' },
          { path: '/accountant/reports', label: 'Rapports financiers' }
        ]
      },
    ],
    SECRETARY: [
      { path: '/secretary/dashboard', label: 'Tableau de bord', icon: FaTachometerAlt },
      { 
        key: 'student-management',
        label: 'Gestion des étudiants', 
        icon: FaUserGraduate,
        submenu: [
          // { path: '/secretary/student-management', label: 'Gestion des étudiants' },
          { path: '/secretary/student-registration', label: 'Inscription étudiant' }
        ]
      },
      { 
        path: '/secretary/document', 
        label: 'Documents Etudiants', 
        icon: FaMoneyBillWave 
      },
    ],
    GUARD: [
      { path: '/guard/dashboard', label: 'Tableau de bord', icon: FaTachometerAlt },
      { path: '/guard/scan-card', label: 'Scanner carte', icon: FaQrcode },
    ],
  };

  const currentMenu = menuItems[role] || [];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderMenuItem = (item: any) => {
    const Icon = item.icon;
    
    if (item.submenu) {
      const isExpanded = expandedMenus[item.key];
      const hasActiveChild = item.submenu.some((subItem: any) => isActive(subItem.path));

      return (
        <li key={item.key}>
          <button
            onClick={() => toggleSubMenu(item.key)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              hasActiveChild 
                ? 'bg-red-700 text-white shadow' 
                : 'text-red-100 hover:bg-red-700 hover:text-white'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon className="text-lg" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {isExpanded ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
          </button>
          
          {isExpanded && (
            <ul className="ml-4 mt-2 space-y-1 border-l-2 border-red-600 pl-2">
              {item.submenu.map((subItem: any) => (
                <li key={subItem.path}>
                  <button
                    onClick={() => {
                      navigate(subItem.path);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 rounded transition-colors text-sm ${
                      isActive(subItem.path)
                        ? 'text-white bg-red-600'
                        : 'text-red-200 hover:text-white hover:bg-red-700'
                    }`}
                  >
                    {subItem.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </li>
      );
    }

    return (
      <li key={item.path}>
        <button
          onClick={() => {
            navigate(item.path);
            setIsSidebarOpen(false);
          }}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
            isActive(item.path)
              ? 'bg-red-700 text-white shadow' 
              : 'text-red-100 hover:bg-red-700 hover:text-white'
          }`}
        >
          <Icon className="text-lg" />
          <span className="text-sm font-medium">{item.label}</span>
        </button>
      </li>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-red-800 text-white rounded-lg shadow-lg"
      >
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-red-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-red-700 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <FaUniversity className="text-2xl text-white" />
              <div>
                <h1 className="text-lg font-bold">BOVANN</h1>
                <p className="text-xs text-red-200">Système de Paiement</p>
              </div>
            </div>
          </div>

          {/* Role info */}
          <div className="p-4 border-b border-red-700 flex-shrink-0">
            <p className="text-xs text-red-200">Connecté en tant que</p>
            <p className="text-sm font-semibold">{getRoleName(role)}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {currentMenu.map(renderMenuItem)}
            </ul>
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-red-700 flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-100 hover:bg-red-700 rounded-lg transition-colors text-sm font-medium"
            >
              <FaSignOutAlt className="text-sm" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;