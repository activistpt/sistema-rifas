// === ESTATÍSTICAS, CHART E SELECTOR - Script Standalone ===
// Carregado após script.js para garantir execução
// Versão final com todos os botões + e - funcionando

const RIFA_CONFIG = {
  totalNumeros: 800,
  valorUnitario: 3.00,
  adminPassword: 'Medeiros'
};

// Dados reais da planilha Google Sheets (exportados CSV)
const SHEETS_DATA = {
  livreParaCompra: 310,  // NÚMEROS LIVRES
  reservado: 490,         // NÚMEROS RESERVADOS
  selecionado: 0,          // NÚMEROS SELECIONADOS
  totalVendidos: 490,     // Total vendidos = reservado
  totalDisponiveis: 310   // Total disponíveis = livre
};

// Estado global
var g_freeNumbers = [];
var g_selectedNumbers = [];
var g_quantity = 1;
var g_valorUnitario = 3.00;

// Carregar dados da planilha CSV (backup)
async function loadSheetsData() {
  try {
    const response = await fetch('sheets-data.csv');
    if (response.ok) {
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      const dataLine = lines[1].split(',');
      return {
        livreParaCompra: parseInt(dataLine[0]) || SHEETS_DATA.livreParaCompra,
        reservado: parseInt(dataLine[1]) || SHEETS_DATA.reservado,
        selecionado: parseInt(dataLine[2]) || SHEETS_DATA.selecionado
      };
    }
  } catch (error) {
    console.log('CSV não disponível, usando dados embutidos:', error);
  }
  return SHEETS_DATA;
}

