import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";
const roleColor = (r) => ({ superadmin: 'text-red-400', admin: 'text-orange-400', manager: 'text-yellow-400', agent: 'text-lime-400', client: 'text-blue-400' }[r] || 'text-gray-400');

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'agent', department: '' });
  const [resetPasswords, setResetPasswords] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => { usersAPI.getAll().then(setUsers).catch(console.error); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await usersAPI.create(form);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'agent', department: '' });
      usersAPI.getAll().then(setUsers);
      setMessage('Usuario creado');
    } catch (err) { setMessage(err.response?.data?.detail || 'Error al crear'); }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleReset = async (userId) => {
    const pass = resetPasswords[userId];
    if (!pass || pass.length < 6) { setMessage('Mínimo 6 caracteres'); setTimeout(() => setMessage(''), 3000); return; }
    try {
      await usersAPI.resetPassword(userId, pass);
      setResetPasswords({...resetPasswords, [userId]: ''});
      setMessage('Contraseña restablecida');
    } catch { setMessage('Error'); }
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lime-400">Usuarios</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-5 rounded-lg transition">
          {showForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {message && <div className="bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded-lg">{message}</div>}

      {showForm && (
        <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-6">
          <h2 className="text-lime-400 font-bold text-lg mb-4">Nuevo Usuario</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Contraseña *</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Rol</label>
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className={inp}>
                <option value="agent">Agente</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrador</option>
                <option value="client">Cliente</option>
              </select>
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Departamento</label>
              <input type="text" value={form.department} onChange={e => setForm({...form, department: e.target.value})} className={inp} />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
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
              <div className="flex gap-3 mt-1">
                <span className={`text-xs font-bold ${roleColor(u.role)}`}>{u.role}</span>
                {u.department && <span className="text-gray-500 text-xs">{u.department}</span>}
                <span className={`text-xs ${u.active ? 'text-green-400' : 'text-red-400'}`}>{u.active ? 'Activo' : 'Inactivo'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="password" placeholder="Nueva contraseña" value={resetPasswords[u.id] || ''} onChange={e => setResetPasswords({...resetPasswords, [u.id]: e.target.value})}
                className="bg-gray-900 border border-lime-500/30 rounded-lg px-3 py-1.5 text-white text-sm w-40 focus:outline-none focus:border-lime-400" />
              <button onClick={() => handleReset(u.id)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-sm transition">Restablecer</button>
              {u.id !== currentUser?.id && (
                <button onClick={async () => { if (window.confirm('¿Eliminar este usuario?')) { await usersAPI.delete(u.id); setUsers(prev => prev.filter(x => x.id !== u.id)); }}}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm transition">Eliminar</button>
              )}
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-gray-500 text-center py-8">No hay usuarios</p>}
      </div>
    </div>
  );
}
