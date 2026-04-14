import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ label, value, icon, color = 'lime', sub }) => (
  <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <p className={`text-3xl font-bold text-${color}-400 mt-1`}>{value}</p>
        {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  </div>
);

const priorityColor = (p) => ({ critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-blue-400' }[p] || 'text-gray-400');
const statusColor = (s) => ({ open: 'text-blue-400', in_progress: 'text-yellow-400', resolved: 'text-green-400', closed: 'text-gray-400' }[s] || 'text-gray-400');
const statusLabel = (s) => ({ open: 'Abierto', in_progress: 'En progreso', pending: 'Pendiente', resolved: 'Resuelto', closed: 'Cerrado' }[s] || s);

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    dashboardAPI.get().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="text-lime-400">Cargando dashboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-lime-400">Dashboard</h1>
        <p className="text-gray-400 mt-1">Bienvenido, {user?.name}</p>
      </div>

      {data.alerts && data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert, i) => (
            <div key={i} className={`border rounded-lg px-4 py-3 flex items-center gap-3 ${alert.type === 'invoice_overdue' ? 'bg-red-900/20 border-red-500/30 text-red-300' : 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300'}`}>
              <span>{alert.type === 'invoice_overdue' ? '⚠️' : '🔔'}</span>
              <span className="text-sm">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tickets abiertos" value={data.tickets.open} icon="🎫" color="blue" />
        <StatCard label="En progreso" value={data.tickets.in_progress} icon="⚡" color="yellow" />
        <StatCard label="Resueltos hoy" value={data.tickets.resolved_today} icon="✅" color="green" />
        <StatCard label="Críticos" value={data.tickets.critical} icon="🚨" color="red" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Clientes activos" value={data.totals.clients} icon="👥" />
        <StatCard label="Trabajadores" value={data.totals.workers} icon="👷" />
        <StatCard label="Proyectos activos" value={data.totals.projects} icon="📁" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lime-400 font-bold text-lg">Tickets recientes</h2>
            <Link to="/tickets" className="text-lime-500 text-sm hover:text-lime-400">Ver todos →</Link>
          </div>
          <div className="space-y-3">
            {data.recent_tickets.map(ticket => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`}
                className="flex justify-between items-start bg-gray-900/50 border border-lime-500/10 rounded-lg p-3 hover:border-lime-500/30 transition block">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{ticket.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{ticket.ticket_number}</p>
                </div>
                <div className="flex flex-col items-end gap-1 ml-3">
                  <span className={`text-xs ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                  <span className={`text-xs ${statusColor(ticket.status)}`}>{statusLabel(ticket.status)}</span>
                </div>
              </Link>
            ))}
            {data.recent_tickets.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No hay tickets</p>}
          </div>
        </div>

        <div className="bg-gray-800/50 border border-lime-500/20 rounded-xl p-5">
          <h2 className="text-lime-400 font-bold text-lg mb-4">Pagos próximos</h2>
          <div className="space-y-3">
            {data.alerts.filter(a => a.type === 'payment_due').map((alert, i) => (
              <div key={i} className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">{alert.message}</p>
              </div>
            ))}
            {data.alerts.filter(a => a.type === 'payment_due').length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">Sin pagos próximos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
