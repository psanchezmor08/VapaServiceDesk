import React, { useState, useEffect } from 'react';
import { workersAPI } from '../services/api';

const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";

export default function WorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: 'general', position: '', salary: '', start_date: '', skills: [] });
  const [skillInput, setSkillInput] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { workersAPI.getAll().then(setWorkers).catch(console.error); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const data = { ...form, salary: form.salary ? parseFloat(form.salary) : null };
      if (editingWorker) {
        await workersAPI.update(editingWorker.id, data);
        setMessage('Trabajador actualizado');
      } else {
        await workersAPI.create(data);
        setMessage('Trabajador creado');
      }
      setShowForm(false); setEditingWorker(null);
      setForm({ name: '', email: '', phone: '', department: 'general', position: '', salary: '', start_date: '', skills: [] });
      workersAPI.getAll().then(setWorkers);
    } catch { setMessage('Error al guardar'); }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleEdit = (w) => {
    setEditingWorker(w);
    setForm({ name: w.name, email: w.email, phone: w.phone || '', department: w.department, position: w.position, salary: w.salary || '', start_date: w.start_date || '', skills: w.skills || [] });
    setShowForm(true);
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({...form, skills: [...form.skills, skillInput.trim()]});
      setSkillInput('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lime-400">Trabajadores</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingWorker(null); setForm({ name: '', email: '', phone: '', department: 'general', position: '', salary: '', start_date: '', skills: [] }); }}
          className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-5 rounded-lg transition">
          {showForm ? 'Cancelar' : '+ Nuevo Trabajador'}
        </button>
      </div>

      {message && <div className="bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded-lg">{message}</div>}

      {showForm && (
        <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-6">
          <h2 className="text-lime-400 font-bold text-lg mb-4">{editingWorker ? 'Editar Trabajador' : 'Nuevo Trabajador'}</h2>
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
              <label className="block text-lime-300 mb-1 text-sm">Teléfono</label>
              <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Departamento</label>
              <input type="text" value={form.department} onChange={e => setForm({...form, department: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Cargo</label>
              <input type="text" value={form.position} onChange={e => setForm({...form, position: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Salario (€/mes)</label>
              <input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Fecha incorporación</label>
              <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Habilidades</label>
              <div className="flex gap-2">
                <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Añadir skill..." className={inp} />
                <button type="button" onClick={addSkill} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold px-3 rounded-lg">+</button>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {form.skills.map(s => (
                  <span key={s} className="bg-lime-500/20 text-lime-400 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    {s} <button type="button" onClick={() => setForm({...form, skills: form.skills.filter(sk => sk !== s)})} className="text-lime-300 hover:text-white">✕</button>
                  </span>
                ))}
              </div>
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition disabled:opacity-50">
                {loading ? 'Guardando...' : editingWorker ? 'Actualizar' : 'Crear'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingWorker(null); }} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map(w => (
          <div key={w.id} className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lime-400 font-bold">{w.name}</h3>
                <p className="text-gray-400 text-sm">{w.position}</p>
              </div>
              <span className="bg-lime-500/10 text-lime-400 text-xs px-2 py-1 rounded-full">{w.department}</span>
            </div>
            <p className="text-gray-400 text-sm">📧 {w.email}</p>
            {w.phone && <p className="text-gray-400 text-sm">📞 {w.phone}</p>}
            {w.salary && <p className="text-gray-300 text-sm">💰 {w.salary.toLocaleString()}€/mes</p>}
            {w.start_date && <p className="text-gray-400 text-xs mt-1">Desde: {w.start_date}</p>}
            {w.skills && w.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {w.skills.map(s => <span key={s} className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">{s}</span>)}
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <button onClick={() => handleEdit(w)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-sm transition">Editar</button>
              <button onClick={async () => { if (window.confirm('¿Eliminar?')) { await workersAPI.delete(w.id); setWorkers(prev => prev.filter(x => x.id !== w.id)); }}} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-sm transition">Eliminar</button>
            </div>
          </div>
        ))}
        {workers.length === 0 && <div className="col-span-3 text-center text-gray-500 py-8">No hay trabajadores</div>}
      </div>
    </div>
  );
}
