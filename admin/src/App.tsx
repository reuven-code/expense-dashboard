import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { Layout } from './components/Layout';
import { AppointmentsList } from './pages/Appointments';
import { BusinessHours } from './pages/BusinessHours';
import { StaffManagement } from './pages/Staff';

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/appointments" element={<AppointmentsList />} />
        <Route path="/staff" element={<StaffManagement />} />
        <Route path="/hours" element={<BusinessHours />} />
        <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
        <Route path="/" element={<Navigate to="/appointments" replace />} />
        <Route path="*" element={<Navigate to="/appointments" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
