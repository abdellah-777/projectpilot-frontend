import client from './client';

export const aiAPI = {
  generateStructure: (projectId)       => client.post(`/ai/projects/${projectId}/generate-structure`),
  generateSRS: (projectId, data)       => client.post(`/ai/projects/${projectId}/generate-srs`, data),
  askAnalyst: (projectId, data)        => client.post(`/ai/projects/${projectId}/ask-analyst`, data),
  analyzeRisks: (projectId)            => client.get(`/ai/projects/${projectId}/risk-analysis`),
  processMeetingNotes: (projectId, data) => client.post(`/ai/projects/${projectId}/process-meeting-notes`, data),
  generateSprintReport: (sprintId)     => client.post(`/ai/sprints/${sprintId}/generate-report`),
  weeklyProjectSummary: (projectId)    => client.post(`/ai/projects/${projectId}/weekly-summary`),
};