import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error.response?.data || { message: 'Network Error' });
  }
);

export const dashboardAPI = {
  getStats: () => client.get('/dashboard/stats'),
  getThreatTrend: () => client.get('/dashboard/threat-trend'),
  getAttackDistribution: () => client.get('/dashboard/attack-distribution'),
  getRiskDistribution: () => client.get('/dashboard/risk-distribution'),
  getLoginHeatmap: () => client.get('/dashboard/login-heatmap'),
  getWorldMap: () => client.get('/dashboard/world-map'),
};

export const alertsAPI = {
  getAlerts: (params) => client.get('/alerts', { params }),
  getAlertById: (id) => client.get(`/alerts/${id}`),
  updateAlertStatus: (id, status) => client.patch(`/alerts/${id}/status`, { status }),
  searchAlerts: (query) => client.get('/alerts/search', { params: { q: query } }),
};

export const entitiesAPI = {
  getEntities: (params) => client.get('/entities', { params }),
  getEntity: (id) => client.get(`/entities/${id}`),
  getEntityLogs: (id, params) => client.get(`/entities/${id}/logs`, { params }),
  getEntityAlerts: (id) => client.get(`/entities/${id}/alerts`),
  getEntityRiskHistory: (id) => client.get(`/entities/${id}/risk-history`),
};

export const generatorAPI = {
  generateData: (config) => client.post('/generator/generate', config),
  injectScenario: (scenario) => client.post('/generator/inject-scenario', { scenario }),
  getStatus: () => client.get('/generator/status'),
};

export const modelAPI = {
  trainModel: () => client.post('/model/train'),
  getMetrics: () => client.get('/model/metrics'),
  runPrediction: (data) => client.post('/model/predict', data),
};

export const reportsAPI = {
  generateReport: (config) => client.post('/reports/generate', config),
  downloadReport: (id) => client.get(`/reports/download/${id}`, { responseType: 'blob' }),
};

export const soarAPI = {
  executePlaybook: (alert_id, action) => client.post('/soar/execute', { alert_id, action }),
};

export const copilotAPI = {
  chat: (message, context) => client.post('/copilot/chat', { message, context }),
};

export default client;
