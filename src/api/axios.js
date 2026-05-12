import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refresh = localStorage.getItem('refresh');
      if (!refresh) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const res = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh,
        });
        const newAccess = res.data.access;
        localStorage.setItem('access', newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (err) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;