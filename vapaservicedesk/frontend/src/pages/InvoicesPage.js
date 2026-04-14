import React, { useState, useEffect } from 'react';
import { invoicesAPI, clientsAPI, projectsAPI } from '../services/api';

const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";
const statusColor = (s) => ({ draft: 'bg-gray-500/20 text-gray-400', sent: 'bg-blue-500/20 text-blue-400', paid: 'bg-green-500/20 text-green-400', overdue: 'bg-red-500/20 text-red-400', cancelled: 'bg-gray-500/20 text-gray-500' }[s] || '');
const statusLabel = (s) => ({ draft: 'Borrador', sent: 'Enviada', paid: 'Pagada', overdue: 'Vencida', cancelled: 'Cancelada' }[s] || s);

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ client_id: '', project_id: '', title: '', items: [], tax: 0, due_date: '', notes: '', alert_days_before: 3 });
  const [newItem, setNewItem] = useState({ description: '', quantity: 1, price: 0 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    invoicesAPI.getAll().then(setInvoices).catch(console.error);
    clientsAPI.getAll().then(setClients).catch(console.error);
    projectsAPI.getAll().then(setProjects).catch(console.error);
  }, []);

  const addItem = () => {
    if (!newItem.description) return;
    setForm({...form, items: [...form.items, { ...newItem, price: parseFloat(newItem.price), quantity: parseInt(newItem.quantity) }]});
    setNewItem({ description: '', quantity: 1, price: 0 });
  };

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.price, 0);
  const total = subtotal + subtotal * form.tax / 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await invoicesAPI.create({ ...form, tax: parseFloat(form.tax) });
      setShowForm(false);
      setForm({ client_id: '', project_id: '', title: '', items: [], tax: 0, due_date: '', notes: '', alert_days_before: 3 });
      invoicesAPI.getAll().then(setInvoices);
      setMessage('Factura creada');
    } catch { setMessage('Error al crear factura'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleStatusChange = async (id, status) => {
    await invoicesAPI.update(id, { status });
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  const filtered = filter ? invoices.filter(inv => inv.status === filter) : invoices;
  const clientName = (id) => clients.find(c => c.id === id)?.name || '—';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lime-400">Facturas</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-5 rounded-lg transition">
          {showForm ? 'Cancelar' : '+ Nueva Factura'}
        </button>
      </div>

      {message && <div className="bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded-lg">{message}</div>}

      {showForm && (
        <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-6">
          <h2 className="text-lime-400 font-bold text-lg mb-4">Nueva Factura</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lime-300 mb-1 text-sm">Título *</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className={inp} />
              </div>
              <div>
                <label className="block text-lime-300 mb-1 text-sm">Cliente</label>
                <select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} className={inp}>
                  <option value="">Sin cliente</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-lime-300 mb-1 text-sm">Proyecto</label>
                <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} className={inp}>
                  <option value="">Sin proyecto</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-lime-300 mb-1 text-sm">Fecha vencimiento</label>
                <input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className={inp} />
              </div>
              <div>
                <label className="block text-lime-300 mb-1 text-sm">IVA (%)</label>
                <input type="number" value={form.tax} onChange={e => setForm({...form, tax: e.target.value})} className={inp} />
              </div>
              <div>
                <label className="block text-lime-300 mb-1 text-sm">Alerta (días antes)</label>
                <input type="number" value={form.alert_days_before} onChange={e => setForm({...form, alert_days_before: parseInt(e.target.value)})} className={inp} />
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-4">
              <h3 className="text-lime-300 font-bold mb-3 text-sm">Líneas de factura</h3>
              <div className="grid grid-cols-4 gap-2 mb-3">
                <input type="text" placeholder="Descripción" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className={`col-span-2 ${inp}`} />
                <input type="number" placeholder="Cantidad" value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: e.target.value})} className={inp} />
                <input type="number" placeholder="Precio €" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className={inp} />
              </div>
              <button type="button" onClick={addItem} className="bg-lime-500/20 text-lime-400 hover:bg-lime-500/30 px-4 py-1.5 rounded-lg text-sm transition mb-3">+ Añadir línea</button>
              {form.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-800 rounded-lg px-3 py-2 mb-2 text-sm">
                  <span className="text-white flex-1">{item.description}</span>
                  <span className="text-gray-400 mx-3">{item.quantity} x {item.price}€</span>
                  <span className="text-lime-400 font-bold">{(item.quantity * item.price).toFixed(2)}€</span>
                  <button type="button" onClick={() => setForm({...form, items: form.items.filter((_, j) => j !== i)})} className="text-red-400 ml-3">✕</button>
                </div>
              ))}
              <div className="text-right mt-3 space-y-1 text-sm">
                <p className="text-gray-400">Subtotal: <span className="text-white">{subtotal.toFixed(2)}€</span></p>
                <p className="text-gray-400">IVA ({form.tax}%): <span className="text-white">{(subtotal * form.tax / 100).toFixed(2)}€</span></p>
                <p className="text-lime-400 font-bold text-lg">Total: {total.toFixed(2)}€</p>
              </div>
            </div>

            <div>
              <label className="block text-lime-300 mb-1 text-sm">Notas</label>
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} className={inp} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition">Crear Factura</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {['', 'draft', 'sent', 'paid', 'overdue', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm transition ${filter === s ? 'bg-lime-500 text-gray-900 font-bold' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
            {s === '' ? 'Todas' : statusLabel(s)}
          </button>
        ))}
      </div>

      <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-lime-500/20">
              <th className="text-left text-lime-300 text-sm px-4 py-3">Nº</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Título</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Cliente</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Total</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Estado</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Vencimiento</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id} className="border-b border-lime-500/10">
                <td className="px-4 py-3 text-gray-400 text-sm">{inv.invoice_number}</td>
                <td className="px-4 py-3 text-white text-sm">{inv.title}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{clientName(inv.client_id)}</td>
                <td className="px-4 py-3 text-lime-400 font-bold text-sm">{inv.total.toFixed(2)}€</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusColor(inv.status)}`}>{statusLabel(inv.status)}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{inv.due_date || '—'}</td>
                <td className="px-4 py-3">
                  <select value={inv.status} onChange={e => handleStatusChange(inv.id, e.target.value)} className="bg-gray-800 border border-lime-500/20 rounded px-2 py-1 text-white text-xs">
                    <option value="draft">Borrador</option>
                    <option value="sent">Enviada</option>
                    <option value="paid">Pagada</option>
                    <option value="overdue">Vencida</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-gray-500 text-center py-8">No hay facturas</p>}
      </div>
    </div>
  );
}
