import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ticketsAPI, clientsAPI, usersAPI } from '../services/api';

const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";
const priorityColor = (p) => ({ critical: 'bg-red-500/20 text-red-400', high: 'bg-orange-500/20 text-orange-400', medium: 'bg-yellow-500/20 text-yellow-400', low: 'bg-blue-500/20 text-blue-400' }[p] || '');
const statusColor = (s) => ({ open: 'bg-blue-500/20 text-blue-400', in_progress: 'bg-yellow-500/20 text-yellow-400', pending: 'bg-orange-500/20 text-orange-400', resolved: 'bg-green-500/20 text-green-400', closed: 'bg-gray-500/20 text-gray-400' }[s] || '');
const statusLabel = (s) => ({ open: 'Abierto', in_progress: 'En progreso', pending: 'Pendiente', resolved: 'Resuelto', closed: 'Cerrado' }[s] || s);

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', category: 'general', assigned_to: '', client_id: '', tags: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadTickets();
    clientsAPI.getAll().then(setClients).catch(console.error);
    usersAPI.getAll().then(setUsers).catch(console.error);
  }, [filters]);

  const loadTickets = async () => {
    const f = {};
    if (filters.status) f.status = filters.status;
    if (filters.priority) f.priority = filters.priority;
    const data = await ticketsAPI.getAll(f);
    setTickets(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const created = await ticketsAPI.create(form);
      setShowForm(false);
      setForm({ title: '', description: '', priority: 'medium', category: 'general', assigned_to: '', client_id: '', tags: [] });
      loadTickets();
      setMessage('Ticket creado correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Error al crear el ticket'); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lime-400">Tickets</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-5 rounded-lg transition">
          {showForm ? 'Cancelar' : '+ Nuevo Ticket'}
        </button>
      </div>

      {message && <div className="bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded-lg">{message}</div>}

      {showForm && (
        <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-6">
          <h2 className="text-lime-400 font-bold text-lg mb-4">Nuevo Ticket</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-lime-300 mb-1 text-sm">Título</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className={inp} />
              </div>
              <div className="col-span-2">
                <label className="block text-lime-300 mb-1 text-sm">Descripción</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={3} className={inp} />
              </div>
              <div>
                <label className="block text-lime-300 mb-1 text-sm">Prioridad</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className={inp}>
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-lime-300 mb-1 text-sm">Categoría</label>
                <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className={inp}>
                  <option value="general">General</option>
                  <option value="technical">Técnico</option>
                  <option value="billing">Facturación</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Mejora</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-lime-300 mb-1 text-sm">Asignar a</label>
                <select value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} className={inp}>
                  <option value="">Sin asignar</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-lime-300 mb-1 text-sm">Cliente</label>
                <select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} className={inp}>
                  <option value="">Sin cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">
                {loading ? 'Creando...' : 'Crear Ticket'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="bg-gray-800 border border-lime-500/30 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">Todos los estados</option>
          <option value="open">Abierto</option>
          <option value="in_progress">En progreso</option>
          <option value="pending">Pendiente</option>
          <option value="resolved">Resuelto</option>
          <option value="closed">Cerrado</option>
        </select>
        <select value={filters.priority} onChange={e => setFilters({...filters, priority: e.target.value})} className="bg-gray-800 border border-lime-500/30 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">Todas las prioridades</option>
          <option value="critical">Crítica</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        <span className="text-gray-400 text-sm self-center">{tickets.length} tickets</span>
      </div>

      <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-lime-500/20">
              <th className="text-left text-lime-300 text-sm px-4 py-3">Nº</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Título</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Estado</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Prioridad</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Asignado</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id} onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="border-b border-lime-500/10 hover:bg-gray-700/30 cursor-pointer transition">
                <td className="px-4 py-3 text-gray-400 text-sm">{ticket.ticket_number}</td>
                <td className="px-4 py-3">
                  <p className="text-white text-sm font-medium">{ticket.title}</p>
                  <p className="text-gray-500 text-xs">{ticket.category}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor(ticket.status)}`}>{statusLabel(ticket.status)}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{users.find(u => u.id === ticket.assigned_to)?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(ticket.created_at).toLocaleDateString('es-ES')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {tickets.length === 0 && <p className="text-gray-500 text-center py-8">No hay tickets</p>}
      </div>
    </div>
  );
}
