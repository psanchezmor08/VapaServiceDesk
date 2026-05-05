import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const nav = [
  { path: '/', label: 'Dashboard', icon: '▦' },
  { path: '/crm', label: 'CRM', icon: '◎' },
  { path: '/tickets', label: 'Service Desk', icon: '◈' },
  { path: '/invoices', label: 'Facturación', icon: '◉' },
  { path: '/employees', label: 'Empleados', icon: '◍' },
  { path: '/vacations', label: 'Vacaciones', icon: '◌' },
  { path: '/admin', label: 'Admin', icon: '◐', adminOnly: true },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0f', fontFamily: 'system-ui, sans-serif' }}>
      <aside style={{ width: 240, background: '#0d0d14', borderRight: '1px solid #1a1a2e', display: 'flex', flexDirection: 'column', padding: '24px 0' }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1a1a2e' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#BFFF00', letterSpacing: -1 }}>VAPA ONE</div>
          <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>ERP · CRM · Service Desk</div>
        </div>
        <nav style={{ flex: 1, padding: '16px 0' }}>
          {nav.filter(item => !item.adminOnly || isAdmin()).map(item => (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
              color: location.pathname === item.path ? '#BFFF00' : '#888',
              background: location.pathname === item.path ? '#BFFF0010' : 'transparent',
              borderLeft: location.pathname === item.path ? '2px solid #BFFF00' : '2px solid transparent',
              textDecoration: 'none', fontSize: 14, transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1a1a2e' }}>
          <div style={{ fontSize: 13, color: '#aaa', marginBottom: 4 }}>{user?.full_name}</div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 12 }}>{user?.role}</div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '8px 0', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main style={{ flex: 1, overflow: 'auto', padding: 32 }}>
        {children}
      </main>
    </div>
  );
}