import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";
const statusColor = (s) => ({ draft: 'bg-gray-500/20 text-gray-400', sent: 'bg-blue-500/20 text-blue-400', paid: 'bg-green-500/20 text-green-400', overdue: 'bg-red-500/20 text-red-400' }[s] || '');
const statusLabel = (s) => ({ draft: 'Borrador', sent: 'Enviada', paid: 'Pagada', overdue: 'Vencida' }[s] || s);

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', client_name: '', amount: '', tax: 21, due_date: '', notes: '' });
  const [message, setMessage] = useState('');

  useEffect(() => { loadInvoices(); }, []);

  const loadInvoices = async () => {
    try {
      const res = await axios.get(`${API}/invoices`, { headers: getHeaders() });
      setInvoices(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const amount = parseFloat(form.amount);
      const tax = parseFloat(form.tax);
      const total = amount + (amount * tax / 100);
      await axios.post(`${API}/invoices`, { ...form, amount, tax, total }, { headers: getHeaders() });
      setForm({ title: '', client_name: '', amount: '', tax: 21, due_date: '', notes: '' });
      setShowForm(false);
      loadInvoices();
      setMessage('Factura creada');
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Error al crear la factura'); }
  };

  const handleStatus = async (id, status) => {
    try {
      await axios.put(`${API}/invoices/${id}`, { status }, { headers: getHeaders() });
      loadInvoices();
    } catch { console.error('Error'); }
  };

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
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div><label className="block text-lime-300 mb-1 text-sm">Título *</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Cliente</label><input type="text" value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Importe (€) *</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">IVA (%)</label><input type="number" value={form.tax} onChange={e => setForm({...form, tax: e.target.value})} className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Fecha vencimiento</label><input type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Notas</label><input type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={inp} /></div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition">Crear</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-lime-500/20">
              <th className="text-left text-lime-300 text-sm px-4 py-3">Título</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Cliente</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Total</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Estado</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Vencimiento</th>
              <th className="text-left text-lime-300 text-sm px-4 py-3">Acción</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-lime-500/10">
                <td className="px-4 py-3 text-white text-sm">{inv.title}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{inv.client_name || '—'}</td>
                <td className="px-4 py-3 text-lime-400 font-bold text-sm">{inv.total?.toFixed(2)}€</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full ${statusColor(inv.status)}`}>{statusLabel(inv.status)}</span></td>
                <td className="px-4 py-3 text-gray-400 text-xs">{inv.due_date || '—'}</td>
                <td className="px-4 py-3">
                  <select value={inv.status} onChange={e => handleStatus(inv.id, e.target.value)} className="bg-gray-800 border border-lime-500/20 rounded px-2 py-1 text-white text-xs">
                    <option value="draft">Borrador</option>
                    <option value="sent">Enviada</option>
                    <option value="paid">Pagada</option>
                    <option value="overdue">Vencida</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && <p className="text-gray-500 text-center py-8">No hay facturas</p>}
      </div>
    </div>
  );
}
