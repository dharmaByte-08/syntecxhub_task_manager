async function request(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  let response;
  try {
    response = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const error = new Error('The server is not responding. Start the API and refresh.');
    error.errors = [];
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token && !path.startsWith('/api/auth/login') && !path.startsWith('/api/auth/register')) {
      localStorage.removeItem('token');
      if (!window.location.pathname.startsWith('/login')) window.location.assign('/login');
    }
    const error = new Error(data.message || 'Something went wrong.');
    error.errors = data.errors || [];
    throw error;
  }
  return data;
}

export const api = {
  demo: () => request('/api/auth/demo'),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  me: () => request('/api/auth/me'),
  tasks: () => request('/api/tasks'),
  createTask: (body) => request('/api/tasks', { method: 'POST', body }),
  updateTask: (id, body) => request(`/api/tasks/${id}`, { method: 'PUT', body }),
  deleteTask: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};
