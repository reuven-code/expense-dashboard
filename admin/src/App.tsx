import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { Layout } from './components/Layout';
import { AppointmentsList } from './pages/Appointments';

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/appointments" element={<AppointmentsList />} />
        <Route path="/staff" element={<div>Staff Page (Coming Soon)</div>} />
        <Route path="/hours" element={<div>Business Hours Page (Coming Soon)</div>} />
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
