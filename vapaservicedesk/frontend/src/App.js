import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/ui/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import ClientsPage from './pages/ClientsPage';
import ProjectsPage from './pages/ProjectsPage';
import WorkersPage from './pages/WorkersPage';
import InvoicesPage from './pages/InvoicesPage';
import FinancePage from './pages/FinancePage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-lime-400 text-xl">Cargando...</div></div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="tickets/:id" element={<TicketDetailPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="workers" element={<WorkersPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
