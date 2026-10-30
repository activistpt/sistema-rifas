/*
 * Sistema de Rifas Online - Configuration
 * Configure sua integração com Airtable e dados da rifa aqui
 */

// Configuration object - Edit these values before deployment
const APP_CONFIG = {
  airtable: {
    baseId: 'appSEU_BASE_ID', // Substitua pelo seu Base ID do Airtable
    apiKey: 'sua_api_key_aqui', // Substitua pela sua API Key do Airtable
    tableName: 'Rifas' // Nome da sua tabela no Airtable
  },
  raffle: {
    nome: 'Rifa de Exemplo', // Nome da sua rifa
    descricao: 'Selecione os números que deseja reservar para a rifa. Números marcados em vermelho já foram reservados.', // Descrição da rifa
    valorUnitario: 5.00, // Valor unitário por número (em EUR)
    totalNumeros: 100, // Número total de números disponíveis
    iban: 'PT50 0000 0000 0000 0000 0000 0', // IBAN para pagamento
    adminEmail: 'admin@exemplo.com' // Email do administrador
  },
  adminPassword: 'admin123' // Senha de admin - MUDE ESTA SENHA!
};

// Load configuration from localStorage if available (for runtime configuration)
function loadConfig() {
  try {
    const savedConfig = localStorage.getItem('sistema-rifas-config');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (e) {
    console.log('Nenhuma configuração salva encontrada');
  }
  return APP_CONFIG;
}

// Save configuration to localStorage
function saveConfig() {
  const configData = JSON.stringify(APP_CONFIG);
  localStorage.setItem('sistema-rifas-config', configData);
}

// Get Airtable data
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

// Create Airtable record
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

// Update Airtable record
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

// Generate random numbers
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

// Generate payment reference
function gerarReferenciaPagamento() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  const hora = String(data.getHours()).padStart(2, '0');
  const minuto = String(data.getMinutes()).padStart(2, '0');
  const segundo = String(data.getSeconds()).padStart(2, '0');

  return `REF-${ano}${mes}${dia}-${hora}${minuto}${segundo}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// Utils
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

// Application state
const appState = {
  user: null,
  participants: [],
  numbers: { free: [], reserved: {} },
  config: null,
  loading: false,
  error: null
};

// State helpers
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
