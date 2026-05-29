let currentUser = null;
let itemModal = null;
let currentPage = 1;
let currentSearch = '';
let currentFilter = '';

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0`;
  toast.role = 'alert';
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body"><i class="bi ${type === 'success' ? 'bi-check-circle-fill' : type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} me-2"></i>${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  container.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { delay: 3500 });
  bsToast.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

function updateNav() {
  const token = localStorage.getItem('access_token');
  document.getElementById('navButtons').classList.toggle('d-none', !token);
  document.getElementById('guestButtons').classList.toggle('d-none', !!token);
}

function showView(view) {
  const container = document.getElementById('viewContainer');
  const loading = document.getElementById('loadingScreen');
  loading.classList.add('d-none');

  if (!Views[view]) return;

  container.innerHTML = Views[view]();
  container.querySelectorAll('.animated').forEach(el => el.style.animation = 'none');

  if (view === 'dashboard') {
    currentPage = 1;
    currentSearch = '';
    currentFilter = '';
    loadItems();
    itemModal = new bootstrap.Modal(document.getElementById('itemModal'));
  }
  if (view === 'profile') loadProfile();
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Entrando...';

  try {
    const data = await API.login({
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value
    });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    API.accessToken = data.access_token;
    API.refreshToken = data.refresh_token;
    currentUser = data.user;
    updateNav();
    showView('dashboard');
    showToast('Login realizado com sucesso!');
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Entrar';
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const pwd = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  if (pwd !== confirm) { showToast('Senhas não conferem', 'danger'); return; }

  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cadastrando...';

  try {
    const data = await API.register({
      name: document.getElementById('regName').value,
      email: document.getElementById('regEmail').value,
      password: pwd,
      phone: document.getElementById('regPhone').value
    });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    API.accessToken = data.access_token;
    API.refreshToken = data.refresh_token;
    currentUser = data.user;
    updateNav();
    showView('dashboard');
    showToast('Conta criada com sucesso!');
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-person-check me-2"></i>Cadastrar';
  }
}

async function logout() {
  try {
    await API.request('POST', '/api/auth/logout', { refresh_token: API.refreshToken });
  } catch {}
  API.logout();
}

async function loadProfile() {
  try {
    const user = await API.me();
    currentUser = user;
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profilePhone').textContent = user.phone || 'Telefone não informado';
    document.getElementById('profileSince').textContent = new Date(user.created_at).toLocaleDateString('pt-BR');
    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editAvatar').value = user.avatar || '';
  } catch (err) {
    showToast('Erro ao carregar perfil', 'danger');
  }
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

  try {
    const data = await API.updateProfile({
      name: document.getElementById('editName').value,
      phone: document.getElementById('editPhone').value,
      avatar: document.getElementById('editAvatar').value
    });
    currentUser = data;
    document.getElementById('profileName').textContent = data.name;
    document.getElementById('profileEmail').textContent = data.email;
    document.getElementById('profilePhone').textContent = data.phone || 'Telefone não informado';
    showToast('Perfil atualizado!');
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false; btn.innerHTML = '<i class="bi bi-save me-1"></i> Salvar Alterações';
  }
}

async function loadItems() {
  const container = document.getElementById('itemsContainer');
  try {
    const params = { page: currentPage, limit: 10 };
    if (currentSearch) params.search = currentSearch;
    if (currentFilter) params.status = currentFilter;

    const result = await API.getItems(params);
    const items = result.data || result;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="card">
          <div class="card-body text-center empty-state">
            <i class="bi bi-inbox"></i>
            <h5>Nenhum item encontrado</h5>
            <p class="text-muted">Clique em "Novo Item" para começar</p>
            <button class="btn btn-primary" onclick="openItemModal()">
              <i class="bi bi-plus-lg me-1"></i> Criar Primeiro Item
            </button>
          </div>
        </div>`;
      return;
    }

    const statusMap = { pending: 'Pendente', in_progress: 'Em Andamento', completed: 'Concluído' };
    const statusClass = { pending: 'warning', in_progress: 'info', completed: 'success' };

    container.innerHTML = `
      <div class="row mb-3">
        <div class="col-md-6 mb-2 mb-md-0">
          <div class="input-icon">
            <i class="bi bi-search"></i>
            <input type="text" class="form-control" id="searchInput" placeholder="Buscar itens..." value="${escapeHtml(currentSearch)}"
              onkeyup="if(event.key==='Enter'){currentSearch=this.value;currentPage=1;loadItems()}">
          </div>
        </div>
        <div class="col-md-3 mb-2 mb-md-0">
          <select class="form-select" id="filterStatus" onchange="currentFilter=this.value;currentPage=1;loadItems()">
            <option value="">Todos os status</option>
            <option value="pending" ${currentFilter==='pending'?'selected':''}>Pendente</option>
            <option value="in_progress" ${currentFilter==='in_progress'?'selected':''}>Em Andamento</option>
            <option value="completed" ${currentFilter==='completed'?'selected':''}>Concluído</option>
          </select>
        </div>
        <div class="col-md-3">
          <button class="btn btn-outline-primary w-100" onclick="currentSearch=document.getElementById('searchInput').value;currentPage=1;loadItems()">
            <i class="bi bi-filter"></i> Filtrar
          </button>
        </div>
      </div>
      <div class="d-flex justify-content-between align-items-center mb-2">
        <small class="text-muted">${result.total || items.length} item(ns) encontrado(s)</small>
      </div>
      ${items.map(item => `
        <div class="card item-card mb-3 animated">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div class="flex-grow-1 me-3">
                <h6 class="fw-bold mb-1">${escapeHtml(item.title)}</h6>
                <p class="text-muted small mb-2">${escapeHtml(item.description || 'Sem descrição')}</p>
                <div>
                  <span class="badge bg-${statusClass[item.status] || 'secondary'}">${statusMap[item.status] || item.status}</span>
                  <small class="text-muted ms-2">${new Date(item.created_at).toLocaleDateString('pt-BR')}</small>
                </div>
              </div>
              <div class="item-actions d-flex gap-1 flex-shrink-0">
                <button class="btn btn-outline-info btn-sm" onclick="openItemModal('${item.id}')" title="Editar">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="deleteItem('${item.id}')" title="Excluir">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
      ${result.totalPages > 1 ? `
        <nav class="mt-3">
          <ul class="pagination justify-content-center pagination-sm">
            <li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
              <button class="page-link" onclick="currentPage=Math.max(1,${currentPage-1});loadItems()">Anterior</button>
            </li>
            ${Array.from({length: Math.min(result.totalPages, 5)}, (_, i) => {
              const p = i + 1;
              return `<li class="page-item ${p === currentPage ? 'active' : ''}">
                <button class="page-link" onclick="currentPage=${p};loadItems()">${p}</button>
              </li>`;
            }).join('')}
            <li class="page-item ${currentPage >= result.totalPages ? 'disabled' : ''}">
              <button class="page-link" onclick="currentPage=Math.min(${result.totalPages},${currentPage+1});loadItems()">Próximo</button>
            </li>
          </ul>
        </nav>
      ` : ''}`;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Erro ao carregar itens: ${err.message}</div>`;
  }
}

