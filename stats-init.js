// === ESTATÍSTICAS E CHART - Script Standalone ===
// Carregado após script.js para garantir execução

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
  const container = document.getElementById('statistics-container');
  if (!container) return;

  const stats = await loadSheetsData();
  const livre = stats.livreParaCompra;
  const reservado = stats.reservado;
  const selecionado = stats.selecionado;
  const total = RIFA_CONFIG.totalNumeros;
  const totalVendidos = reservado;
  const eurosArrecadados = totalVendidos * RIFA_CONFIG.valorUnitario;
  const eurosObjetivo = total * RIFA_CONFIG.valorUnitario;
  const eurosFaltam = eurosObjetivo - eurosArrecadados;
  const percentualVendido = ((reservado / total) * 100).toFixed(1);

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
