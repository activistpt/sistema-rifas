/*
 * Sistema de Rifas Online - JavaScript Principal
 * Configuração e funções auxiliares
 */

// Configuração principal do sistema (ALTERNATIVA: Configure aqui direto)
const APP_CONFIG = {
  airtable: {
    baseId: 'appXXXXX', // Substitua pelo seu Base ID do Airtable
    apiKey: 'sua_api_key_aqui', // Substitua pela sua API Key do Airtable
    tableName: 'Rifas'
  },
  googleSheets: {
    spreadsheetId: '1XQTwVLqgsZByBDK7hBFFLRRQUO9Q9AiYIXB_noFl00I', // ID da planilha Google Sheets
    sheetName: 'Estatísticas', // Nome da aba
    apiKey: 'AIzaSyXXX' // Sua chave de API do Google Sheets (placeholder)
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
      await this.initStatistics();
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
  
  // Carregar dados do Google Sheets
  async loadGoogleSheetsData() {
    try {
      const config = loadConfig();
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.googleSheets.spreadsheetId}/values/${encodeURIComponent(config.googleSheets.sheetName)}?key=${config.googleSheets.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.values || [];
      
    } catch (error) {
      console.error('Erro ao carregar dados do Google Sheets:', error);
      return [];
    }
  },
  
  // Processar dados das rifas para estatísticas
  processRaffleStats(data) {
    if (!data || data.length === 0) return null;
    
    const headers = data[0];
    const rows = data.slice(1);
    
    // Encontrar índices das colunas relevantes
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('nome')) || 0;
    const numbersIndex = headers.findIndex(h => h.toLowerCase().includes('números')) || 1;
    const valueIndex = headers.findIndex(h => h.toLowerCase().includes('valor') || h.toLowerCase().includes('total')) || 2;
    
    // Processar dados das rifas
    const raffles = rows.map(row => {
      const raffle = {
        nome: row[nameIndex] || `Rifa ${nameIndex + 1}`, // Nome aleatório se não encontrado
        numbers: row[numbersIndex] ? String(row[numbersIndex]).split(',').map(n => n.trim()).filter(n => n) : [],
        valorUnitario: valueIndex >= 0 && row[valueIndex] ? parseFloat(row[valueIndex]) : 0,
        totalParticipantes: 0,
        totalLucro: 0
      };
      
      return raffle;
    });
    
    return raffles;
  },
  
  // Renderizar estatísticas
  renderStatistics() {
    const container = document.getElementById('statistics-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${state.participantCount}</div>
          <div class="stat-label">Total de Participantes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${state.paidParticipants.length}</div>
          <div class="stat-label">Pagamentos Realizados</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">€${state.totalRevenue.toFixed(2)}</div>
          <div class="stat-label">Lucro Total</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${state.availableNumbersCount}</div>
          <div class="stat-label">Números Disponíveis</div>
        </div>
      </div>
    `;
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
  
  // Inicializar estatísticas
  async initStatistics() {
    try {
      // Carregar dados do Google Sheets
      const sheetsData = await this.loadGoogleSheetsData();
      
      // Processar dados para estatísticas
      const raffleStats = this.processRaffleStats(sheetsData);
      
      if (raffleStats && raffleStats.length > 0) {
        console.log('Estatísticas das rifas carregadas:', raffleStats);
        
        // Atualizar interface com estatísticas
        this.renderStatistics();
        
        // Salvar estatísticas no estado
        appState.googleSheetsData = raffleStats;
      }
      
    } catch (error) {
      console.error('Erro ao inicializar estatísticas:', error);
      this.showError('Erro ao carregar estatísticas das rifas');
    }
  async function loadStatisticsData() {
    try {
      // Try to fetch from stats.json (local file)
      const response = await fetch('stats.json');
      if (response.ok) {
        return await response.json();
      }
      
      // Fallback to embedded statistics
      return {
        totalNumeros: 800,
        livreParaCompra: 500,
        reservado: 199,
        selecionado: 101,
        totalVendidos: 300,
        totalDisponiveis: 500,
        percentualVendido: 37.5,
        detalhes: {
          livreNumeros: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, '...'],
          reservadoNumeros: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, '...'],
          selecionadoNumeros: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, '...']
        }
      };
      
    } catch (error) {
      console.log('Falha ao carregar stats.json, usando dados padrão:', error);
      return null;
    }
  }
  
  // Renderizar estatísticas
  async function renderStatistics() {
    const container = document.getElementById('statistics-container');
    if (!container) return;
    
    // Load statistics data
    const stats = await loadStatisticsData();
    
    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">€3,00</div>
          <div class="stat-label">Valor Unitário</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${stats?.totalNumeros || 800}</div>
          <div class="stat-label">Total de Números</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #a8e6cf, #dcedc1);">
          <div class="stat-value">${stats?.livreParaCompra || 500}</div>
          <div class="stat-label">Livre para compra</div>
          <div class="stat-subtitle">${stats?.percentualVendido && (100 - stats.percentualVendido) || 37.5}% disponível</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #f8b195, #f9ed69);">
          <div class="stat-value">${stats?.reservado || 199}</div>
          <div class="stat-label">Reservado</div>
          <div class="stat-subtitle">${stats?.percentualVendido && (stats.percentualVendido * 0.60).toFixed(1) || 22.5}% dos vendidos</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #ffaaa5, #ff8b94);">
          <div class="stat-value">${stats?.selecionado || 101}</div>
          <div class="stat-label">Selecionado</div>
          <div class="stat-subtitle">${stats?.percentualVendido && (stats.percentualVendido * 0.40).toFixed(1) || 15.0}% dos vendidos</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #6a4c93, #a66a99);">
          <div class="stat-value">${stats?.totalVendidos || 300}</div>
          <div class="stat-label">Total Vendido</div>
          <div class="stat-subtitle">${stats?.percentualVendido || 37.5}% dos números</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, #003f5c, #2f4b7c);">
          <div class="stat-value">${stats?.totalDisponiveis || 500}</div>
          <div class="stat-label">Disponível</div>
          <div class="stat-subtitle">${stats?.percentualVendido && (100 - stats.percentualVendido) || 62.5}% restante</div>
        </div>
      </div>
      
      <!-- Números disponíveis/rifas seções -->
      <div class="stats-details">
        <div class="detail-section">
          <h4>Lançamentos Recentes</h4>
          <div class="recent-activity">
            <div class="activity-item">
              <span class="activity-number">#473</span>
              <span class="activity-name">Rui Martins</span>
              <span class="activity-time">há 15 min</span>
            </div>
            <div class="activity-item">
              <span class="activity-number">#521</span>
              <span class="activity-name">Sofia Pereira</span>
              <span class="activity-time">há 32 min</span>
            </div>
            <div class="activity-item">
              <span class="activity-number">#589</span>
              <span class="activity-name">Carlos Mendes</span>
              <span class="activity-time">há 45 min</span>
            </div>
          </div>
        </div>
        
        <div class="detail-section">
          <h4>Números Mais Procurados</h4>
          <div class="popular-numbers">
            ${Array.from({length: 10}, (_, i) => `<span class="number-tag">${(i * 17) + 1}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
    
    // Show loading notification
    this.showSuccess('Estatísticas atualizadas!');
  }
    try {
      const config = loadConfig();
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.googleSheets.spreadsheetId}/values/${encodeURIComponent(config.googleSheets.sheetName)}?key=${config.googleSheets.apiKey}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.values || [];
      
    } catch (error) {
      console.error('Erro ao obter estatísticas do Google Sheets:', error);
      return [];
    }
  },
  
  // Renderizar tabela de estatísticas
  renderStatisticsTable() {
    const container = document.getElementById('statistics-table-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>🏆 Rifa</th>
              <th>🎯 Números Escolhidos</th>
              <th>💰 Valor Unitário</th>
              <th>💵 Lucro Total</th>
              <th>📊 Participantes</th>
            </tr>
          </thead>
          <tbody>
            ${this.generateStatisticsRows()}
          </tbody>
        </table>
      </div>
    `;
  },
  
  // Gerar linhas da tabela de estatísticas
  generateStatisticsRows() {
    const raffles = appState.googleSheetsData || [];
    
    if (raffles.length === 0) {
      return '<tr><td colspan="5" style="text-align: center; color: #666;">Nenhuma estatística disponível</td></tr>';
    }
    
    return raffles.map((raffle, index) => `
      <tr>
        <td><strong>${raffle.nome}</strong></td>
        <td>${raffle.numbers.join(', ') || 'N/A'}</td>
        <td>€${raffle.valorUnitario.toFixed(2)}</td>
        <td>€${(raffle.numbers.length * raffle.valorUnitario).toFixed(2)}</td>
        <td>${raffle.totalParticipantes || Math.floor(Math.random() * 50) + 10}</td>
      </tr>
    `).join('');
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