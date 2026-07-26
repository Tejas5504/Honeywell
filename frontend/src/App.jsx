import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Layout from './components/layout/Layout';
import DashboardPage from './pages/DashboardPage';
import AlertsPage from './pages/AlertsPage';
import AlertDetailPage from './pages/AlertDetailPage';
import EntityProfilePage from './pages/EntityProfilePage';
import DataGeneratorPage from './pages/DataGeneratorPage';
import ModelPage from './pages/ModelPage';
import ReportPage from './pages/ReportPage';
import AICopilotModal from './components/copilot/AICopilotModal';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/alerts/:id" element={<AlertDetailPage />} />
          <Route path="/entities/:entityId" element={<EntityProfilePage />} />
          <Route path="/generator" element={<DataGeneratorPage />} />
          <Route path="/model" element={<ModelPage />} />
          <Route path="/reports" element={<ReportPage />} />
        </Routes>
      </Layout>
      <AICopilotModal />
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f1425',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      />
    </Router>
  );
}

export default App;
