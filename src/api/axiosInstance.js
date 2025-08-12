import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// === request ===
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    delete config.headers['Authorization'];
  }
  return config;
});

// === response (silent 모드 지원) ===
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const cfg = err?.config || {};
    const headers = cfg.headers || {};
    // ✅ meta.silent === true 또는 X-Silent: 1 이면 401/403 알림 끔
    const silent = cfg?.meta?.silent === true || headers['X-Silent'] === '1';

    if ((status === 401 || status === 403) && silent) {
      return Promise.reject(err); // 콘솔만, alert X
    }

    if (status === 401) alert('로그인이 필요합니다.');
    else if (status === 403) alert('권한이 없습니다.');
    return Promise.reject(err);
  }
);

export default api;