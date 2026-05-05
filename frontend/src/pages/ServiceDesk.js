import React, { useState, useEffect } from 'react';
import { ticketsAPI, customersAPI, usersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS = { open: '#BFFF00', in_progress: '#4fc3f7', pending: '#ffb74d', closed: '#555' };
const PRIORITY_COLORS = { low: '#4caf50', medium: '#2196f3', high: '#ff9800', urgent: '#f44336' };
const STATUS_LABELS = { open: 'Abierto', in_progress: 'En progreso', pending: 'Pendiente', closed: 'Cerrado' };
const PRIORITY_LABELS = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' };

const Badge = ({ color, label }) => (
  <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, background: color + '22', color, fontSize: 11, fontWeight: 600 }}>{label}</span>
);

export default function ServiceDesk() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [comment, setComment] = useState('');
  const [commentInternal, setCommentInternal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', category: 'support', customer_id: '', assignee_id: '' });

  useEffect(() => { load(); }, [filterStatus, filterPriority]);

  const load = async () => {
    const [t, c] = await Promise.all([
      ticketsAPI.list({ status: filterStatus || undefined, priority: filterPriority || undefined }),
      customersAPI.list()
    ]);
    setTickets(t);
    setCustomers(c);
    try { const u = await usersAPI.list(); setUsers(u); } catch {}
  };

  const createTicket = async (e) => {
    e.preventDefault();
    await ticketsAPI.create(form);
    setShowCreate(false);
    setForm({ title: '', description: '', priority: 'medium', category: 'support', customer_id: '', assignee_id: '' });
    load();
  };

  const updateStatus = async (id, status) => {
    await ticketsAPI.update(id, { status });
    if (selected?.id === id) setSelected(await ticketsAPI.get(id));
    load();
  };

  const openTicket = async (ticket) => {
    const full = await ticketsAPI.get(ticket.id);
    setSelected(full);
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    await ticketsAPI.addComment(selected.id, { text: comment, internal: commentInternal });
    setComment('');
    setSelected(await ticketsAPI.get(selected.id));
  };

  const input = { background: '#111', border: '1px solid #222', borderRadius: 8, color: '#fff', padding: '8px 12px', fontSize: 14, width: '100%', boxSizing: 'border-box' };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#BFFF00' }}>Service Desk</h1>
          <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{tickets.length} tickets</div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ padding: '10px 20px', background: '#BFFF00', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
          + Nuevo ticket
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...input, width: 160 }}>
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ ...input, width: 160 }}>
          <option value="">Todas las prioridades</option>
          {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          {tickets.map(ticket => (
            <div key={ticket.id} onClick={() => openTicket(ticket)} style={{
              background: '#0d0d14', border: `1px solid ${selected?.id === ticket.id ? '#BFFF00' : '#1a1a2e'}`,
              borderRadius: 10, padding: 16, marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.15s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: '#555' }}>{ticket.number}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Badge color={PRIORITY_COLORS[ticket.priority]} label={PRIORITY_LABELS[ticket.priority]} />
                  <Badge color={STATUS_COLORS[ticket.status]} label={STATUS_LABELS[ticket.status]} />
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>{ticket.title}</div>
              <div style={{ fontSize: 12, color: '#444' }}>{new Date(ticket.created_at).toLocaleDateString('es-ES')}</div>
            </div>
          ))}
          {tickets.length === 0 && <div style={{ textAlign: 'center', color: '#444', padding: 40 }}>No hay tickets</div>}
        </div>

        {selected && (
          <div style={{ width: 400, background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 10, padding: 20, height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#555' }}>{selected.number}</div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>{selected.title}</h3>
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              <Badge color={PRIORITY_COLORS[selected.priority]} label={PRIORITY_LABELS[selected.priority]} />
              <Badge color={STATUS_COLORS[selected.status]} label={STATUS_LABELS[selected.status]} />
            </div>
            {selected.description && <p style={{ fontSize: 13, color: '#aaa', marginBottom: 16 }}>{selected.description}</p>}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Cambiar estado</label>
              <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)} style={{ ...input }}>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div style={{ borderTop: '1px solid #1a1a2e', paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: '#aaa' }}>Comentarios</div>
              {(selected.comments || []).map((c, i) => (
                <div key={i} style={{ marginBottom: 10, padding: 10, background: c.internal ? '#1a1a0a' : '#111', border: `1px solid ${c.internal ? '#333300' : '#1a1a2e'}`, borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{c.author_name} · {c.internal ? 'Interno' : 'Externo'}</div>
                  <div style={{ fontSize: 13 }}>{c.text}</div>
                </div>
              ))}
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Añadir comentario..." rows={3}
                style={{ ...input, marginBottom: 8, resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={commentInternal} onChange={e => setCommentInternal(e.target.checked)} />
                  Interno
                </label>
                <button onClick={addComment} style={{ flex: 1, padding: '8px', background: '#BFFF00', color: '#000', border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  Enviar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 12, padding: 32, width: 500 }}>
            <h2 style={{ margin: '0 0 20px', color: '#BFFF00', fontSize: 18 }}>Nuevo ticket</h2>
            <form onSubmit={createTicket} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Título *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={input} /></div>
              <div><label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Descripción</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...input, resize: 'vertical' }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Prioridad</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} style={input}>
                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select></div>
                <div><label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Categoría</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={input}>
                    <option value="support">Soporte</option>
                    <option value="incident">Incidencia</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select></div>
              </div>
              <div><label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 6 }}>Cliente</label>
                <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })} style={input}>
                  <option value="">Sin cliente</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select></div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={() => setShowCreate(false)} style={{ flex: 1, padding: 10, background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: 8, cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ flex: 1, padding: 10, background: '#BFFF00', color: '#000', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}