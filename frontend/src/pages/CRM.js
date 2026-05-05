import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";

export default function CRM() {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' });
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    try {
      const res = await axios.get(`${API}/clients`, { headers: getHeaders() });
      setClients(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/clients`, form, { headers: getHeaders() });
      setForm({ name: '', email: '', phone: '', company: '', notes: '' });
      setShowForm(false);
      loadClients();
      setMessage('Cliente creado correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Error al crear el cliente'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    try {
      await axios.delete(`${API}/clients/${id}`, { headers: getHeaders() });
      loadClients();
    } catch { setMessage('Error al eliminar'); }
  };

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lime-400">CRM — Clientes</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-5 rounded-lg transition">
          {showForm ? 'Cancelar' : '+ Nuevo Cliente'}
        </button>
      </div>

      {message && <div className="bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded-lg">{message}</div>}

      {showForm && (
        <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div><label className="block text-lime-300 mb-1 text-sm">Nombre *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Empresa</label><input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Email</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Teléfono</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inp} /></div>
            <div className="col-span-2"><label className="block text-lime-300 mb-1 text-sm">Notas</label><textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className={inp} /></div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition">Crear</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar clientes..." className="bg-gray-800 border border-lime-500/30 rounded-lg px-4 py-2 text-white w-full max-w-sm text-sm focus:outline-none focus:border-lime-400" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lime-400 font-bold">{c.name}</h3>
                {c.company && <p className="text-gray-400 text-sm">{c.company}</p>}
              </div>
            </div>
            {c.email && <p className="text-gray-400 text-sm">📧 {c.email}</p>}
            {c.phone && <p className="text-gray-400 text-sm">📞 {c.phone}</p>}
            {c.notes && <p className="text-gray-500 text-xs mt-2">{c.notes}</p>}
            <button onClick={() => handleDelete(c.id)} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-sm transition">Eliminar</button>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-3 text-center text-gray-500 py-8">No hay clientes</div>}
      </div>
    </div>
  );
}
