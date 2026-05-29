const API = {
  base: '',
  token: localStorage.getItem('token'),

  getHeaders() {
    const h = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  },

  async request(method, url, data) {
    const opts = { method, headers: this.getHeaders() };
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(this.base + url, opts);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro na requisição');
    return json;
  },

  register(data) { return this.request('POST', '/api/auth/register', data); },
  login(data) { return this.request('POST', '/api/auth/login', data); },
  me() { return this.request('GET', '/api/auth/me'); },
  updateProfile(data) { return this.request('PUT', '/api/auth/me', data); },

  getItems() { return this.request('GET', '/api/items'); },
  createItem(data) { return this.request('POST', '/api/items', data); },
  getItem(id) { return this.request('GET', `/api/items/${id}`); },
  updateItem(id, data) { return this.request('PUT', `/api/items/${id}`, data); },
  deleteItem(id) { return this.request('DELETE', `/api/items/${id}`); }
};
