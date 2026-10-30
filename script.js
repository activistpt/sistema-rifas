/*
 * Sistema de Rifas Online - JavaScript Principal
 * Configuração e funções auxiliares
 */

// Configuração principal do sistema (ALTERNATIVA: Configure aqui direto)
const APP_CONFIG = {
  airtable: {
    baseId: 'appXXXXX', // Substitua pelo seu Base ID do Airtable
    apiKey: 'keyXXXXX',  // Substitua pela sua API Key do Airtable
    tableName: 'Rifas'
  },
  raffle: {
    nome: 'Rifa de Example',
    descricao: 'Selecione os números que deseja reservar para a rifa.',
    valorUnitario: 5.00,
    totalNumeros: 100,
    iban: 'PT50 0000 0000 0000 0000 0000 0',
    adminEmail: 'admin@exemplo.com'
  },
  adminPassword: 'admin123' // Mude esta senha!
};

// Função para carregar a configuração
function loadConfig() {
  // Tenta carregar de um arquivo de configuração
  try {
    const configFile = localStorage.getItem('sistema-rifas-config');
    if (configFile) {
      return JSON.parse(configFile);
    }
  } catch (e) {
    console.log('Nenhuma configuração salva encontrada');
  }
  
  // Retorna a configuração padrão
  return APP_CONFIG;
}

// Função para salvar a configuração
function saveConfig() {
  const configData = JSON.stringify(APP_CONFIG);
  localStorage.setItem('sistema-rifas-config', configData);
}

// Função para obter dados da Airtable
async function getAirtableData() {
  const config = loadConfig();
  
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tableName}?filterByFormula=AND({Ativo}='true')`,
      {
        headers: {
          'Authorization': `Bearer ${config.airtable.apiKey}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.records || [];
    
  } catch (error) {
    console.error('Erro ao carregar dados da Airtable:', error);
    return [];
  }
}

// Função para criar um novo registro na Airtable
async function createAirtableRecord(fields) {
  const config = loadConfig();
  
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tableName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.airtable.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: fields
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Erro ao criar registro na Airtable:', error);
    throw error;
  }
}

// Função para atualizar um registro na Airtable
async function updateAirtableRecord(recordId, fields) {
  const config = loadConfig();
  
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tableName}/${recordId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${config.airtable.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: fields
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Erro ao atualizar registro na Airtable:', error);
    throw error;
  }
}

// Gerador de números aleatórios
function gerarNumerosAleatorios(quantidade, max, existentes = []) {
  const numeros = [];
  while (numeros.length < quantidade) {
    const num = Math.floor(Math.random() * max) + 1;
    if (!numeros.includes(num) && !existentes.includes(num)) {
      numeros.push(num);
    }
  }
  return numeros.sort((a, b) => a - b);
}

