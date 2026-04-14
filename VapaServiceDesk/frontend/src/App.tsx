import { Link, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './features/tickets/DashboardPage';
import { LoginPage } from './features/auth/LoginPage';
import { CompaniesPage } from './features/companies/CompaniesPage';
export default function App() {
  return <div className="app-shell"><aside className="sidebar"><div><span className="brand-kicker">Vapa</span><h1>Service Desk</h1></div><nav><Link to="/">Tickets</Link><Link to="/companies">Empresas</Link><Link to="/login">Acceso SSO</Link></nav></aside><main className="main-content"><Routes><Route path="/" element={<DashboardPage />} /><Route path="/companies" element={<CompaniesPage />} /><Route path="/login" element={<LoginPage />} /></Routes></main></div>;
}