// Renderizar estatísticas e chart
async function renderStats() {
  var container = document.getElementById('statistics-container');
  if (!container) return;

  var stats = await loadSheetsData();
  var livre = stats.livreParaCompra;
  var reservado = stats.reservado;
  var selecionado = stats.selecionado;
  var total = RIFA_CONFIG.totalNumeros;
  var totalVendidos = reservado;
  var eurosArrecadados = totalVendidos * RIFA_CONFIG.valorUnitario;
  var eurosObjetivo = total * RIFA_CONFIG.valorUnitario;
  var eurosFaltam = eurosObjetivo - eurosArrecadados;
  var percentualVendido = ((reservado / total) * 100).toFixed(1);

  // Renderizar HTML com estatísticas e gráfico
  container.style.display = 'block';
  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">€${RIFA_CONFIG.valorUnitario},00</div>
        <div class="stat-label">Valor Unitário</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${total}</div>
        <div class="stat-label">Total de Números</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #a8e6cf, #dcedc1);">
        <div class="stat-value">${livre}</div>
        <div class="stat-label">Livre para compra</div>
        <div class="stat-subtitle">${((100 - percentualVendido))}% disponível</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #f8b195, #f9ed69);">
        <div class="stat-value">${reservado}</div>
        <div class="stat-label">Reservado</div>
        <div class="stat-subtitle">${percentualVendido}% vendidos</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #ffaaa5, #ff8b94);">
        <div class="stat-value">${selecionado}</div>
        <div class="stat-label">Selecionado</div>
        <div class="stat-subtitle">${((percentualVendido * 0.2)).toFixed(1)}% aguardando</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #6a4c93, #a66a99);">
        <div class="stat-value">${totalVendidos}</div>
        <div class="stat-label">Total Vendido</div>
        <div class="stat-subtitle">${percentualVendido}% dos números</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #003f5c, #2f4b7c);">
        <div class="stat-value">${livre}</div>
        <div class="stat-label">Disponível</div>
        <div class="stat-subtitle">${(100 - percentualVendido)}% restante</div>
      </div>
    </div>

    <!-- Gráfico Interativo -->
    <div class="stats-chart-section">
      <h4>📊 Arrecadação e Disponibilidade de Números</h4>
      <div class="chart-container">
        <div class="chart-row">
          <div class="chart-item">
            <div class="chart-label">📦 Números Disponíveis:</div>
            <div class="chart-bar">
              <div class="chart-fill available" style="width: ${((livre / total) * 100).toFixed(1)}%"></div>
            </div>
            <div class="chart-value">${livre} / ${total}</div>
          </div>
        </div>
        <div class="chart-row">
          <div class="chart-item">
            <div class="chart-label">💰 Arrecadado até agora:</div>
            <div class="chart-bar">
              <div class="chart-fill collected" style="width: ${((eurosArrecadados / eurosObjetivo) * 100).toFixed(1)}%"></div>
            </div>
            <div class="chart-value">€${eurosArrecadados} / €${eurosObjetivo}</div>
          </div>
        </div>
        <div class="chart-row">
          <div class="chart-item">
            <div class="chart-label">🎯 Faltam arrecadar:</div>
            <div class="chart-value">€${eurosFaltam}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Barra de progresso -->
    <div class="stats-progress-section">
      <h4>📈 Progresso do Sorteio</h4>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9em; color: #666;">
        <span>Arrecadado: €${eurosArrecadados}</span>
        <span>Objetivo: €${eurosObjetivo}</span>
      </div>
      <div style="height: 30px; background: #e0e0e0; border-radius: 15px; overflow: hidden; margin-bottom: 10px;">
        <div style="height: 100%; background: linear-gradient(90deg, #a8e6cf, #667eea); border-radius: 15px; width: ${((eurosArrecadados / eurosObjetivo) * 100).toFixed(1)}%; transition: width 0.5s ease;"></div>
      </div>
      <div style="text-align: center; font-weight: bold; color: #667eea;">
        ${percentualVendido}% concluído - Faltam €${eurosFaltam.toFixed(2)}
      </div>
    </div>
  `;
}

// === QUANTITY SELECTOR FUNCTIONS ===
// Estas funções são definidas globalmente para serem chamadas pelos onclick handlers

// Incrementar quantidade
function incrementQuantity() {
  var maxAllowed = Math.min(g_freeNumbers.length, 50);
  if (g_quantity < maxAllowed) {
    g_quantity++;
    var quantidadeInput = document.getElementById('quantidade');
    var quantityDisplay = document.getElementById('quantityDisplay');
    var quantityPreview = document.getElementById('quantityPreview');
    if (quantidadeInput) quantidadeInput.value = g_quantity;
    if (quantityDisplay) quantityDisplay.textContent = g_quantity;
    if (quantityPreview) quantityPreview.textContent = g_quantity;
    updateCalculatePreview();
    // Avisar se precisa selecionar mais números
    var selectedCount = g_selectedNumbers.length;
    if (g_quantity > selectedCount) {
      alert('Selecione ' + (g_quantity - selectedCount) + ' numero(s) clicando nos numeros livres abaixo.');
    }
  } else {
    alert('Limite maximo de ' + maxAllowed + ' numeros livres.');
  }
}

// Decrementar quantidade
function decrementQuantity() {
  if (g_quantity > 1) {
    g_quantity--;
    var quantidadeInput = document.getElementById('quantidade');
    var quantityDisplay = document.getElementById('quantityDisplay');
    var quantityPreview = document.getElementById('quantityPreview');
    if (quantidadeInput) quantidadeInput.value = g_quantity;
    if (quantityDisplay) quantityDisplay.textContent = g_quantity;
    if (quantityPreview) quantityPreview.textContent = g_quantity;
    updateCalculatePreview();
  }
}

// Atualizar preview de cálculo
function updateCalculatePreview() {
  var quantityDisplay = document.getElementById('quantityDisplay');
  var quantityPreview = document.getElementById('quantityPreview');
  var totalPrice = document.getElementById('totalPrice');
  var quantidadeInput = document.getElementById('quantidade');

  if (quantityDisplay) quantityDisplay.textContent = g_quantity;
  if (quantityPreview) quantityPreview.textContent = g_quantity;
  if (totalPrice) totalPrice.textContent = '€' + (g_valorUnitario * g_quantity).toFixed(2);
  if (quantidadeInput) quantidadeInput.value = g_quantity;
}

// Selecionar número
function selectNumber(number) {
  if (g_selectedNumbers.indexOf(number) !== -1) {
    g_selectedNumbers = g_selectedNumbers.filter(n => n !== number);
  } else if (g_selectedNumbers.length < g_quantity) {
    g_selectedNumbers.push(number);
  } else {
    alert('Selecione ' + g_quantity + ' numeros (clique no botao + para aumentar a quantidade)');
    return;
  }
  updateSelectedDisplay();
}

// Atualizar display de números selecionados
function updateSelectedDisplay() {
  var container = document.getElementById('selectedNumbers');
  if (container) {
    if (g_selectedNumbers.length === 0) {
      container.innerHTML = '<p class="no-numbers">Nenhum número selecionado ainda</p>';
    } else {
      container.innerHTML = g_selectedNumbers.map(n => '<span class="selected-number">' + n + '</span>').join('');
    }
  }
}

// Carregar números livres
async function loadFreeNumbers() {
  try {
    // Tentar carregar do CSV primeiro
    var csvResponse = await fetch('/public/sheets-data.csv');
    if (csvResponse.ok) {
      var csvText = await csvResponse.text();
      var lines = csvText.trim().split('\n');
      var dataLine = lines[1].split(',');
      var livre = parseInt(dataLine[0]) || 310;
      g_freeNumbers = Array.from({length: livre}, (_, i) => i + 1);
    } else {
      throw new Error('CSV not found');
    }
  } catch (error) {
    console.log('Usando dados padroes de numeros livres:', error);
    g_freeNumbers = Array.from({length: 310}, (_, i) => i + 1);
  }

  // Atualizar contador de números livres
  var freeCountElem = document.getElementById('freeNumbersCount');
  if (freeCountElem) {
    freeCountElem.textContent = g_freeNumbers.length;
  }

  // Mostrar números livres na interface
  displayFreeNumbersList();
}

// Mostrar números livres na interface
function displayFreeNumbersList() {
  var container = document.getElementById('freeNumbers');
  if (!container) return;

  container.innerHTML = '';

  if (g_freeNumbers.length === 0) {
    container.innerHTML = '<div class="alert error">Nenhum número livre disponível no momento.</div>';
    return;
  }

  var numbersToShow = g_freeNumbers.slice(0, 50);
  numbersToShow.forEach(function(number) {
    var numberElement = document.createElement('div');
    numberElement.className = 'free-number';
    numberElement.textContent = number;
    numberElement.onclick = function() { selectNumber(number); };
    container.appendChild(numberElement);
  });

  if (g_freeNumbers.length > 50) {
    var moreElement = document.createElement('div');
    moreElement.className = 'more-numbers';
    moreElement.textContent = '+' + (g_freeNumbers.length - 50) + ' mais números disponíveis';
    moreElement.style.cssText = 'color: #667eea; font-style: italic; margin-top: 10px; font-size: 0.9em;';
    container.appendChild(moreElement);
  }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // Mostrar container de estatísticas
  var statsContainer = document.getElementById('statistics-container');
  if (statsContainer) {
    statsContainer.style.display = 'block';
  }

  // Renderizar estatísticas e gráfico
  renderStats();

  // Carregar números livres
  loadFreeNumbers();

  // Inicializar displays de quantidade
  var quantityDisplay = document.getElementById('quantityDisplay');
  var quantityPreview = document.getElementById('quantityPreview');
  var quantidadeInput = document.getElementById('quantidade');
  if (quantityDisplay) quantityDisplay.textContent = g_quantity;
  if (quantityPreview) quantityPreview.textContent = g_quantity;
  if (quantidadeInput) quantidadeInput.value = g_quantity;

  // Atualizar preview de cálculo
  updateCalculatePreview();

  // Inicializar display de números selecionados
  updateSelectedDisplay();
});