// Gerador de referência de pagamento
function gerarReferenciaPagamento() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  const segundo = String(data.getSeconds()).padStart(2, '0');
  
  return `REF-${ano}${mes}${dia}-${hora}${minuto}${segundo}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

// Utilitários para formatação
const Utils = {
  formatarMoeda: (valor) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(valor);
  },
  
  formatarData: (data) => {
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  },
  
  gerarSlug: (texto) => {
    return texto
      .toLowerCase()
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }
};

// Estado da aplicação
const appState = {
  user: null,
  participants: [],
  numbers: { free: [], reserved: {} },
  config: null,
  loading: false,
  error: null
};

// Funções de estado
const state = {
  get participantCount() {
    return appState.participants.length;
  },
  
  get activeParticipants() {
    return appState.participants.filter(p => p.status === 'ativo');
  },
  
  get paidParticipants() {
    return appState.participants.filter(p => p.status === 'pago');
  },
  
  get totalRevenue() {
    return appState.participants
      .filter(p => p.status === 'pago')
      .reduce((total, p) => total + (p.total || 0), 0);
  },
  
  get availableNumbersCount() {
    return appState.numbers.free.length;
  }
};

// Funções principais da aplicação
const app = {
  // Inicializar a aplicação
  async init() {
    try {
      appState.config = loadConfig();
      await this.loadData();
      this.setupEventListeners();
      this.renderDashboard();
    } catch (error) {
      console.error('Erro ao inicializar a aplicação:', error);
      this.showError('Erro ao carregar a aplicação. Recarregue a página.');
    }
  },
  
  // Carregar dados
  async loadData() {
    appState.loading = true;
    
    // Carregar participantes
    const participants = await getAirtableData();
    appState.participants = participants.map(p => ({
      id: p.id,
      nome: p.fields['Nome'] || '',
      email: p.fields['Email'] || '',
      telefone: p.fields['Telefone'] || '',
      numeros: p.fields['Números Escolhidos'] || '',
      quantidade: p.fields['Quantidade'] || 0,
      total: p.fields['Total a Pagar'] || 0,
      estado: p.fields['Estado'] || 'criado',
      referencia: p.fields['Referência de Pagamento'] || '',
      dataRegisto: p.fields['Data de Registo'] || new Date().toISOString()
    }));
    
    // Carregar números
    await this.loadNumbers();
    
    appState.loading = false;
  },
  
  // Carregar números
  async loadNumbers() {
    const config = loadConfig();
    
    // Se houver configuração do Airtable, carregar números de lá
    if (config.airtable.baseId && config.airtable.apiKey) {
      try {
        const response = await fetch(
          `https://api.airtable.com/v0/${config.airtable.baseId}/Config?filterByFormula={Ativo}='true'`,
          {
            headers: {
              'Authorization': `Bearer ${config.airtable.apiKey}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.records && data.records.length > 0) {
            const configRecord = data.records[0];
            appState.numbers.free = (configRecord.fields['Números Livres'] || '').split(',').filter(n => n.trim());
            appState.numbers.reserved = {};
            
            // Carregar números reservados
            const reservedResponse = await fetch(
              `https://api.airtable.com/v0/${config.airtable.baseId}/${config.airtable.tableName}?filterByFormula={Ativo}='true' AND ({Números Escolhidos} != '')`,
              {
                headers: {
                  'Authorization': `Bearer ${config.airtable.apiKey}`
                }
              }
            );
            
            if (reservedResponse.ok) {
              const reservedData = await reservedResponse.json();
              reservedData.records.forEach(record => {
                if (record.fields['Números Escolhidos']) {
                  const numeros = record.fields['Números Escolhidos'].split(',');
                  numeros.forEach(num => {
                    appState.numbers.reserved[num] = record.fields['Nome'] || 'Desconhecido';
                  });
                }
              });
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar números:', error);
      }
    }
  },
  
  // Configurar event listeners
  setupEventListeners() {
    // Listener para formulários
    document.addEventListener('submit', (e) => {
      if (e.target.matches('form')) {
        e.preventDefault();
        this.handleFormSubmit(e.target);
      }
    });
    
    // Listeners para botões
    document.addEventListener('click', (e) => {
      if (e.target.matches('.btn')) {
        e.preventDefault();
        this.handleButtonClick(e.target);
      }
    });
    
    // Listeners para mudanças em inputs
    document.addEventListener('change', (e) => {
      if (e.target.matches('input, select, textarea')) {
        this.handleInputChange(e.target);
      }
    });
  },
  
  // Manipular submissão de formulário
  async handleFormSubmit(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validação básica
    if (!data.nome || !data.email) {
      this.showError('Por favor, preencha os campos obrigatórios (Nome e Email).');
      return;
    }
    
    try {
      // Processar inscrição
      await this.processRaffleRegistration(data);
      
      // Mostrar sucesso
      this.showSuccess('Inscrição realizada com sucesso!');
      
      // Limpar formulário
      form.reset();
      
    } catch (error) {
      this.showError(`Erro ao processar inscrição: ${error.message}`);
    }
  },
  
  // Manipular clique de botão
  async handleButtonClick(button) {
    const action = button.dataset.action;
    
    switch (action) {
      case 'register':
        await this.showRegistrationForm();
        break;
      case 'admin':
        this.showAdminPanel();
        break;
      case 'close':
        this.closeModal();
        break;
      default:
        console.log('Ação desconhecida:', action);
    }
  },
  
  // Manipular mudança de input
  handleInputChange(input) {
    // Validação em tempo real
    switch (input.type) {
      case 'email':
        if (!this.validateEmail(input.value)) {
          input.setCustomValidity('Por favor, insira um email válido');
        } else {
          input.setCustomValidity('');
        }
        break;
      case 'tel':
        if (!this.validatePhone(input.value)) {
          input.setCustomValidity('Por favor, insira um número de telemóvel válido');
        } else {
          input.setCustomValidity('');
        }
        break;
    }
  },
  
  // Validar email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validar telefone
  validatePhone(phone) {
    const phoneRegex = /^\+?\d{9,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  },
  
  // Mostrar formulário de inscrição
  async showRegistrationForm() {
    // Implementar modal de inscrição
    console.log('Mostrar formulário de inscrição');
  },
  
  // Mostrar painel admin
  showAdminPanel() {
    // Implementar redirecionamento ou modal
    console.log('Mostrar painel admin');
  },
  
  // Fechar modal
  closeModal() {
    // Implementar fechamento de modal
    console.log('Fechar modal');
  },
  
  // Processar inscrição na rifa
  async processRaffleRegistration(data) {
    // Gerar números aleatórios
    const numerosSelecionados = gerarNumerosAleatorios(
      data.quantidade || 1,
      appState.config.rifa.totalNumeros,
      Object.keys(appState.numbers.reserved)
    );
    
    // Calcular total
    const total = (appState.config.rifa.valorUnitario * numerosSelecionados.length).toFixed(2);
    
    // Gerar referência
    const referencia = gerarReferenciaPagamento();
    
    // Preparar dados para o Airtable
    const airtableData = {
      fields: {
        'Nome': data.nome,
        'Email': data.email,
        'Telefone': data.telefone || '',
        'Números Escolhidos': numerosSelecionados.join(', '),
        'Quantidade': numerosSelecionados.length,
        'Total a Pagar': total,
        'Estado': 'criado',
        'Referência de Pagamento': referencia,
        'Data de Registo': new Date().toISOString(),
        'Ativo': true
      }
    };
    
    // Enviar para o Airtable
    const response = await createAirtableRecord(airtableData.fields);
    
    // Adicionar à lista local
    appState.participants.push({
      id: response.id,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone || '',
      numeros: numerosSelecionados.join(', '),
      quantidade: numerosSelecionados.length,
      total: total,
      estado: 'criado',
      referencia: referencia,
      dataRegisto: new Date().toISOString()
    });
    
    return response;
  },
  
  // Renderizar dashboard
  renderDashboard() {
    // Renderizar estatísticas
    this.renderStats();
    this.renderRecentParticipants();
    this.renderNumbersStatus();
  },
  
  // Renderizar estatísticas
  renderStats() {
    const statsElement = document.getElementById('stats');
    if (!statsElement) return;
    
    statsElement.innerHTML = `
      <div class="stat-item">
        <div class="stat-value">${state.participantCount}</div>
        <div class="stat-label">Total Participantes</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${state.paidParticipants.length}</div>
        <div class="stat-label">Pagamentos Realizados</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">€${state.totalRevenue.toFixed(2)}</div>
        <div class="stat-label">Receita Total</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${state.availableNumbersCount}</div>
        <div class="stat-label">Números Disponíveis</div>
      </div>
    `;
  },
  
  // Renderizar participantes recentes
  renderRecentParticipants() {
    const container = document.getElementById('recent-participants');
    if (!container) return;
    
    const recent = appState.participants
      .sort((a, b) => new Date(b.dataRegisto) - new Date(a.dataRegisto))
      .slice(0, 5);
    
    if (recent.length === 0) {
      container.innerHTML = '<p>Nenhum participante ainda.</p>';
      return;
    }
    
    container.innerHTML = recent.map(p => `
      <div class="participant-item">
        <div class="participant-info">
          <strong>${p.nome}</strong>
          <span>${p.numeros} - €${p.total}</span>
        </div>
        <div class="participant-status">
          <span class="status ${p.estado}">${p.estado}</span>
        </div>
      </div>
    `).join('');
  },
  
  // Renderizar status dos números
  renderNumbersStatus() {
    const container = document.getElementById('numbers-status');
    if (!container) return;
    
    const livres = appState.numbers.free.length;
    const reservados = Object.keys(appState.numbers.reserved).length;
    const total = livres + reservados;
    
    container.innerHTML = `
      <div class="status-item">
        <div class="status-value">${livres}</div>
        <div class="status-label">LIVRES</div>
      </div>
      <div class="status-item">
        <div class="status-value">${reservados}</div>
        <div class="status-label">RESERVADOS</div>
      </div>
      <div class="status-item">
        <div class="status-value">${total}</div>
        <div class="status-label">TOTAL</div>
      </div>
    `;
  },
  
  // Mostrar mensagem de sucesso
  showSuccess(message) {
    this.showMessage(message, 'success');
  },
  
  // Mostrar mensagem de erro
  showError(message) {
    this.showMessage(message, 'error');
  },
  
  // Mostrar mensagem
  showMessage(message, type) {
    // Implementar exibição de mensagem
    console.log(`${type}: ${message}`);
    
    // Se houver um elemento de mensagem, atualizá-lo
    const messageElement = document.getElementById('message');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.className = `alert ${type}`;
      messageElement.style.display = 'block';
      
      setTimeout(() => {
        messageElement.style.display = 'none';
      }, 5000);
    }
  }
};

// Inicializar a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// Exportar para uso em outros arquivos
window.App = app;
window.Utils = Utils;
window.State = state;