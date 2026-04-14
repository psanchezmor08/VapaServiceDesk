import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ticketsAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";
const priorityColor = (p) => ({ critical: 'bg-red-500/20 text-red-400', high: 'bg-orange-500/20 text-orange-400', medium: 'bg-yellow-500/20 text-yellow-400', low: 'bg-blue-500/20 text-blue-400' }[p] || '');
const statusColor = (s) => ({ open: 'bg-blue-500/20 text-blue-400', in_progress: 'bg-yellow-500/20 text-yellow-400', pending: 'bg-orange-500/20 text-orange-400', resolved: 'bg-green-500/20 text-green-400', closed: 'bg-gray-500/20 text-gray-400' }[s] || '');
const statusLabel = (s) => ({ open: 'Abierto', in_progress: 'En progreso', pending: 'Pendiente', resolved: 'Resuelto', closed: 'Cerrado' }[s] || s);

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isManager } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [users, setUsers] = useState([]);
  const [comment, setComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    ticketsAPI.get(id).then(setTicket).catch(() => navigate('/tickets'));
    usersAPI.getAll().then(setUsers).catch(console.error);
  }, [id]);

  const handleUpdate = async (field, value) => {
    await ticketsAPI.update(id, { [field]: value });
    setTicket(prev => ({ ...prev, [field]: value }));
    setMessage('Actualizado');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    const newComment = await ticketsAPI.addComment(id, { content: comment, is_internal: isInternal });
    setTicket(prev => ({ ...prev, comments: [...(prev.comments || []), newComment] }));
    setComment('');
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este ticket?')) return;
    await ticketsAPI.delete(id);
    navigate('/tickets');
  };

  if (!ticket) return <div className="text-lime-400">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/tickets')} className="text-lime-400 hover:text-lime-300">← Volver</button>
        <h1 className="text-2xl font-bold text-white flex-1">{ticket.title}</h1>
        {isManager() && <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition">Eliminar</button>}
      </div>

      {message && <div className="bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-2 rounded-lg text-sm">{message}</div>}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
            <div className="flex gap-2 mb-3">
              <span className="text-gray-400 text-sm">{ticket.ticket_number}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor(ticket.status)}`}>{statusLabel(ticket.status)}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
            <p className="text-gray-500 text-xs mt-3">Creado: {new Date(ticket.created_at).toLocaleString('es-ES')}</p>
          </div>

          <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
            <h3 className="text-lime-400 font-bold mb-4">Comentarios ({ticket.comments?.length || 0})</h3>
            <div className="space-y-3 mb-4">
              {(ticket.comments || []).map(c => (
                <div key={c.id} className={`rounded-lg p-3 ${c.is_internal ? 'bg-yellow-900/20 border border-yellow-500/20' : 'bg-gray-900/50 border border-lime-500/10'}`}>
                  <div className="flex justify-between mb-1">
                    <span className="text-lime-300 text-sm font-bold">{c.author_name}</span>
                    {c.is_internal && <span className="text-yellow-400 text-xs">Interno</span>}
                    <span className="text-gray-500 text-xs">{new Date(c.created_at).toLocaleString('es-ES')}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{c.content}</p>
                </div>
              ))}
              {(!ticket.comments || ticket.comments.length === 0) && <p className="text-gray-500 text-sm">Sin comentarios</p>}
            </div>
            <form onSubmit={handleComment} className="space-y-2">
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Añadir comentario..." rows={2} className={inp} />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
                  <input type="checkbox" checked={isInternal} onChange={e => setIsInternal(e.target.checked)} className="accent-lime-500" />
                  Nota interna
                </label>
                <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-1.5 px-4 rounded-lg text-sm transition">Comentar</button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5 space-y-4">
            <h3 className="text-lime-400 font-bold">Detalles</h3>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Estado</label>
              <select value={ticket.status} onChange={e => handleUpdate('status', e.target.value)} className={inp}>
                <option value="open">Abierto</option>
                <option value="in_progress">En progreso</option>
                <option value="pending">Pendiente</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Prioridad</label>
              <select value={ticket.priority} onChange={e => handleUpdate('priority', e.target.value)} className={inp}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Asignado a</label>
              <select value={ticket.assigned_to || ''} onChange={e => handleUpdate('assigned_to', e.target.value)} className={inp}>
                <option value="">Sin asignar</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-xs mb-1">Categoría</label>
              <p className="text-white text-sm">{ticket.category}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
