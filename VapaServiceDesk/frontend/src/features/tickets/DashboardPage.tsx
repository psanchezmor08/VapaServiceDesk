const mockTickets = [
  { id: 'INC-1001', title: 'Error de acceso SSO', priority: 'Alta', status: 'Abierto' },
  { id: 'REQ-2033', title: 'Alta de nuevo agente', priority: 'Media', status: 'En progreso' },
  { id: 'INC-1930', title: 'Adjunto no disponible', priority: 'Urgente', status: 'Pendiente cliente' }
];
export function DashboardPage() {
  return <section><header className="hero-card"><span className="badge">Multiempresa</span><h2>Centro de soporte con aislamiento por compañía</h2><p>Registro autoservicio, autenticación SSO y gestión de tickets con la misma línea de Vapa.</p></header><div className="stats-grid"><article className="panel"><strong>24</strong><span>Tickets abiertos</span></article><article className="panel"><strong>8</strong><span>Agentes activos</span></article><article className="panel"><strong>99.2%</strong><span>SLA cumplido</span></article></div><section className="panel"><h3>Cola actual</h3><div className="ticket-list">{mockTickets.map(ticket => <article key={ticket.id} className="ticket-row"><div><strong>{ticket.id}</strong><p>{ticket.title}</p></div><div><span>{ticket.priority}</span><span>{ticket.status}</span></div></article>)}</div></section></section>;
}
