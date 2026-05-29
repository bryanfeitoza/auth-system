const Views = {
  login() {
    return `
      <div class="auth-card animated">
        <div class="card">
          <div class="card-body">
            <div class="text-center mb-4">
              <div class="avatar-circle avatar-lg mx-auto mb-3">
                <i class="bi bi-person-fill"></i>
              </div>
              <h4 class="fw-bold">Bem-vindo de volta</h4>
              <p class="text-muted">Entre com suas credenciais</p>
            </div>
            <form onsubmit="handleLogin(event)">
              <div class="mb-3 input-icon">
                <i class="bi bi-envelope-fill"></i>
                <input type="email" class="form-control" id="loginEmail" placeholder="Seu email" required>
              </div>
              <div class="mb-3 input-icon">
                <i class="bi bi-lock-fill"></i>
                <input type="password" class="form-control" id="loginPassword" placeholder="Sua senha" required>
              </div>
              <button type="submit" class="btn btn-primary w-100 btn-lg">
                <i class="bi bi-box-arrow-in-right me-2"></i>Entrar
              </button>
            </form>
            <p class="text-center mt-3 mb-0">
              <span class="text-muted">Não tem conta?</span>
              <a href="#" onclick="showView('register');return false" class="text-decoration-none">Cadastre-se</a>
            </p>
          </div>
        </div>
      </div>`;
  },

  register() {
    return `
      <div class="auth-card animated">
        <div class="card">
          <div class="card-body">
            <div class="text-center mb-4">
              <div class="avatar-circle avatar-lg mx-auto mb-3">
                <i class="bi bi-person-plus-fill"></i>
              </div>
              <h4 class="fw-bold">Criar Conta</h4>
              <p class="text-muted">Preencha os dados para se cadastrar</p>
            </div>
            <form onsubmit="handleRegister(event)">
              <div class="mb-3 input-icon">
                <i class="bi bi-person-fill"></i>
                <input type="text" class="form-control" id="regName" placeholder="Nome completo" required>
              </div>
              <div class="mb-3 input-icon">
                <i class="bi bi-envelope-fill"></i>
                <input type="email" class="form-control" id="regEmail" placeholder="Melhor email" required>
              </div>
              <div class="mb-3 input-icon">
                <i class="bi bi-telephone-fill"></i>
                <input type="text" class="form-control" id="regPhone" placeholder="Telefone (opcional)">
              </div>
              <div class="mb-3 input-icon">
                <i class="bi bi-lock-fill"></i>
                <input type="password" class="form-control" id="regPassword" placeholder="Senha (mín. 6 caracteres)" minlength="6" required>
              </div>
              <div class="mb-3 input-icon">
                <i class="bi bi-lock-fill"></i>
                <input type="password" class="form-control" id="regConfirm" placeholder="Confirme a senha" required>
              </div>
              <button type="submit" class="btn btn-primary w-100 btn-lg">
                <i class="bi bi-person-check me-2"></i>Cadastrar
              </button>
            </form>
            <p class="text-center mt-3 mb-0">
              <span class="text-muted">Já tem conta?</span>
              <a href="#" onclick="showView('login');return false" class="text-decoration-none">Entre</a>
            </p>
          </div>
        </div>
      </div>`;
  },

  dashboard() {
    return `
      <div class="animated">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h4 class="fw-bold mb-1"><i class="bi bi-speedometer2 me-2"></i>Dashboard</h4>
            <p class="text-muted mb-0">Gerencie seus itens</p>
          </div>
          <button class="btn btn-primary" onclick="openItemModal()">
            <i class="bi bi-plus-lg me-1"></i> Novo Item
          </button>
        </div>
        <div id="itemsContainer">
          <div class="text-center py-5">
            <div class="spinner-border text-primary"></div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="itemModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content bg-dark border-secondary">
            <div class="modal-header border-secondary">
              <h5 class="modal-title fw-bold" id="itemModalTitle">Novo Item</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <form id="itemForm">
                <input type="hidden" id="itemId">
                <div class="mb-3">
                  <label class="form-label">Título</label>
                  <input type="text" class="form-control" id="itemTitle" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">Descrição</label>
                  <textarea class="form-control" id="itemDescription" rows="3"></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Status</label>
                  <select class="form-select" id="itemStatus">
                    <option value="pending">Pendente</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluído</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer border-secondary">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" onclick="saveItem()">
                <i class="bi bi-check-lg me-1"></i> Salvar
              </button>
            </div>
          </div>
        </div>
      </div>`;
  },

  profile() {
    return `
      <div class="row animated">
        <div class="col-lg-4 mb-4">
          <div class="card text-center h-100">
            <div class="card-body py-4">
              <div class="avatar-circle avatar-lg mx-auto mb-3" id="profileAvatar">
                <i class="bi bi-person-fill"></i>
              </div>
              <h5 class="fw-bold" id="profileName">---</h5>
              <p class="text-muted mb-0" id="profileEmail">---</p>
              <p class="text-muted small" id="profilePhone">---</p>
              <hr class="border-secondary">
              <div class="d-flex justify-content-center gap-3">
                <div><small class="text-muted d-block">Membro desde</small><strong id="profileSince">---</strong></div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-8 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="fw-bold mb-4"><i class="bi bi-pencil-square me-2"></i>Editar Perfil</h5>
              <form onsubmit="handleUpdateProfile(event)">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Nome</label>
                    <input type="text" class="form-control" id="editName" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" id="editEmail" disabled>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Telefone</label>
                    <input type="text" class="form-control" id="editPhone">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Avatar (URL)</label>
                    <input type="url" class="form-control" id="editAvatar" placeholder="https://...">
                  </div>
                  <div class="col-12">
                    <button type="submit" class="btn btn-primary">
                      <i class="bi bi-save me-1"></i> Salvar Alterações
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>`;
  }
};
