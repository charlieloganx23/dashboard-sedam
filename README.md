# 📊 Dashboard SEDAM 2026

> Sistema de Monitoramento de Deliberações e Plano de Ação — Secretaria de Estado do Desenvolvimento Ambiental de Rondônia

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)](https://github.com/charlieloganx23/dashboard-sedam)
[![Versão](https://img.shields.io/badge/versão-1.0.0-blue)](https://github.com/charlieloganx23/dashboard-sedam)
[![Licença](https://img.shields.io/badge/licença-MIT-green)](LICENSE)

---

## 📋 Sobre o Projeto

Sistema web de monitoramento para acompanhamento de deliberações do Tribunal de Contas de Rondônia (TCE-RO), desenvolvido para a SEDAM. Permite visualização em tempo real do progresso mensal de ações, geração de relatórios em PDF e gestão de usuários.

### 🎯 Funcionalidades Principais

- ✅ **Monitoramento em Tempo Real** — Dashboard interativo com progresso mensal por item/subitem
- 📊 **Visualizações Avançadas** — Gráficos Chart.js com filtros dinâmicos
- 📄 **Exportação PDF** — Relatórios executivos e backups completos
- 👥 **Gestão de Usuários** — Dois níveis (SEDAM e TCE-RO) com permissões diferenciadas
- 🔍 **Filtros Inteligentes** — Por período, responsável, setor e status de conclusão
- 💾 **Edição Inline** — Atualização de percentuais diretamente na tabela

---

## 🚀 Tecnologias

| Camada | Tecnologia | Versão |
|---|---|---|
| **Frontend** | Vanilla JavaScript ES6+ | - |
| **Estilo** | TailwindCSS (CDN) | 3.x |
| **Gráficos** | Chart.js + datalabels | 4.x / 2.0.0 |
| **PDF** | jsPDF + autotable | 2.5.1 / 3.5.28 |
| **Backend** | Supabase (PostgreSQL BaaS) | - |
| **Hospedagem** | GitHub Pages / Netlify | - |

### 📦 Arquitetura

```
dashboard-sedam/
├── index.html              # SPA principal (354 linhas)
├── config.js               # Credenciais Supabase
├── css/
│   └── style.css           # Customizações + animações (1.800 linhas)
├── js/
│   ├── utils.js            # Cliente Supabase + helpers
│   ├── sedam-core.js       # Auth + navegação (1.200 linhas)
│   ├── sedam-monitoramento.js  # Tabelas + cards (800 linhas)
│   ├── sedam-graficos.js   # Visualizações Chart.js (600 linhas)
│   ├── sedam-pdf.js        # Exportação PDF (500 linhas)
│   └── tcero.js            # CRUD usuários TCE (400 linhas)
└── docs/
    ├── AUDITORIA-ARQUITETURA.md  # Análise técnica completa
    ├── BACKLOG-MELHORIAS.md      # 26 User Stories + roadmap
    └── GIT-WORKFLOW.md           # Guia de contribuição
```

---

## 🛠️ Instalação e Uso

### Pré-requisitos

- Navegador moderno (Chrome 90+, Firefox 88+, Edge 90+)
- Conexão com internet (CDNs externos)
- Credenciais Supabase (contato: time SEDAM)

### 🚀 Quick Start

```bash
# 1. Clonar o repositório
git clone https://github.com/charlieloganx23/dashboard-sedam.git
cd dashboard-sedam

# 2. Configurar credenciais Supabase
# Criar arquivo config.js com:
cat > config.js << EOF
window.S_URL = 'https://seu-projeto.supabase.co';
window.S_KEY = 'sua-chave-publica-anon';
EOF

# 3. Servir localmente (escolha uma opção):

# Opção A: Python
python -m http.server 8000

# Opção B: Node.js
npx serve .

# Opção C: VS Code Live Server
# Clique direito em index.html > "Open with Live Server"

# 4. Acessar
open http://localhost:8000
```

### 🔐 Login

**Usuários SEDAM:**
- Gestão completa de deliberações
- Edição de percentuais
- Exportação de relatórios

**Usuários TCE-RO:**
- Visualização somente leitura
- Exportação de PDF (se autorizado)

---

## 📚 Documentação Técnica

| Documento | Descrição | Linhas |
|---|---|---|
| **[AUDITORIA-ARQUITETURA.md](docs/AUDITORIA-ARQUITETURA.md)** | Análise completa da arquitetura atual, identificação de vulnerabilidades (5 críticas), stack técnico, fluxos de dados, score 4.9/10 | 27.500+ |
| **[BACKLOG-MELHORIAS.md](docs/BACKLOG-MELHORIAS.md)** | 26 User Stories organizadas em 5 Épicos (Segurança, Qualidade, Database, UX, DevOps), roadmap de 6 sprints, KPIs | 23.000+ |
| **[GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md)** | Guia completo de contribuição via fork + PR, boas práticas de commit, troubleshooting | - |

---

## 🔐 Segurança

### ⚠️ Vulnerabilidades Conhecidas (Priorizadas no Backlog)

| ID | Gravidade | Descrição | Status |
|---|---|---|---|
| **SEC-01** | 🔴 CRÍTICA | Senhas em texto plano no banco | 📋 US-001 |
| **SEC-02** | 🔴 CRÍTICA | Credenciais expostas em `config.js` | 📋 US-003 |
| **SEC-03** | 🔴 CRÍTICA | RLS desativado no Supabase | 📋 US-002 |
| **SEC-04** | 🟠 ALTA | XSS via `innerHTML` sem sanitização | 📋 US-004 |
| **SEC-05** | 🟠 ALTA | localStorage sem criptografia | 📋 US-005 |

**Nota:** Estas vulnerabilidades estão sendo tratadas no [backlog de melhorias](docs/BACKLOG-MELHORIAS.md) com prioridade máxima.

---

## 🗂️ Banco de Dados

### Schema Supabase

```sql
-- Deliberações (dados principais)
CREATE TABLE deliberacoes (
  id SERIAL PRIMARY KEY,
  subitem TEXT,
  item TEXT,
  descricao TEXT,
  produto TEXT,
  responsavel TEXT,
  responsavel_id INT,
  setor TEXT,
  data_inicio DATE,
  jan INT, fev INT, mar INT, abr INT,
  mai INT, jun INT, jul INT, ago INT,
  set INT, out INT, nov INT, dez INT
);

-- Perfis SEDAM
CREATE TABLE perfis (
  id SERIAL PRIMARY KEY,
  nome_completo TEXT,
  username TEXT UNIQUE,
  senha TEXT,  -- ⚠️ Texto plano (US-001)
  cargo TEXT,
  nivel_acesso TEXT
);

-- Perfis TCE-RO
CREATE TABLE perfistce (
  id SERIAL PRIMARY KEY,
  nome_completo TEXT,
  username TEXT UNIQUE,
  senha TEXT,  -- ⚠️ Texto plano (US-001)
  cargo TEXT,
  nivel_acesso TEXT,
  permissao_pdf BOOLEAN
);
```

---

## 🤝 Contribuindo

Este é um **fork pessoal** do repositório oficial [`projetosetags/dashboard-sedam`](https://github.com/projetosetags/dashboard-sedam).

### Workflow de Contribuição

```bash
# 1. Clonar este fork
git clone https://github.com/charlieloganx23/dashboard-sedam.git
cd dashboard-sedam

# 2. Criar branch de feature
git checkout -b feature/minha-melhoria

# 3. Fazer alterações e commitar
git add .
git commit -m "feat: implementa autenticação JWT"

# 4. Enviar para o fork
git push origin feature/minha-melhoria

# 5. Abrir Pull Request no GitHub
# Base: projetosetags/dashboard-sedam:ambientedeteste
# Compare: charlieloganx23/dashboard-sedam:feature/minha-melhoria
```

### 📝 Padrões de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     nova funcionalidade
fix:      correção de bug
docs:     documentação
refactor: refatoração de código
test:     adição de testes
chore:    tarefas de manutenção
perf:     melhorias de performance
style:    formatação de código
```

**Consulte:** [docs/GIT-WORKFLOW.md](docs/GIT-WORKFLOW.md) para detalhes completos.

---

## 🗺️ Roadmap

### Sprint 1 (2 semanas) — Segurança Emergencial
- [x] ~~Auditoria de segurança~~
- [ ] 🔐 **US-001:** Hash de senhas com bcrypt
- [ ] 🔐 **US-002:** Row Level Security (RLS)
- [ ] 🔐 **US-003:** Variáveis de ambiente
- [ ] 🔐 **US-006:** HTTPS + HSTS

### Sprint 2 (2 semanas) — Segurança Complementar
- [ ] 🛡️ **US-004:** Sanitização XSS (DOMPurify)
- [ ] 🔒 **US-005:** Criptografia de localStorage
- [ ] 🚦 **US-015:** Rate limiting
- [ ] ⏳ **US-017:** Loading states

### Sprint 3 (2 semanas) — Qualidade de Código
- [ ] ⚙️ **US-008:** Migração Vite + TypeScript
- [ ] 📏 **US-010:** ESLint + Prettier
- [ ] 🧪 **US-011:** Testes unitários (Vitest)
- [ ] 🔄 **US-018:** Debounce + throttle

### Sprint 4-6
Consulte [docs/BACKLOG-MELHORIAS.md](docs/BACKLOG-MELHORIAS.md) para o roadmap completo.

---

## 📊 Status do Projeto

| Métrica | Valor | Descrição |
|---|---|---|
| **Linhas de Código** | ~3.500 | JavaScript ES6+ puro |
| **Score de Segurança** | 4.9/10 | Auditoria maio/2026 |
| **Cobertura de Testes** | 0% | A ser implementado (US-011) |
| **Tech Debt** | Alto | Priorizando refatoração (Épico 2) |
| **Última Atualização** | 13/05/2026 | Auditoria + backlog criados |

---


</div>
