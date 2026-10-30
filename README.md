# Sistema de Rifas Online (Sem Google)

## Visão Geral

Um sistema completo de rifas online que funciona sem Google services, usando **Airtable** como o banco de dados (substitui o Google Sheets) e **GitHub Pages** como o serviço de hospedagem.

## Funcionalidades

✅ **Frontend Web Completo** (seu navegador)
- Formulário elegante de inscrição em rifas
- Interface de seleção de números
- Preview em tempo real do preço total
- Status de carregamento
- Validação de formulário

✅ **Admin Panel Completo** (o seu painel de administração)
- Gestão de configuração da rifa
- Lista de participantes
- Gerenciamento de status (criado/em validação/pago/cancelado)
- Gerenciamento de números disponíveis/reservados
- Reset e reinicialização

✅ **Backend Database** (Airtable)
- Substitui o Google Sheets
- Interface semelhante a planilha
- Coluna de status integrada
- API para atualização automática
- View-only access options

✅ **Pagamentos Integrados**
- Geração de referência de pagamento única
- Exibição de IBAN para transferência
- Status de pagamento rastreável

## Como Funciona

### 1. Para Participantes (Usuários)
1. **Acessem o site** - Visitem a página da rifa
2. **Selecione números** - Clique nos números disponíveis na grade
3. **Preencha dados** - Nome, email, telemóvel
4. **Confirmem inscrição** - Clique em "Confirmar Inscrição"
5. **Realizem pagamento** - Use a referência e IBAN fornecidos
6. **Acompanhem status** - Acompanhem o status da inscrição

### 2. Para Organizadores (Admins)
1. **Acedam ao painel admin** - Use a senha para login
2. **Configurem a rifa** - Nome, valor unitário, IBAN, etc.
3. **Gerenciem participantes** - Marquem status como pago/cancelado
4. **Atualizem números** - Adicionem/removam números disponíveis/reservados
5. **Reiniciem rifas** - Se necessário

## Requisitos Técnicos

### Dependências Mínimas

✅ **GitHub Account** (gratuito)
- Para hospedar o código-fonte
- Para usar GitHub Pages (hospedagem estática)

✅ **Airtable Account** (gratuito tier)
- Para o banco de dados (substitui o Google Sheets)
- API key para integração
- Base de dados com a tabela "Rifas"

### Passos de Configuração

#### 1. Obtenha GitHub Pages
1. Crie uma conta no GitHub
2. Crie um novo repositório público: `sistema-rifas`
3. Faça upload de todos os arquivos deste repositório
4. Vá em Settings → GitHub Pages
5. Selecione o branch `main` ou `gh-pages`
6. O seu site estará disponível em: `https://SEU_USERNAME.github.io/sistema-rifas`

