const API = {
  base: '',
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),

  getHeaders() {
    const h = { 'Content-Type': 'application/json' };
    if (this.accessToken) h['Authorization'] = `Bearer ${this.accessToken}`;
    return h;
  },

  async request(method, url, data) {
    const opts = { method, headers: this.getHeaders() };
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(this.base + url, opts);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || json.detail || 'Erro na requisição');
    return json;
  },

  async authenticatedRequest(method, url, data) {
    try {
      return await this.request(method, url, data);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('Token')) {
        const refreshed = await this.tryRefresh();
        if (refreshed) return await this.request(method, url, data);
        throw err;
      }
      throw err;
    }
  },

  async tryRefresh() {
    if (!this.refreshToken) return false;
    try {
      const res = await this.request('POST', '/api/auth/refresh', { refresh_token: this.refreshToken });
      this.accessToken = res.access_token;
      this.refreshToken = res.refresh_token;
      localStorage.setItem('access_token', res.access_token);
      localStorage.setItem('refresh_token', res.refresh_token);
      return true;
    } catch {
      this.logout();
      return false;
    }
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.accessToken = null;
    this.refreshToken = null;
    window.location.reload();
  },

  register(data) { return this.request('POST', '/api/auth/register', data); },
  login(data) { return this.request('POST', '/api/auth/login', data); },
  me() { return this.authenticatedRequest('GET', '/api/auth/me'); },
  updateProfile(data) { return this.authenticatedRequest('PUT', '/api/auth/me', data); },

  getItems(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return this.authenticatedRequest('GET', `/api/items?${qs}`);
  },
  createItem(data) { return this.authenticatedRequest('POST', '/api/items', data); },
  getItem(id) { return this.authenticatedRequest('GET', `/api/items/${id}`); },
  updateItem(id, data) { return this.authenticatedRequest('PUT', `/api/items/${id}`, data); },
  deleteItem(id) { return this.authenticatedRequest('DELETE', `/api/items/${id}`); }
};
