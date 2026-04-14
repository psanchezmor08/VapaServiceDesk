import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";

export default function SettingsPage() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm) { setMessage('Las contraseñas no coinciden'); setTimeout(() => setMessage(''), 3000); return; }
    if (passwords.new_password.length < 6) { setMessage('Mínimo 6 caracteres'); setTimeout(() => setMessage(''), 3000); return; }
    setLoading(true);
    try {
      await authAPI.changePassword({ current_password: passwords.current_password, new_password: passwords.new_password });
      setPasswords({ current_password: '', new_password: '', confirm: '' });
      setMessage('Contraseña cambiada correctamente');
    } catch (err) { setMessage(err.response?.data?.detail || 'Error al cambiar contraseña'); }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold text-lime-400">Configuración</h1>

      {message && <div className="bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded-lg">{message}</div>}

      <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-6">
        <h2 className="text-lime-400 font-bold text-lg mb-4">Mi perfil</h2>
        <div className="space-y-2">
          <p className="text-gray-400 text-sm">Nombre: <span className="text-white">{user?.name}</span></p>
          <p className="text-gray-400 text-sm">Email: <span className="text-white">{user?.email}</span></p>
          <p className="text-gray-400 text-sm">Rol: <span className="text-lime-400">{user?.role}</span></p>
          {user?.department && <p className="text-gray-400 text-sm">Departamento: <span className="text-white">{user.department}</span></p>}
        </div>
      </div>

      <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-6">
        <h2 className="text-lime-400 font-bold text-lg mb-4">Cambiar contraseña</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-lime-300 mb-1 text-sm">Contraseña actual</label>
            <input type="password" value={passwords.current_password} onChange={e => setPasswords({...passwords, current_password: e.target.value})} required className={inp} />
          </div>
          <div>
            <label className="block text-lime-300 mb-1 text-sm">Nueva contraseña</label>
            <input type="password" value={passwords.new_password} onChange={e => setPasswords({...passwords, new_password: e.target.value})} required className={inp} />
          </div>
          <div>
            <label className="block text-lime-300 mb-1 text-sm">Confirmar nueva contraseña</label>
            <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} required className={inp} />
          </div>
          <button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">
            {loading ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>

      <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-6">
        <h2 className="text-lime-400 font-bold text-lg mb-2">Acerca de</h2>
        <div className="flex items-center gap-4">
          <img src="/logovapa.png" alt="Vapa" className="h-12 w-12" />
          <div>
            <p className="text-white font-bold">Vapa Service Desk</p>
            <p className="text-gray-400 text-sm">Sistema de gestión empresarial completo</p>
            <p className="text-gray-500 text-xs">v1.0.0 — servicedesk.vapa.es</p>
          </div>
        </div>
      </div>
    </div>
  );
}
