import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-xl p-8">
          <div className="text-center mb-8">
            <img src="/logovapa.png" alt="Vapa" className="h-20 w-20 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-lime-400">Service Desk</h1>
            <p className="text-gray-400 mt-2">Inicia sesión en tu cuenta</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-lime-300 mb-2 text-sm">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400" />
            </div>
            <div>
              <label className="block text-lime-300 mb-2 text-sm">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400" />
            </div>
            {error && <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 rounded-lg transition disabled:opacity-50">
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            ¿Sin cuenta? <Link to="/register" className="text-lime-400 hover:text-lime-300">Registrar empresa</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
