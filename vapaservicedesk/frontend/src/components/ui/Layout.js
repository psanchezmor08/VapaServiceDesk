import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/tickets', label: 'Tickets', icon: '🎫' },
  { path: '/clients', label: 'Clientes', icon: '👥' },
  { path: '/projects', label: 'Proyectos', icon: '📁' },
  { path: '/workers', label: 'Trabajadores', icon: '👷' },
  { path: '/invoices', label: 'Facturas', icon: '📄' },
  { path: '/finance', label: 'Balance', icon: '💰' },
  { path: '/users', label: 'Usuarios', icon: '⚙️', adminOnly: true },
  { path: '/settings', label: 'Configuración', icon: '🔧' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-gray-900/90 border-r border-lime-500/20 flex flex-col`}>
        <div className="p-4 flex items-center gap-3 border-b border-lime-500/20">
          <img src="/logovapa.png" alt="Vapa" className="h-8 w-8 flex-shrink-0" />
          {sidebarOpen && <span className="text-lime-400 font-bold text-lg">Service Desk</span>}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.filter(item => !item.adminOnly || isAdmin()).map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${location.pathname === item.path ? 'bg-lime-500 text-gray-900 font-bold' : 'text-lime-300 hover:bg-gray-800'}`}>
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-lime-500/20">
          {sidebarOpen && user && (
            <div className="mb-2 px-3 py-2">
              <p className="text-lime-300 text-sm font-bold truncate">{user.name}</p>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
              <span className="text-xs text-lime-500">{user.role}</span>
            </div>
          )}
          <button onClick={handleLogout} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition`}>
            <span className="text-lg">🚪</span>
            {sidebarOpen && <span className="text-sm">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="bg-gray-900/80 border-b border-lime-500/20 px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-lime-400 hover:text-lime-300 transition text-xl">☰</button>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Vapa Service Desk</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
