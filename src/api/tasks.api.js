import client from './client';

export const tasksAPI = {
  getAll: (projectId)        => client.get(`/projects/${projectId}/tasks`),
  getOne: (projectId, taskId)=> client.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId, data)  => client.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, taskId, data) => client.put(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId, taskId)=> client.delete(`/projects/${projectId}/tasks/${taskId}`),
  move: (projectId, taskId, data)   => client.patch(`/projects/${projectId}/tasks/${taskId}/move`, data),
};