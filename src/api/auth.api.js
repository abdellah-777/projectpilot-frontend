import client from './client';

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login: (data)    => client.post('/auth/login', data),
  logout: ()       => client.post('/auth/logout'),
  me: ()           => client.get('/auth/me'),
};