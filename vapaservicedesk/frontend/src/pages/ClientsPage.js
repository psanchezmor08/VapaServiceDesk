import React, { useState, useEffect } from 'react';
import { clientsAPI } from '../services/api';

const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company_name: '', address: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { clientsAPI.getAll().then(setClients).catch(console.error); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingClient) {
        await clientsAPI.update(editingClient.id, form);
        setMessage('Cliente actualizado');
      } else {
        await clientsAPI.create(form);
        setMessage('Cliente creado');
      }
      setShowForm(false); setEditingClient(null);
      setForm({ name: '', email: '', phone: '', company_name: '', address: '', notes: '' });
      clientsAPI.getAll().then(setClients);
    } catch { setMessage('Error al guardar el cliente'); }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setForm({ name: client.name, email: client.email || '', phone: client.phone || '', company_name: client.company_name || '', address: client.address || '', notes: client.notes || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    await clientsAPI.delete(id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()) || c.company_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lime-400">Clientes</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingClient(null); setForm({ name: '', email: '', phone: '', company_name: '', address: '', notes: '' }); }}
          className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-5 rounded-lg transition">
          {showForm ? 'Cancelar' : '+ Nuevo Cliente'}
        </button>
      </div>

      {message && <div className="bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded-lg">{message}</div>}

      {showForm && (
        <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-6">
          <h2 className="text-lime-400 font-bold text-lg mb-4">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Empresa</label>
              <input type="text" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Teléfono</label>
              <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inp} />
            </div>
            <div className="col-span-2">
              <label className="block text-lime-300 mb-1 text-sm">Dirección</label>
              <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={inp} />
            </div>
            <div className="col-span-2">
              <label className="block text-lime-300 mb-1 text-sm">Notas</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className={inp} />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">
                {loading ? 'Guardando...' : editingClient ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingClient(null); }} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar clientes..." className="bg-gray-800 border border-lime-500/30 rounded-lg px-4 py-2 text-white w-full max-w-sm text-sm focus:outline-none focus:border-lime-400" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(client => (
          <div key={client.id} className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lime-400 font-bold">{client.name}</h3>
                {client.company_name && <p className="text-gray-400 text-sm">{client.company_name}</p>}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${client.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {client.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            {client.email && <p className="text-gray-400 text-sm">📧 {client.email}</p>}
            {client.phone && <p className="text-gray-400 text-sm">📞 {client.phone}</p>}
            {client.address && <p className="text-gray-400 text-sm">📍 {client.address}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEdit(client)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-sm transition">Editar</button>
              <button onClick={() => handleDelete(client.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-sm transition">Eliminar</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-3 text-center text-gray-500 py-8">No hay clientes</div>}
      </div>
    </div>
  );
}
