import { api } from './api';

export async function getProfile() {
  const res = await api.get('/profile');
  return res.data;
}
