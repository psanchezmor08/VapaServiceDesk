import React, { useState, useEffect } from 'react';
import { projectsAPI, clientsAPI, workersAPI } from '../services/api';

const inp = "w-full bg-gray-900 border border-lime-500/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-lime-400 text-sm";
const statusColor = (s) => ({ active: 'bg-green-500/20 text-green-400', completed: 'bg-blue-500/20 text-blue-400', on_hold: 'bg-yellow-500/20 text-yellow-400', cancelled: 'bg-red-500/20 text-red-400' }[s] || '');

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ client_id: '', name: '', description: '', status: 'active', budget: '', start_date: '', end_date: '', assigned_workers: [] });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'pending', priority: 'medium', assigned_to: '', due_date: '' });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    projectsAPI.getAll().then(setProjects).catch(console.error);
    clientsAPI.getAll().then(setClients).catch(console.error);
    workersAPI.getAll().then(setWorkers).catch(console.error);
  }, []);

  const loadTasks = async (projectId) => {
    const data = await projectsAPI.getTasks(projectId);
    setTasks(data);
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, budget: form.budget ? parseFloat(form.budget) : null };
      await projectsAPI.create(data);
      setShowForm(false);
      setForm({ client_id: '', name: '', description: '', status: 'active', budget: '', start_date: '', end_date: '', assigned_workers: [] });
      projectsAPI.getAll().then(setProjects);
      setMessage('Proyecto creado');
    } catch { setMessage('Error al crear el proyecto'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await projectsAPI.createTask(selectedProject.id, taskForm);
      setTaskForm({ title: '', description: '', status: 'pending', priority: 'medium', assigned_to: '', due_date: '' });
      setShowTaskForm(false);
      loadTasks(selectedProject.id);
      setMessage('Tarea creada');
    } catch { setMessage('Error al crear tarea'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    loadTasks(project.id);
    setShowForm(false);
  };

  const clientName = (id) => clients.find(c => c.id === id)?.name || '—';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-lime-400">Proyectos</h1>
        <button onClick={() => { setShowForm(!showForm); setSelectedProject(null); }} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-5 rounded-lg transition">
          {showForm ? 'Cancelar' : '+ Nuevo Proyecto'}
        </button>
      </div>

      {message && <div className="bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded-lg">{message}</div>}

      {showForm && (
        <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-6">
          <h2 className="text-lime-400 font-bold text-lg mb-4">Nuevo Proyecto</h2>
          <form onSubmit={handleProjectSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Cliente *</label>
              <select value={form.client_id} onChange={e => setForm({...form, client_id: e.target.value})} required className={inp}>
                <option value="">Seleccionar cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Nombre *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className={inp} />
            </div>
            <div className="col-span-2">
              <label className="block text-lime-300 mb-1 text-sm">Descripción</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Estado</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={inp}>
                <option value="active">Activo</option>
                <option value="completed">Completado</option>
                <option value="on_hold">En espera</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Presupuesto (€)</label>
              <input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Fecha inicio</label>
              <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className={inp} />
            </div>
            <div>
              <label className="block text-lime-300 mb-1 text-sm">Fecha fin</label>
              <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className={inp} />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition">Crear Proyecto</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {projects.map(p => (
            <div key={p.id} onClick={() => handleSelectProject(p)}
              className={`bg-gray-800/50 border rounded-xl p-4 cursor-pointer transition ${selectedProject?.id === p.id ? 'border-lime-500' : 'border-lime-500/20 hover:border-lime-500/40'}`}>
              <div className="flex justify-between items-start">
                <h3 className="text-lime-400 font-bold text-sm">{p.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(p.status)}`}>{p.status}</span>
              </div>
              <p className="text-gray-400 text-xs mt-1">{clientName(p.client_id)}</p>
              {p.budget && <p className="text-gray-300 text-xs mt-1">💰 {p.budget.toLocaleString()}€</p>}
            </div>
          ))}
          {projects.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No hay proyectos</p>}
        </div>

        {selectedProject && (
          <div className="lg:col-span-2 bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lime-400 font-bold text-xl">{selectedProject.name}</h2>
                <p className="text-gray-400 text-sm">{clientName(selectedProject.client_id)}</p>
              </div>
              <button onClick={() => setShowTaskForm(!showTaskForm)} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-1.5 px-4 rounded-lg text-sm transition">+ Tarea</button>
            </div>
            {selectedProject.description && <p className="text-gray-300 text-sm mb-4">{selectedProject.description}</p>}
            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
              {selectedProject.budget && <div className="bg-gray-900/50 rounded-lg p-3"><p className="text-gray-400 text-xs">Presupuesto</p><p className="text-white font-bold">{selectedProject.budget.toLocaleString()}€</p></div>}
              {selectedProject.start_date && <div className="bg-gray-900/50 rounded-lg p-3"><p className="text-gray-400 text-xs">Inicio</p><p className="text-white">{selectedProject.start_date}</p></div>}
              {selectedProject.end_date && <div className="bg-gray-900/50 rounded-lg p-3"><p className="text-gray-400 text-xs">Fin</p><p className="text-white">{selectedProject.end_date}</p></div>}
            </div>

            {showTaskForm && (
              <form onSubmit={handleTaskSubmit} className="bg-gray-900/50 rounded-xl p-4 mb-4 space-y-3">
                <input type="text" placeholder="Título de la tarea" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required className={inp} />
                <textarea placeholder="Descripción" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows={2} className={inp} />
                <div className="grid grid-cols-2 gap-3">
                  <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className={inp}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                  <select value={taskForm.assigned_to} onChange={e => setTaskForm({...taskForm, assigned_to: e.target.value})} className={inp}>
                    <option value="">Sin asignar</option>
                    {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-1.5 px-4 rounded-lg text-sm transition">Crear</button>
                  <button type="button" onClick={() => setShowTaskForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white py-1.5 px-4 rounded-lg text-sm transition">Cancelar</button>
                </div>
              </form>
            )}

            <h3 className="text-lime-300 font-bold mb-3">Tareas ({tasks.length})</h3>
            <div className="space-y-2">
              {tasks.map(task => (
                <div key={task.id} className="bg-gray-900/50 border border-lime-500/10 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-white text-sm font-medium">{task.title}</p>
                    {task.description && <p className="text-gray-400 text-xs">{task.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={task.status} onChange={async e => { await projectsAPI.updateTask(selectedProject.id, task.id, { status: e.target.value }); loadTasks(selectedProject.id); }}
                      className="bg-gray-800 border border-lime-500/20 rounded px-2 py-1 text-white text-xs">
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En progreso</option>
                      <option value="completed">Completada</option>
                    </select>
                    <button onClick={async () => { await projectsAPI.deleteTask(selectedProject.id, task.id); loadTasks(selectedProject.id); }} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-gray-500 text-sm">Sin tareas</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
