const companies = [ { name: 'Vapa Labs', users: 42, plan: 'Business' }, { name: 'Cliente Demo', users: 17, plan: 'Starter' } ];
export function CompaniesPage() {
  return <section className="panel"><h2>Empresas</h2><p>Cada empresa opera con su propio espacio de usuarios, tickets, reglas y autenticación.</p><div className="company-grid">{companies.map(company => <article key={company.name} className="company-card"><h3>{company.name}</h3><p>{company.users} usuarios</p><span className="badge subtle">{company.plan}</span></article>)}</div></section>;
}
