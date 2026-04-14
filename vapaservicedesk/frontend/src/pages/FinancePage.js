import React, { useState, useEffect } from 'react';
import { financeAPI, paymentsAPI, clientsAPI } from '../services/api';

const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";

export default function FinancePage() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState('balance');
  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [txForm, setTxForm] = useState({ type: 'income', title: '', amount: '', category: 'other', date: '', description: '' });
  const [payForm, setPayForm] = useState({ title: '', amount: '', category: 'other', recipient: '', scheduled_date: '', recurring: false, recurring_period: '', alert_days_before: 3, notes: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    financeAPI.getBalance().then(setBalance).catch(console.error);
    financeAPI.getTransactions().then(setTransactions).catch(console.error);
    paymentsAPI.getScheduled().then(setPayments).catch(console.error);
    clientsAPI.getAll().then(setClients).catch(console.error);
  }, []);

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    try {
      await financeAPI.createTransaction({ ...txForm, amount: parseFloat(txForm.amount) });
      setShowForm(false);
      setTxForm({ type: 'income', title: '', amount: '', category: 'other', date: '', description: '' });
      financeAPI.getTransactions().then(setTransactions);
      financeAPI.getBalance().then(setBalance);
      setMessage('Transacción registrada');
    } catch { setMessage('Error al registrar'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    try {
      await paymentsAPI.createScheduled({ ...payForm, amount: parseFloat(payForm.amount) });
      setShowPaymentForm(false);
      setPayForm({ title: '', amount: '', category: 'other', recipient: '', scheduled_date: '', recurring: false, recurring_period: '', alert_days_before: 3, notes: '' });
      paymentsAPI.getScheduled().then(setPayments);
      setMessage('Pago programado');
    } catch { setMessage('Error'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const tabClass = (t) => `px-4 py-2 rounded-lg font-bold transition text-sm ${activeTab === t ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'}`;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-lime-400">Balance Financiero</h1>

      {message && <div className="bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded-lg">{message}</div>}

      {balance && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Balance total</p>
            <p className={`text-3xl font-bold mt-1 ${balance.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>{balance.balance.toLocaleString()}€</p>
          </div>
          <div className="bg-gray-800/50 border border-green-500/20 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Ingresos</p>
            <p className="text-3xl font-bold text-green-400 mt-1">{balance.total_income.toLocaleString()}€</p>
          </div>
          <div className="bg-gray-800/50 border border-red-500/20 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Gastos</p>
            <p className="text-3xl font-bold text-red-400 mt-1">{balance.total_expense.toLocaleString()}€</p>
          </div>
          <div className="bg-gray-800/50 border border-yellow-500/20 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Facturas pendientes</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">{balance.invoices_pending_total.toLocaleString()}€</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button className={tabClass('balance')} onClick={() => setActiveTab('balance')}>Transacciones</button>
        <button className={tabClass('payments')} onClick={() => setActiveTab('payments')}>Pagos programados</button>
      </div>

      {activeTab === 'balance' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowForm(!showForm)} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-5 rounded-lg transition text-sm">
              {showForm ? 'Cancelar' : '+ Nueva transacción'}
            </button>
          </div>
          {showForm && (
            <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
              <form onSubmit={handleTxSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lime-300 mb-1 text-sm">Tipo</label>
                  <select value={txForm.type} onChange={e => setTxForm({...txForm, type: e.target.value})} className={inp}>
                    <option value="income">Ingreso</option>
                    <option value="expense">Gasto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lime-300 mb-1 text-sm">Título *</label>
                  <input type="text" value={txForm.title} onChange={e => setTxForm({...txForm, title: e.target.value})} required className={inp} />
                </div>
                <div>
                  <label className="block text-lime-300 mb-1 text-sm">Importe (€) *</label>
                  <input type="number" step="0.01" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} required className={inp} />
                </div>
                <div>
                  <label className="block text-lime-300 mb-1 text-sm">Categoría</label>
                  <select value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value})} className={inp}>
                    <option value="salary">Nómina</option>
                    <option value="services">Servicios</option>
                    <option value="software">Software</option>
                    <option value="hardware">Hardware</option>
                    <option value="rent">Alquiler</option>
                    <option value="taxes">Impuestos</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-lime-300 mb-1 text-sm">Fecha</label>
                  <input type="date" value={txForm.date} onChange={e => setTxForm({...txForm, date: e.target.value})} className={inp} />
                </div>
                <div>
                  <label className="block text-lime-300 mb-1 text-sm">Descripción</label>
                  <input type="text" value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} className={inp} />
                </div>
                <div className="col-span-2 flex gap-3">
                  <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition">Registrar</button>
                  <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">Cancelar</button>
                </div>
              </form>
            </div>
          )}
          <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-lime-500/20">
                  <th className="text-left text-lime-300 text-sm px-4 py-3">Fecha</th>
                  <th className="text-left text-lime-300 text-sm px-4 py-3">Título</th>
                  <th className="text-left text-lime-300 text-sm px-4 py-3">Categoría</th>
                  <th className="text-left text-lime-300 text-sm px-4 py-3">Importe</th>
                  <th className="text-left text-lime-300 text-sm px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-lime-500/10">
                    <td className="px-4 py-3 text-gray-400 text-sm">{tx.date}</td>
                    <td className="px-4 py-3 text-white text-sm">{tx.title}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{tx.category}</td>
                    <td className={`px-4 py-3 font-bold text-sm ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()}€
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={async () => { await financeAPI.deleteTransaction(tx.id); financeAPI.getTransactions().then(setTransactions); financeAPI.getBalance().then(setBalance); }} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {transactions.length === 0 && <p className="text-gray-500 text-center py-8">No hay transacciones</p>}
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowPaymentForm(!showPaymentForm)} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-5 rounded-lg transition text-sm">
              {showPaymentForm ? 'Cancelar' : '+ Programar pago'}
            </button>
          </div>
          {showPaymentForm && (
            <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
              <form onSubmit={handlePaySubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lime-300 mb-1 text-sm">Título *</label>
                  <input type="text" value={payForm.title} onChange={e => setPayForm({...payForm, title: e.target.value})} required className={inp} />
                </div>
                <div>
                  <label className="block text-lime-300 mb-1 text-sm">Importe (€) *</label>
                  <input type="number" step="0.01" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} required className={inp} />
                </div>
                <div>
                  <label className="block text-lime-300 mb-1 text-sm">Destinatario</label>
                  <input type="text" value={payForm.recipient} onChange={e => setPayForm({...payForm, recipient: e.target.value})} className={inp} />
                </div>
                <div>
                  <label className="block text-lime-300 mb-1 text-sm">Fecha *</label>
                  <input type="date" value={payForm.scheduled_date} onChange={e => setPayForm({...payForm, scheduled_date: e.target.value})} required className={inp} />
                </div>
                <div>
                  <label className="block text-lime-300 mb-1 text-sm">Alerta (días antes)</label>
                  <input type="number" value={payForm.alert_days_before} onChange={e => setPayForm({...payForm, alert_days_before: parseInt(e.target.value)})} className={inp} />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-lime-300 text-sm mt-5 cursor-pointer">
                    <input type="checkbox" checked={payForm.recurring} onChange={e => setPayForm({...payForm, recurring: e.target.checked})} className="accent-lime-500" />
                    Pago recurrente
                  </label>
                </div>
                {payForm.recurring && (
                  <div>
                    <label className="block text-lime-300 mb-1 text-sm">Periodicidad</label>
                    <select value={payForm.recurring_period} onChange={e => setPayForm({...payForm, recurring_period: e.target.value})} className={inp}>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensual</option>
                      <option value="yearly">Anual</option>
                    </select>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="block text-lime-300 mb-1 text-sm">Notas</label>
                  <input type="text" value={payForm.notes} onChange={e => setPayForm({...payForm, notes: e.target.value})} className={inp} />
                </div>
                <div className="col-span-2 flex gap-3">
                  <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition">Programar</button>
                  <button type="button" onClick={() => setShowPaymentForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">Cancelar</button>
                </div>
              </form>
            </div>
          )}
          <div className="space-y-3">
            {payments.map(p => (
              <div key={p.id} className={`bg-gray-800/50 border rounded-xl p-4 flex justify-between items-center ${p.status === 'pending' ? 'border-yellow-500/20' : 'border-lime-500/20'}`}>
                <div>
                  <p className="text-white font-bold">{p.title}</p>
                  <p className="text-gray-400 text-sm">{p.recipient && `Para: ${p.recipient} • `}{p.scheduled_date}{p.recurring && ` • Recurrente ${p.recurring_period}`}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-yellow-400 font-bold text-lg">{p.amount.toLocaleString()}€</p>
                  <select value={p.status} onChange={async e => { await paymentsAPI.updateScheduled(p.id, { status: e.target.value }); paymentsAPI.getScheduled().then(setPayments); }} className="bg-gray-800 border border-lime-500/20 rounded px-2 py-1 text-white text-xs">
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                  <button onClick={async () => { await paymentsAPI.deleteScheduled(p.id); setPayments(prev => prev.filter(x => x.id !== p.id)); }} className="text-red-400 hover:text-red-300">✕</button>
                </div>
              </div>
            ))}
            {payments.length === 0 && <p className="text-gray-500 text-center py-8">No hay pagos programados</p>}
          </div>
        </div>
      )}
    </div>
  );
}
