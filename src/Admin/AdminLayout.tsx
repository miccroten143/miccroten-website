import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, LogOut, Menu, X, Settings, Award,
} from 'lucide-react';
import { useAuthStore } from './lib/store';
import { useAuth } from '../ecommerce/AuthContext';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try { await signOut(); } catch {}
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products', icon: Package },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/certificates', label: 'Intern Certificates', icon: Award },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-gray-900 text-white z-50 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <img src="/Admin/assets/light-mode-logo.png" alt="Admin" height="36px" width="36px" />
            <span className="font-bold">MICCROTEN</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>
        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                isActive(item.to) ? 'bg-primary-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <item.icon size={18} /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-rose-400 hover:bg-gray-800">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b sticky top-0 z-30">
          <div className="px-4 lg:px-8 h-16 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-900 hidden lg:block">Admin Panel</h1>
            <Link to="/" className="text-sm text-primary-600 hover:underline">View Store</Link>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
