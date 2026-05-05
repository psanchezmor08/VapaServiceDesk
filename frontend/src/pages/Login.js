import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Email o contraseña incorrectos');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: 400, background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 12, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#BFFF00', letterSpacing: -2 }}>VAPA ONE</div>
          <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>Panel de acceso</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#fff', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
          {error && <div style={{ background: '#1a0a0a', border: '1px solid #5a1a1a', color: '#ff6b6b', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ padding: '12px', background: '#BFFF00', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Accediendo...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}