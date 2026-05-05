import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL + '/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent' });
  const [resetPasswords, setResetPasswords] = useState({});
  const [myPassword, setMyPassword] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await axios.get(`${API}/users`, { headers: getHeaders() });
      setUsers(res.data);
    } catch (e) { console.error(e); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/users`, form, { headers: getHeaders() });
      setForm({ name: '', email: '', password: '', role: 'agent' });
      setShowForm(false);
      loadUsers();
      setMessage('Usuario creado');
    } catch (err) { setMessage(err.response?.data?.detail || 'Error al crear'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleResetPassword = async (userId) => {
    const pass = resetPasswords[userId];
    if (!pass || pass.length < 6) { setMessage('Mínimo 6 caracteres'); setTimeout(() => setMessage(''), 3000); return; }
    try {
      await axios.put(`${API}/users/${userId}/reset-password`, { new_password: pass }, { headers: getHeaders() });
      setResetPasswords({...resetPasswords, [userId]: ''});
      setMessage('Contraseña restablecida');
    } catch { setMessage('Error'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChangeMyPassword = async (e) => {
    e.preventDefault();
    if (myPassword.new !== myPassword.confirm) { setMessage('Las contraseñas no coinciden'); setTimeout(() => setMessage(''), 3000); return; }
    try {
      await axios.put(`${API}/auth/change-password`, { current_password: myPassword.current, new_password: myPassword.new }, { headers: getHeaders() });
      setMyPassword({ current: '', new: '', confirm: '' });
      setMessage('Contraseña cambiada');
    } catch { setMessage('Error al cambiar contraseña'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try {
      await axios.delete(`${API}/users/${userId}`, { headers: getHeaders() });
      loadUsers();
    } catch { setMessage('Error al eliminar'); }
  };

  const tabClass = (t) => `px-4 py-2 rounded-lg font-bold transition text-sm ${activeTab === t ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'}`;
  const roleColor = (r) => ({ admin: 'text-red-400', manager: 'text-yellow-400', agent: 'text-lime-400', client: 'text-blue-400' }[r] || 'text-gray-400');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-lime-400">Administración</h1>

      {message && <div className="bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded-lg">{message}</div>}

      <div className="flex gap-2">
        <button className={tabClass('users')} onClick={() => setActiveTab('users')}>Usuarios</button>
        <button className={tabClass('mypassword')} onClick={() => setActiveTab('mypassword')}>Mi Contraseña</button>
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowForm(!showForm)} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-5 rounded-lg transition text-sm">
              {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
              <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
                <div><label className="block text-lime-300 mb-1 text-sm">Nombre *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className={inp} /></div>
                <div><label className="block text-lime-300 mb-1 text-sm">Email *</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className={inp} /></div>
                <div><label className="block text-lime-300 mb-1 text-sm">Contraseña *</label><input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className={inp} /></div>
                <div><label className="block text-lime-300 mb-1 text-sm">Rol</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={inp}>
                    <option value="agent">Agente</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    <option value="client">Cliente</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-3">
                  <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition">Crear</button>
                  <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">Cancelar</button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id} className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <p className="text-white font-bold">{u.name}</p>
                  <p className="text-gray-400 text-sm">{u.email}</p>
                  <span className={`text-xs font-bold ${roleColor(u.role)}`}>{u.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input type="password" placeholder="Nueva contraseña" value={resetPasswords[u.id] || ''} onChange={e => setResetPasswords({...resetPasswords, [u.id]: e.target.value})}
                    className="bg-gray-900 border border-lime-500/30 rounded-lg px-3 py-1.5 text-white text-sm w-40 focus:outline-none focus:border-lime-400" />
                  <button onClick={() => handleResetPassword(u.id)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-sm transition">Restablecer</button>
                  {u.id !== user?.id && (
                    <button onClick={() => handleDeleteUser(u.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition">Eliminar</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mypassword' && (
        <div className="max-w-md bg-gray-800/50 border border-lime-500/20 rounded-xl p-6">
          <h2 className="text-lime-400 font-bold text-lg mb-4">Cambiar mi contraseña</h2>
          <form onSubmit={handleChangeMyPassword} className="space-y-4">
            <div><label className="block text-lime-300 mb-1 text-sm">Contraseña actual</label><input type="password" value={myPassword.current} onChange={e => setMyPassword({...myPassword, current: e.target.value})} required className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Nueva contraseña</label><input type="password" value={myPassword.new} onChange={e => setMyPassword({...myPassword, new: e.target.value})} required className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Confirmar contraseña</label><input type="password" value={myPassword.confirm} onChange={e => setMyPassword({...myPassword, confirm: e.target.value})} required className={inp} /></div>
            <button type="submit" className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition">Cambiar Contraseña</button>
          </form>
        </div>
      )}
    </div>
  );
}
