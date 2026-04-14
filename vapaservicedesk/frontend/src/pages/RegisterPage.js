import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ company_name: '', admin_name: '', admin_email: '', admin_password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const data = await authAPI.register(form);
      localStorage.setItem('sd_token', data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar');
    }
    setLoading(false);
  };

  const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-xl p-8">
          <div className="text-center mb-8">
            <img src="/logovapa.png" alt="Vapa" className="h-20 w-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-lime-400">Registrar Empresa</h1>
            <p className="text-gray-400 mt-2">Crea tu cuenta de Service Desk</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-lime-300 mb-2 text-sm">Nombre de la empresa</label>
              <input type="text" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} required className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-2 text-sm">Tu nombre</label>
              <input type="text" value={form.admin_name} onChange={e => setForm({...form, admin_name: e.target.value})} required className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-2 text-sm">Email de administrador</label>
              <input type="email" value={form.admin_email} onChange={e => setForm({...form, admin_email: e.target.value})} required className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-2 text-sm">Contraseña</label>
              <input type="password" value={form.admin_password} onChange={e => setForm({...form, admin_password: e.target.value})} required className={inp} />
            </div>
            {error && <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 rounded-lg transition disabled:opacity-50">
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            ¿Ya tienes cuenta? <Link to="/login" className="text-lime-400 hover:text-lime-300">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
