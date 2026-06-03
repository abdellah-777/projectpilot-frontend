import client from './client';

export const projectsAPI = {
  getAll:           ()              => client.get('/projects'),
  getOne:           (id)            => client.get(`/projects/${id}`),
  create:           (data)          => client.post('/projects', data),
  update:           (id, data)      => client.put(`/projects/${id}`, data),
  delete:           (id)            => client.delete(`/projects/${id}`),
  getMembers:       (id)            => client.get(`/projects/${id}/members`),
  addMember:        (id, data)      => client.post(`/projects/${id}/members`, data),
  removeMember:     (id, data)      => client.delete(`/projects/${id}/members`, { data }),
  updateMemberRole: (id, data)      => client.patch(`/projects/${id}/members/role`, data),
  invite:          (id, data)  => client.post(`/projects/${id}/invite`, data),
getInvitations:  (id)        => client.get(`/projects/${id}/invitations`),
cancelInvitation:(id, invId) => client.delete(`/projects/${id}/invitations/${invId}`),
};