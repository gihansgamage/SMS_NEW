import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, Calendar, Mail, FileText, Shield, Eye, LogOut } from 'lucide-react';
import { apiService } from '../services/api';
import AdminDashboard from '../components/Admin/AdminDashboard';
import AdminApprovals from '../components/Admin/AdminApprovals';
import AdminSocieties from '../components/Admin/AdminSocieties';
import AdminEvents from '../components/Admin/AdminEvents';
import AdminCommunication from '../components/Admin/AdminCommunication';
import AdminLogs from '../components/Admin/AdminLogs';
import AdminUsers from '../components/Admin/AdminUsers';
import StudentServiceMonitoring from '../components/Admin/StudentServiceMonitoring';

interface AdminUser {
  name: string;
  email: string;
  role: 'DEAN' | 'ASSISTANT_REGISTRAR' | 'VICE_CHANCELLOR' | 'PREMISES_OFFICER' | 'STUDENT_SERVICE';
  faculty?: string;
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current admin info
    apiService.admin.getCurrentUser()
        .then(res => setAdminUser(res.data))
        .catch(() => navigate('/admin/login'));
  }, [navigate]);

  const handleLogout = () => {
    // Logic to clear token/cookie
    navigate('/');
  };

  if (!adminUser) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Define tabs based on role
  const getTabs = () => {
    const baseTabs = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ];

    // Approvals: Everyone EXCEPT Student Service
    if (adminUser.role !== 'STUDENT_SERVICE') {
      baseTabs.push({ id: 'approvals', label: 'Approvals', icon: CheckSquare });
    }

    // Societies, Events, Communication, Logs: Everyone
    baseTabs.push(
        { id: 'societies', label: 'Societies', icon: Users },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'communication', label: 'Communication', icon: Mail },
        { id: 'logs', label: 'Activity Logs', icon: FileText }
    );

    // Monitoring: Only Student Service
    if (adminUser.role === 'STUDENT_SERVICE') {
      baseTabs.push({ id: 'monitoring', label: 'Monitoring', icon: Eye });
    }

    // User Management: Only Assistant Registrar
    if (adminUser.role === 'ASSISTANT_REGISTRAR') {
      baseTabs.push({ id: 'users', label: 'User Management', icon: Shield });
    }

    return baseTabs;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard user={adminUser} />;
      case 'approvals': return <AdminApprovals user={adminUser} />;
      case 'societies': return <AdminSocieties />;
      case 'events': return <AdminEvents />;
      case 'communication': return <AdminCommunication />;
      case 'logs': return <AdminLogs />;
      case 'users': return <AdminUsers />;
      case 'monitoring': return <StudentServiceMonitoring />;
      default: return <AdminDashboard user={adminUser} />;
    }
  };

  return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900 text-white flex flex-col">
          <div className="p-6">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <p className="text-xs text-gray-400 mt-1">{adminUser.name}</p>
            <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded mt-2 inline-block">
            {adminUser.role.replace('_', ' ')}
          </span>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {getTabs().map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-gray-400 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderContent()}
          </div>
        </main>
      </div>
  );
};

export default AdminPanel;