function openItemModal(id) {
  const title = document.getElementById('itemModalTitle');
  const form = document.getElementById('itemForm');
  form.reset();
  document.getElementById('itemId').value = '';

  if (id) {
    title.textContent = 'Editar Item';
    API.getItem(id).then(item => {
      document.getElementById('itemId').value = item.id;
      document.getElementById('itemTitle').value = item.title;
      document.getElementById('itemDescription').value = item.description || '';
      document.getElementById('itemStatus').value = item.status;
    }).catch(err => showToast(err.message, 'danger'));
  } else {
    title.textContent = 'Novo Item';
  }

  itemModal.show();
}

async function saveItem() {
  const id = document.getElementById('itemId').value;
  const data = {
    title: document.getElementById('itemTitle').value,
    description: document.getElementById('itemDescription').value,
    status: document.getElementById('itemStatus').value
  };

  try {
    if (id) {
      await API.updateItem(id, data);
      showToast('Item atualizado!');
    } else {
      await API.createItem(data);
      showToast('Item criado!');
    }
    itemModal.hide();
    loadItems();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

async function deleteItem(id) {
  if (!confirm('Tem certeza que deseja excluir este item?')) return;
  try {
    await API.deleteItem(id);
    showToast('Item removido!');
    loadItems();
  } catch (err) {
    showToast(err.message, 'danger');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  const token = localStorage.getItem('access_token');
  if (token) {
    API.accessToken = token;
    showView('dashboard');
  } else {
    showView('login');
  }
});