#### 2. Configure o Airtable
1. Crie uma conta gratuita no [Airtable](https://airtable.com)
2. Crie uma nova base chamada "Sistema de Rifas"
3. Crie uma tabela chamada "Rifas" com estas colunas:
   - **Coluna A**: `Data/Hora` (Formula: `NOW()`)
   - **Coluna B**: `Nome` (Longo Texto)
   - **Coluna C**: `Email` (Email)
   - **Coluna D**: `Telemóvel` (Telefone)
   - **Coluna E**: `Números Escolhidos` (Longo Texto)
   - **Coluna F**: `Quantidade` (Número)
   - **Coluna G**: `Total a Pagar` (Moeda)
   - **Coluna H**: `Estado` (Seleção única: criado/em validação/pago/cancelado)
   - **Coluna I**: `Data Pagamento` (Data)
   - **Coluna J**: `Referência de Pagamento` (Texto Curto)
   - **Coluna K**: `IBAN` (Telefone)

4. Obtenha a sua **API Key**:
   - Vá em Settings → Account → API Keys
   - Copie o "A chave de API pública"

5. Obtenha o seu **Base ID**:
   - No URL da base: `https://airtable.com/appYOURBASEID/api/docs`
   - `YOURBASEID` é o seu Base ID

#### 3. Configure as Chaves de API (opcional)
Crie um arquivo `config.js` na raíz do repositório:

```javascript
// config.js - CONFIGURE ESTE ARQUIVO PARA O SEU AMBIENTE

window.CONFIG = {
  // Configuração Airtable
  airtable: {
    baseId: 'seu-base-id-aqui',
    apiKey: 'seu-api-key-public-aqui',
    tableName: 'Rifas'
  },
  
  // Configuração da rifa (opcional - será sobrescrita pela interface admin)
  raffle: {
    nome: 'Sua Rifa Online',
    descricao: 'Descrição da sua rifa',
    valorUnitario: 5.00,
    totalNumeros: 100,
    iban: 'PT50 0000 0000 0000 0000 0000 0',
    adminEmail: 'admin@exemplo.com'
  },
  
  // Senha do painel admin
  adminPassword: 'admin123'
};
```

## Uso

### Acessando a Rifa

**URL Principal:** `https://SEU_USERNAME.github.io/sistema-rifas`

1. Abra o link no seu navegador
2. Selecione números livres na grade (numeros verdes)
3. Preencha o formulário com os seus dados
4. Clique em "Confirmar Inscrição"
5. Aguarde a confirmação de sucesso
6. Siga as instruções de pagamento

### Acessando o Painel Admin

**URL Admin:** `https://SEU_USERNAME.github.io/sistema-rifas/?action=admin&password=SEU_PASSWORD`

1. Substitua `SEU_USERNAME` com o seu nome de usuário do GitHub
2. Substitua `SEU_PASSWORD` com a senha que configurou em `config.js`
3. Clique em "Entrar" no painel

## Funcionalidades Admin

### 1. Configuração da Rifa
- **Nome da Rifa**: Personalize o título
- **Descrição**: Texto descritivo
- **Valor Unitário**: Preço por número
- **Total de Números**: Total disponível para compra
- **IBAN**: Dados bancários para pagamento
- **Email Admin**: Para notificações

### 2. Gerenciamento de Participantes
- **Visualize**: Todos os participantes com dados completos
- **Filtre**: Use a caixa de pesquisa
- **Atualize status**: Marque como "pago" ou "cancelado"
- **Exporte dados**: Use as ferramentas nativas do Airtable

### 3. Gerenciamento de Números
- **Números Livres**: Números disponíveis para compra
- **Números Reservados**: Números já atribuídos
- **Preview**: Visualização em tempo real

## Recursos

### Status de Pagamento

O sistema rastreia automaticamente o status de cada inscrição:

- 🟨 **Criado**: Após a confirmação inicial
- 🟦 **Em Validação**: Aguardando pagamento
- 🟩 **Pago**: Pagamento confirmado
- 🟥 **Cancelado**: Reembolso ou cancelamento

### Geração de Pagamento

- **Referência Única**: Gerada automaticamente para cada pagamento
- **IBAN**: Seus dados bancários para transferência
- **Total Calculado**: Baseado na quantidade de números selecionados
- **Confirmação por Email**: Dados de pagamento enviados automaticamente

### Interface Mobile-Responsive

- Funciona perfeitamente em smartphones e tablets
- Design adaptativo e moderno

## Manutenção e Atualizações

### Atualizando Configurações

1. Edite o arquivo `config.js`
2. Faça commit e push das alterações
3. O site atualizará automaticamente (GitHub Pages)

### Reiniciando a Rifa

1. Entre no painel admin
2. Clique em "Reiniciar Rifa"
3. Confirme a ação (todos os dados serão apagados)
4. Novos números podem ser adicionados

### Backup de Dados

- **Airtable**: Exporte CSV diretamente do painel
- **GitHub**: Todas as alterações são versionadas
- **Local**: Faça download do repositório como backup

## Solução Alternativa: Full-Stack Backend

Se preferir uma experiência mais próxima do original (com backend), você pode:

1. **Conecte um Vercel/Firebase** ao GitHub Pages
2. **Use Netlify Functions** como API intermediária
3. **Deploy e-Commerce stack completo** com frontend e backend

Mas para uso pessoal/básico, a abordagem **Airtable + GitHub Pages** é a mais simples e gratuita.

## Problemas Comuns e Soluções

### "Página não encontrada" (404)
- **Problema**: GitHub Pages não servindo arquivos
- **Solução**: Certifique que há um `index.html` na raíz do repositório

### "Acesso negado" (401) no Admin
- **Problema**: Senha incorreta
- **Solução**: Verifique o `config.js` e senha do painel admin

### "Falha na requisição Airtable" (500)
- **Problema**: API key ou Base ID incorretos
- **Solução**: Verifique as configurações no `config.js`

### Modo Offline
- **Problema**: Funcionalidade limitada sem internet
- **Solução**: O site funciona totalmente offline, exceto para submissão de formulários

## Suporte e Documentação

Para dúvidas, problemas ou funcionalidades adicionais:

- **GitHub Repository**: `https://github.com/SEU_USERNAME/sistema-rifas`
- **Documentação**: Este README.md
- **Issues**: Use a seção de issues no GitHub

## Licença

**MIT License** - Gratuito para uso comercial e não comercial

---

*Este sistema foi desenvolvido como alternativa gratuita ao Google Forms + Google Sheets, utilizando Airtable como o banco de dados e GitHub Pages como hospedagem.*

## Agradecimentos

- **Airtable** pela plataforma de banco de dados gratuita
- **GitHub** pelo serviço de hospedagem gratuito
- **Community** pelos contribuições e feedback contínuo

---

**Pronto para começar?** Basta seguir os passos de configuração acima e você terá um sistema completo de rifas online em minutos! 🎉

## VÍDEO TUTORIAL

[https://www.youtube.com/watch?v=seu-video-aqui]

*Subtitles em Português (Portugal) disponíveis*