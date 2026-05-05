import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL + '/api';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: '', position: '', salary: '', start_date: '' });
  const [message, setMessage] = useState('');

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`, { headers: getHeaders() });
      setEmployees(res.data);
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/employees`, { ...form, salary: form.salary ? parseFloat(form.salary) : null }, { headers: getHeaders() });
      setForm({ name: '', email: '', phone: '', department: '', position: '', salary: '', start_date: '' });
      setShowForm(false);
      loadEmployees();
      setMessage('Empleado creado');
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Error al crear el empleado'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este empleado?')) return;
    try {
      await axios.delete(`${API}/employees/${id}`, { headers: getHeaders() });
      loadEmployees();
    } catch { setMessage('Error al eliminar'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lime-400">Empleados</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-5 rounded-lg transition">
          {showForm ? 'Cancelar' : '+ Nuevo Empleado'}
        </button>
      </div>

      {message && <div className="bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded-lg">{message}</div>}

      {showForm && (
        <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div><label className="block text-lime-300 mb-1 text-sm">Nombre *</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Email *</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Teléfono</label><input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Departamento</label><input type="text" value={form.department} onChange={e => setForm({...form, department: e.target.value})} className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Cargo</label><input type="text" value={form.position} onChange={e => setForm({...form, position: e.target.value})} className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Salario (€/mes)</label><input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} className={inp} /></div>
            <div><label className="block text-lime-300 mb-1 text-sm">Fecha incorporación</label><input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className={inp} /></div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition">Crear</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(emp => (
          <div key={emp.id} className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lime-400 font-bold">{emp.name}</h3>
                <p className="text-gray-400 text-sm">{emp.position}</p>
              </div>
              <span className="bg-lime-500/10 text-lime-400 text-xs px-2 py-1 rounded-full">{emp.department}</span>
            </div>
            <p className="text-gray-400 text-sm">📧 {emp.email}</p>
            {emp.phone && <p className="text-gray-400 text-sm">📞 {emp.phone}</p>}
            {emp.salary && <p className="text-gray-300 text-sm">💰 {emp.salary.toLocaleString()}€/mes</p>}
            {emp.start_date && <p className="text-gray-500 text-xs mt-1">Desde: {emp.start_date}</p>}
            <button onClick={() => handleDelete(emp.id)} className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-sm transition">Eliminar</button>
          </div>
        ))}
        {employees.length === 0 && <div className="col-span-3 text-center text-gray-500 py-8">No hay empleados</div>}
      </div>
    </div>
  );
}
