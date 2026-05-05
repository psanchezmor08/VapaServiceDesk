import React, { useState, useEffect } from 'react';
import { ticketsAPI, customersAPI, invoicesAPI, employeesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const StatCard = ({ label, value, color = '#BFFF00' }) => (
  <div style={{ background: '#0d0d14', border: '1px solid #1a1a2e', borderRadius: 10, padding: '20px 24px' }}>
    <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tickets: 0, customers: 0, invoices: 0, employees: 0, openTickets: 0, urgentTickets: 0 });

  useEffect(() => {
    Promise.all([
      ticketsAPI.list(),
      customersAPI.list(),
      invoicesAPI.list(),
      employeesAPI.list(),
    ]).then(([tickets, customers, invoices, employees]) => {
      setStats({
        tickets: tickets.length,
        customers: customers.length,
        invoices: invoices.length,
        employees: employees.length,
        openTickets: tickets.filter(t => t.status === 'open').length,
        urgentTickets: tickets.filter(t => t.priority === 'urgent').length,
      });
    }).catch(() => {});
  }, []);

  return (
    <div style={{ color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#BFFF00', marginBottom: 4 }}>Dashboard</h1>
      <p style={{ color: '#555', marginBottom: 28, fontSize: 14 }}>Bienvenido, {user?.full_name}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Clientes" value={stats.customers} />
        <StatCard label="Tickets abiertos" value={stats.openTickets} color="#4fc3f7" />
        <StatCard label="Tickets urgentes" value={stats.urgentTickets} color="#f44336" />
        <StatCard label="Facturas" value={stats.invoices} />
        <StatCard label="Empleados" value={stats.employees} />
        <StatCard label="Total tickets" value={stats.tickets} color="#aaa" />
      </div>
    </div>
  );
}