# 📋 BACKLOG DE MELHORIAS — Dashboard TAG SEDAM 2026

**Data de Criação:** 13 de maio de 2026  
**Responsável:** Engenharia de Software TCE-RO  
**Status:** Em Planejamento

---

## 🎯 Visão Geral

Este backlog organiza as melhorias identificadas na auditoria de arquitetura em épicos, histórias de usuário e tarefas técnicas, seguindo metodologia ágil e priorizadas pelo framework **MoSCoW** + **Impacto vs Esforço**.

### Legenda de Priorização

| Tag | Significado | Prazo |
|---|---|---|
| 🔴 **CRÍTICO** | Vulnerabilidade de segurança ou bloqueador | Imediato (1-2 semanas) |
| 🟠 **ALTA** | Impacto significativo na qualidade/UX | Curto prazo (1 mês) |
| 🟡 **MÉDIA** | Melhoria incremental importante | Médio prazo (2-3 meses) |
| 🟢 **BAIXA** | Nice to have, sem urgência | Longo prazo (6+ meses) |

### Estimativas
- **XS:** 1-2 horas
- **S:** 1 dia
- **M:** 2-3 dias
- **L:** 1 semana
- **XL:** 2+ semanas

---

## 📦 ÉPICO 1: SEGURANÇA E COMPLIANCE

### Objetivo
Eliminar vulnerabilidades críticas e adequar o sistema à LGPD e boas práticas OWASP.

**Critérios de Aceite do Épico:**
- [ ] Auditoria de segurança externa aprovada
- [ ] Conformidade com LGPD Art. 46
- [ ] OWASP Top 10 compliance ≥80%
- [ ] Penetration testing sem falhas críticas

---

### 🔴 US-001: Hash de Senhas com Bcrypt

**Como** administrador do sistema,  
**quero** que as senhas sejam armazenadas com hash bcrypt,  
**para que** mesmo em caso de vazamento do banco de dados, as senhas não sejam expostas em texto plano.

#### Critérios de Aceite
- [ ] Senhas novas são hasheadas com bcrypt (cost factor 12)
- [ ] Script de migração criado para hashear senhas existentes
- [ ] Login valida senha contra hash usando bcrypt.compare()
- [ ] Campo `senha` renomeado para `senha_hash` no banco
- [ ] Testes unitários cobrindo autenticação

#### Tarefas Técnicas
- [ ] Criar Supabase Edge Function `hash_password` (Deno + bcrypt)
- [ ] Criar RPC `autenticar_usuario(username, senha_plana)`
- [ ] Migrar tabelas `perfis` e `perfistce` (adicionar coluna `senha_hash`)
- [ ] Script de migração de dados (rodar uma única vez)
  ```sql
  UPDATE perfis SET senha_hash = crypt(senha, gen_salt('bf', 12));
  ALTER TABLE perfis DROP COLUMN senha;
  ```
- [ ] Atualizar `sedam-core.js` para chamar RPC em vez de SELECT direto
- [ ] Documentar novo fluxo de autenticação

**Estimativa:** L (1 semana)  
**Prioridade:** 🔴 CRÍTICO  
**Definition of Done:**
- [ ] Código revisado e aprovado
- [ ] Migração testada em staging
- [ ] Rollback plan documentado
- [ ] Deploy em produção validado
- [ ] Senhas antigas não são mais acessíveis

---

### 🔴 US-002: Row Level Security (RLS) no Supabase

**Como** administrador do sistema,  
**quero** que todas as tabelas tenham RLS ativo,  
**para que** usuários não autenticados ou com permissões insuficientes não possam acessar dados sensíveis.

#### Critérios de Aceite
- [ ] RLS ativado em `deliberacoes`, `perfis`, `perfistce`
- [ ] Policies criadas para SELECT, INSERT, UPDATE, DELETE
- [ ] Teste: usuário não autenticado não pode ler dados
- [ ] Teste: usuário SEDAM nível 4 não pode editar perfis
- [ ] Documentação das policies criada

#### Tarefas Técnicas
- [ ] Ativar RLS: `ALTER TABLE deliberacoes ENABLE ROW LEVEL SECURITY;`
- [ ] Criar policies para `deliberacoes`:
  ```sql
  CREATE POLICY "Deliberações visíveis para autenticados"
  ON deliberacoes FOR SELECT
  USING (auth.role() = 'authenticated');
  
  CREATE POLICY "Apenas SEDAM nível 1 pode editar"
  ON deliberacoes FOR UPDATE
  USING (
    auth.jwt() ->> 'origem' = 'SEDAM' AND
    (auth.jwt() ->> 'nivel_acesso')::int <= 1
  );
  ```
- [ ] Criar policies para `perfis` (somente admin SEDAM)
- [ ] Criar policies para `perfistce` (somente admin TCE hardcoded)
- [ ] Teste de penetração (tentar acessar via curl sem auth)

**Estimativa:** M (2-3 dias)  
**Prioridade:** 🔴 CRÍTICO  
**Dependência:** US-001 (autenticação correta)

---

### 🔴 US-003: Migrar Credenciais para Variáveis de Ambiente

**Como** desenvolvedor,  
**quero** que credenciais Supabase sejam armazenadas em variáveis de ambiente,  
**para que** não fiquem expostas no código-fonte versionado.

#### Critérios de Aceite
- [ ] `config.js` removido do repositório
- [ ] `.env` criado e adicionado ao `.gitignore`
- [ ] Build pipeline (Vite) injeta variáveis em tempo de build
- [ ] Documentação de setup para novos desenvolvedores

#### Tarefas Técnicas
- [ ] Criar `.env.example`:
  ```env
  VITE_SUPABASE_URL=https://seu-projeto.supabase.co
  VITE_SUPABASE_ANON_KEY=sua-chave-aqui
  ```
- [ ] Adicionar ao `.gitignore`:
  ```
  .env
  .env.local
  config.js
  ```
- [ ] Atualizar código para usar `import.meta.env`:
  ```javascript
  const client = supabase.createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
  ```
- [ ] Configurar variáveis no ambiente de produção (Netlify/Vercel)

**Estimativa:** S (1 dia)  
**Prioridade:** 🔴 CRÍTICO

---

### 🟠 US-004: Sanitização de Inputs (XSS)

**Como** usuário do sistema,  
**quero** que conteúdos inseridos por outros usuários sejam sanitizados,  
**para que** não seja possível executar scripts maliciosos no meu navegador.

#### Critérios de Aceite
- [ ] DOMPurify integrado ao projeto
- [ ] Todos os `innerHTML` sanitizam dados de origem externa
- [ ] Teste: inserir `<script>alert('XSS')</script>` na descrição não executa
- [ ] Campos permitidos: negrito, itálico, listas (whitelist HTML)

#### Tarefas Técnicas
- [ ] Instalar DOMPurify: `npm install dompurify`
- [ ] Criar helper `sanitize()`:
  ```javascript
  import DOMPurify from 'dompurify'
  
  export function sanitize(dirty, allowedTags = []) {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: allowedTags.length ? allowedTags : ['b', 'i', 'u', 'ul', 'li'],
      ALLOWED_ATTR: []
    })
  }
  ```
- [ ] Substituir `innerHTML` por `innerHTML = sanitize(data)`
- [ ] Teste unitário com payloads XSS conhecidos (OWASP Cheat Sheet)

**Estimativa:** M (2 dias)  
**Prioridade:** 🟠 ALTA

---

### 🟠 US-005: Rate Limiting em Endpoints Sensíveis

**Como** administrador do sistema,  
**quero** limitar a taxa de requisições de login,  
**para que** ataques de força bruta sejam mitigados.

#### Critérios de Aceite
- [ ] Login bloqueado após 5 tentativas falhas por IP em 15 minutos
- [ ] Mensagem clara ao usuário quando bloqueado
- [ ] Logs de tentativas suspeitas armazenados
- [ ] Admin pode desbloquear IP manualmente

#### Tarefas Técnicas
- [ ] Criar Supabase Edge Function `rate_limiter`
- [ ] Usar Deno KV para armazenar contadores por IP
- [ ] Integrar no fluxo de login:
  ```javascript
  const { data, error } = await supabase.functions.invoke('rate_limiter', {
    body: { action: 'login', ip: getUserIP() }
  })
  if (data.blocked) {
    alert('Muitas tentativas. Tente novamente em 15 minutos.')
    return
  }
  ```
- [ ] Criar tabela `login_attempts` para auditoria

**Estimativa:** M (3 dias)  
**Prioridade:** 🟠 ALTA

---

### 🟡 US-006: HTTPS Obrigatório + HSTS

**Como** usuário do sistema,  
**quero** que a conexão seja sempre criptografada,  
**para que** meus dados não sejam interceptados.

#### Critérios de Aceite
- [ ] Redirecionamento automático HTTP → HTTPS
- [ ] Header `Strict-Transport-Security` configurado (1 ano)
- [ ] Teste: acesso via `http://` redireciona para `https://`

#### Tarefas Técnicas
- [ ] Configurar no servidor web (Nginx/Caddy):
  ```nginx
  server {
    listen 80;
    return 301 https://$host$request_uri;
  }
  
  server {
    listen 443 ssl http2;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  }
  ```
- [ ] Verificar certificado SSL válido (Let's Encrypt)

**Estimativa:** S (1 dia)  
**Prioridade:** 🟡 MÉDIA

---

### 🟡 US-007: Auditoria de Ações Administrativas

**Como** gestor do sistema,  
**quero** um log de todas as alterações em perfis e deliberações,  
**para que** possa rastrear quem fez o quê e quando.

#### Critérios de Aceite
- [ ] Tabela `audit_log` criada com trigger automático
- [ ] Log registra: usuário, ação (INSERT/UPDATE/DELETE), timestamp, dados antes/depois
- [ ] Interface de consulta de logs (somente admin TCE)
- [ ] Retenção de 2 anos (compliance LGPD)

#### Tarefas Técnicas
- [ ] Criar tabela:
  ```sql
  CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    tabela VARCHAR(50),
    acao VARCHAR(10),
    usuario_id INTEGER,
    usuario_nome VARCHAR(200),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    dados_antes JSONB,
    dados_depois JSONB,
    ip VARCHAR(45)
  );
  ```
- [ ] Criar trigger para `perfis`, `perfistce`, `deliberacoes`
- [ ] Tela de consulta com filtros (usuário, data, tabela)

**Estimativa:** L (1 semana)  
**Prioridade:** 🟡 MÉDIA

---

## 📦 ÉPICO 2: QUALIDADE DE CÓDIGO E MANUTENIBILIDADE

### Objetivo
Reduzir dívida técnica, implementar testes e facilitar colaboração entre desenvolvedores.

---

### 🟠 US-008: Migração para Vite + TypeScript

**Como** desenvolvedor,  
**quero** um build pipeline moderno com TypeScript,  
**para que** tenha auto-complete, validação de tipos e melhor DX.

#### Critérios de Aceite
- [ ] Projeto inicializado com `npm create vite@latest`
- [ ] TypeScript configurado com strict mode
- [ ] Build gera bundle otimizado (`npm run build`)
- [ ] Dev server com hot reload funcionando
- [ ] Todas as funções JavaScript migradas para TS

#### Tarefas Técnicas
- [ ] Criar projeto Vite: `npm create vite@latest dashboard-sedam -- --template vanilla-ts`
- [ ] Migrar arquivos JS para TS (renomear `.js` → `.ts`)
- [ ] Criar interfaces para tipos:
  ```typescript
  interface Deliberacao {
    id: number
    subitem: string
    item: string
    descricao: string
    jan: number
    fev: number
    // ...
  }
  
  interface Perfil {
    id: number
    nome_completo: string
    username: string
    nivel_acesso: 1 | 2 | 3 | 4
    origem: 'SEDAM' | 'TCERO'
  }
  ```
- [ ] Configurar `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "target": "ES2020",
      "module": "ESNext"
    }
  }
  ```

**Estimativa:** XL (2 semanas)  
**Prioridade:** 🟠 ALTA

---

### 🟠 US-009: Implementar Testes Unitários (Vitest)

**Como** desenvolvedor,  
**quero** testes automatizados para funções críticas,  
**para que** possa refatorar código com confiança.

#### Critérios de Aceite
- [ ] Vitest configurado (`npm run test`)
- [ ] Cobertura de testes ≥70% em funções core
- [ ] Testes passam no CI (GitHub Actions)
- [ ] Documentação de como escrever testes

#### Tarefas Técnicas
- [ ] Instalar Vitest: `npm install -D vitest @vitest/ui`
- [ ] Criar testes para `utils.js`:
  ```typescript
  // utils.test.ts
  import { describe, it, expect } from 'vitest'
  import { getTotal, compareSubitem } from './utils'
  
  describe('getTotal', () => {
    it('retorna o maior percentual entre os meses', () => {
      const item = { jan: 30, fev: 50, mar: 20 }
      expect(getTotal(item)).toBe(50)
    })
  })
  ```
- [ ] Criar testes para autenticação (mockar Supabase)
- [ ] Configurar coverage: `vitest --coverage`

**Estimativa:** L (1 semana)  
**Prioridade:** 🟠 ALTA

---

### 🟡 US-010: ESLint + Prettier

**Como** desenvolvedor,  
**quero** formatação automática de código,  
**para que** o time siga padrões consistentes.

#### Critérios de Aceite
- [ ] ESLint configurado com regras TypeScript
- [ ] Prettier formata ao salvar (VS Code)
- [ ] Pre-commit hook roda lint
- [ ] Build falha se houver erros de lint

#### Tarefas Técnicas
- [ ] Instalar: `npm install -D eslint prettier eslint-config-prettier`
- [ ] Criar `.eslintrc.json`:
  ```json
  {
    "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "prettier"
    ],
    "rules": {
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "error"
    }
  }
  ```
- [ ] Configurar Husky: `npx husky-init && npm install`
- [ ] Pre-commit: `npx lint-staged`

**Estimativa:** S (1 dia)  
**Prioridade:** 🟡 MÉDIA

---

### 🟡 US-011: Documentação JSDoc/TSDoc

**Como** desenvolvedor,  
**quero** documentação inline das funções,  
**para que** entenda o propósito e parâmetros sem ler a implementação.

#### Critérios de Aceite
- [ ] Todas as funções públicas documentadas com JSDoc
- [ ] Geração de documentação HTML (TypeDoc)
- [ ] Exemplos de uso nas funções principais

#### Tarefas Técnicas
- [ ] Instalar TypeDoc: `npm install -D typedoc`
- [ ] Documentar funções:
  ```typescript
  /**
   * Retorna o maior percentual de execução entre os meses.
   * @param item - Objeto deliberacao com percentuais mensais
   * @returns Número entre 0 e 100
   * @example
   * getTotal({ jan: 30, fev: 80, mar: 50 }) // 80
   */
  export function getTotal(item: Deliberacao): number {
    return Math.max(
      item.jan || 0,
      item.fev || 0,
      // ...
    )
  }
  ```
- [ ] Gerar docs: `npx typedoc --out docs/api src/`

**Estimativa:** M (2 dias)  
**Prioridade:** 🟡 MÉDIA

---

### 🟢 US-012: Migração para React/Vue/Svelte

**Como** desenvolvedor,  
**quero** usar um framework reativo,  
**para que** o código seja mais declarativo e testável.

#### Critérios de Aceite
- [ ] Aplicação migrada para framework escolhido
- [ ] Estado gerenciado por Zustand/Pinia
- [ ] Componentes reutilizáveis criados
- [ ] Performance mantida ou melhorada

#### Tarefas Técnicas
- [ ] Decisão de framework (ADR necessário)
- [ ] Criar estrutura de componentes:
  ```
  src/
  ├── components/
  │   ├── Card.tsx
  │   ├── Table.tsx
  │   └── Chart.tsx
  ├── pages/
  │   ├── Dashboard.tsx
  │   ├── Resumo.tsx
  │   └── Login.tsx
  ├── store/
  │   └── auth.ts
  └── utils/
  ```
- [ ] Migrar gradualmente (página por página)

**Estimativa:** XL (1 mês)  
**Prioridade:** 🟢 BAIXA (médio prazo)

---

## 📦 ÉPICO 3: BANCO DE DADOS E PERFORMANCE

### Objetivo
Normalizar estrutura de dados e otimizar queries.

---

### 🟡 US-013: Normalização da Tabela `deliberacoes`

**Como** DBA,  
**quero** separar percentuais mensais em tabela própria,  
**para que** seja fácil adicionar novos meses sem alterar schema.

#### Critérios de Aceite
- [ ] Tabela `execucoes` criada (foreign key para `deliberacoes`)
- [ ] Dados migrados de `jan-dez` para `execucoes`
- [ ] Queries atualizadas para usar JOIN
- [ ] Performance mantida (índices criados)

#### Tarefas Técnicas
- [ ] Criar tabela:
  ```sql
  CREATE TABLE execucoes (
    id SERIAL PRIMARY KEY,
    deliberacao_id INTEGER REFERENCES deliberacoes(id),
    mes INTEGER CHECK (mes BETWEEN 1 AND 12),
    ano INTEGER,
    percentual INTEGER CHECK (percentual BETWEEN 0 AND 100),
    UNIQUE(deliberacao_id, mes, ano)
  );
  ```
- [ ] Migrar dados:
  ```sql
  INSERT INTO execucoes (deliberacao_id, mes, ano, percentual)
  SELECT id, 1, 2026, jan FROM deliberacoes WHERE jan IS NOT NULL;
  -- Repetir para fev-dez
  ```
- [ ] Criar índice: `CREATE INDEX idx_exec_delib ON execucoes(deliberacao_id);`
- [ ] Atualizar queries no frontend

**Estimativa:** L (1 semana)  
**Prioridade:** 🟡 MÉDIA

---

### 🟡 US-014: Tabela `responsaveis` (Normalização)

**Como** DBA,  
**quero** separar responsáveis em tabela própria,  
**para que** não haja duplicação de nomes e facilite relatórios.

#### Critérios de Aceite
- [ ] Tabela `responsaveis` criada
- [ ] Relacionamento N:N com `deliberacoes`
- [ ] Dropdown de responsáveis no frontend populado automaticamente
- [ ] Sem registros duplicados

#### Tarefas Técnicas
- [ ] Criar tabela:
  ```sql
  CREATE TABLE responsaveis (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) UNIQUE,
    cargo VARCHAR(100),
    setor VARCHAR(100),
    email VARCHAR(100)
  );
  
  CREATE TABLE deliberacao_responsavel (
    deliberacao_id INTEGER REFERENCES deliberacoes(id),
    responsavel_id INTEGER REFERENCES responsaveis(id),
    PRIMARY KEY (deliberacao_id, responsavel_id)
  );
  ```
- [ ] Migrar nomes únicos de `deliberacoes.responsavel`
- [ ] Popular tabela associativa

**Estimativa:** M (3 dias)  
**Prioridade:** 🟡 MÉDIA

---

### 🟠 US-015: Índices de Performance

**Como** usuário,  
**quero** que filtros de data e item sejam rápidos,  
**para que** não precise esperar ao navegar.

#### Critérios de Aceite
- [ ] Queries de filtro executam em <100ms
- [ ] EXPLAIN ANALYZE mostra uso de índices
- [ ] Benchmark antes/depois documentado

#### Tarefas Técnicas
- [ ] Criar índices:
  ```sql
  CREATE INDEX idx_delib_item ON deliberacoes(item);
  CREATE INDEX idx_delib_subitem ON deliberacoes(subitem);
  CREATE INDEX idx_delib_data_inicio ON deliberacoes(data_inicio);
  CREATE INDEX idx_perfis_username ON perfis(username);
  CREATE INDEX idx_perfistce_username ON perfistce(username);
  ```
- [ ] Analisar queries lentas com `pg_stat_statements`
- [ ] Benchmark com dataset de 10.000 registros

**Estimativa:** S (1 dia)  
**Prioridade:** 🟠 ALTA

---

### 🟢 US-016: Soft Delete

**Como** gestor do sistema,  
**quero** que exclusões não sejam permanentes,  
**para que** possa recuperar dados deletados por engano.

#### Critérios de Aceite
- [ ] Coluna `deleted_at` adicionada a todas as tabelas
- [ ] DELETE substituído por UPDATE `deleted_at = NOW()`
- [ ] Filtro `WHERE deleted_at IS NULL` em todas as queries
- [ ] Interface de "lixeira" para admins

#### Tarefas Técnicas
- [ ] Adicionar coluna:
  ```sql
  ALTER TABLE deliberacoes ADD COLUMN deleted_at TIMESTAMPTZ;
  ALTER TABLE perfis ADD COLUMN deleted_at TIMESTAMPTZ;
  ```
- [ ] Criar função helper:
  ```javascript
  async function softDelete(table, id) {
    await client.from(table)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
  }
  ```
- [ ] View para dados ativos:
  ```sql
  CREATE VIEW deliberacoes_ativas AS
  SELECT * FROM deliberacoes WHERE deleted_at IS NULL;
  ```

**Estimativa:** M (2 dias)  
**Prioridade:** 🟢 BAIXA

---

## 📦 ÉPICO 4: EXPERIÊNCIA DO USUÁRIO (UX)

### Objetivo
Melhorar feedback visual e acessibilidade.

---

### 🟠 US-017: Loading States (Spinners)

**Como** usuário,  
**quero** ver indicadores de carregamento,  
**para que** saiba que o sistema está processando minha ação.

#### Critérios de Aceite
- [ ] Spinner exibido durante login
- [ ] Skeleton screens nas tabelas enquanto carrega
- [ ] Botão "Salvar" desabilitado durante requisição
- [ ] Animação suave (fade in/out)

#### Tarefas Técnicas
- [ ] Criar componente `Loading`:
  ```html
  <div id="loading" class="hidden fixed inset-0 bg-black/50 flex items-center justify-center">
    <div class="spinner"></div>
  </div>
  ```
- [ ] Adicionar antes de async calls:
  ```javascript
  showLoading()
  await carregarDados()
  hideLoading()
  ```
- [ ] CSS para spinner (Tailwind):
  ```css
  .spinner {
    @apply w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin;
  }
  ```

**Estimativa:** S (1 dia)  
**Prioridade:** 🟠 ALTA

---

### 🟠 US-018: Debounce em Inputs de Edição

**Como** usuário,  
**quero** que o sistema não salve a cada tecla digitada,  
**para que** evite requisições desnecessárias.

#### Critérios de Aceite
- [ ] Edição inline aguarda 500ms de inatividade antes de salvar
- [ ] Indicador visual (ícone) mostra "salvando..." → "salvo"
- [ ] Cancelamento de requisições pendentes se usuário continuar digitando

#### Tarefas Técnicas
- [ ] Criar função `debounce`:
  ```javascript
  function debounce(func, wait) {
    let timeout
    return function(...args) {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }
  ```
- [ ] Aplicar em inputs:
  ```javascript
  const salvarComDebounce = debounce(salvarCampo, 500)
  input.oninput = () => salvarComDebounce(id, campo, valor)
  ```

**Estimativa:** S (1 dia)  
**Prioridade:** 🟠 ALTA

---

### 🟡 US-019: Validação de Campos Obrigatórios

**Como** usuário,  
**quero** ver mensagens claras quando não preencho campos obrigatórios,  
**para que** saiba o que corrigir.

#### Critérios de Aceite
- [ ] Campos obrigatórios marcados com asterisco vermelho
- [ ] Mensagem de erro abaixo do campo (não alert)
- [ ] Botão "Salvar" desabilitado até validação passar
- [ ] HTML5 validation + validação JavaScript

#### Tarefas Técnicas
- [ ] Adicionar `required` em inputs:
  ```html
  <input id="pf_nome" required placeholder="Nome Completo*" />
  ```
- [ ] Validação customizada:
  ```javascript
  function validarPerfil() {
    const nome = document.getElementById('pf_nome').value
    if (!nome.trim()) {
      mostrarErro('pf_nome', 'Nome é obrigatório')
      return false
    }
    return true
  }
  ```
- [ ] CSS para estados:
  ```css
  input:invalid { border-color: red; }
  input:valid { border-color: green; }
  ```

**Estimativa:** M (2 dias)  
**Prioridade:** 🟡 MÉDIA

---

### 🟡 US-020: Toast Notifications

**Como** usuário,  
**quero** ver notificações não invasivas de sucesso/erro,  
**para que** tenha feedback sem interromper meu fluxo.

#### Critérios de Aceite
- [ ] Toast verde para sucesso, vermelho para erro
- [ ] Auto-dismiss após 3 segundos
- [ ] Suporte a múltiplos toasts simultâneos
- [ ] Acessível (ARIA labels)

#### Tarefas Técnicas
- [ ] Instalar lib (ou criar custom): `npm install vue-toastification`
- [ ] Criar função helper:
  ```javascript
  function toast(message, type = 'success') {
    const toast = document.createElement('div')
    toast.className = `toast toast-${type}`
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }
  ```
- [ ] Substituir `alert()` por `toast()`:
  ```javascript
  // Antes:
  alert('Salvo com sucesso')
  
  // Depois:
  toast('Salvo com sucesso', 'success')
  ```

**Estimativa:** M (2 dias)  
**Prioridade:** 🟡 MÉDIA

---

### 🟡 US-021: Confirmação em Ações Destrutivas

**Como** usuário,  
**quero** confirmar antes de deletar um registro,  
**para que** não perca dados por engano.

#### Critérios de Aceite
- [ ] Modal de confirmação com mensagem clara
- [ ] Botão "Cancelar" e "Confirmar Exclusão"
- [ ] Foco automático no botão "Cancelar" (acessibilidade)
- [ ] Escape fecha modal sem deletar

#### Tarefas Técnicas
- [ ] Criar modal de confirmação:
  ```html
  <div id="modalConfirm" class="hidden">
    <div class="modal-content">
      <p>Tem certeza que deseja excluir <strong id="confirmNome"></strong>?</p>
      <button onclick="cancelarExclusao()">Cancelar</button>
      <button onclick="confirmarExclusao()">Confirmar Exclusão</button>
    </div>
  </div>
  ```
- [ ] Substituir exclusão direta:
  ```javascript
  // Antes:
  async function excluirPerfil(id) {
    await client.from('perfis').delete().eq('id', id)
  }
  
  // Depois:
  function excluirPerfil(id, nome) {
    window.excluirId = id
    document.getElementById('confirmNome').textContent = nome
    document.getElementById('modalConfirm').classList.remove('hidden')
  }
  ```

**Estimativa:** S (1 dia)  
**Prioridade:** 🟡 MÉDIA

---

### 🟢 US-022: PWA + Modo Offline

**Como** usuário móvel,  
**quero** acessar dados básicos sem internet,  
**para que** possa consultar informações em campo.

#### Critérios de Aceite
- [ ] Service worker registrado
- [ ] Dados em cache (IndexedDB)
- [ ] Indicador visual "offline"
- [ ] Sincronização automática ao reconectar

#### Tarefas Técnicas
- [ ] Criar `manifest.json`:
  ```json
  {
    "name": "Dashboard TAG SEDAM",
    "short_name": "TAG SEDAM",
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#1e3a8a",
    "icons": [...]
  }
  ```
- [ ] Service worker com Workbox
- [ ] Cache strategy: Network First, fallback Cache

**Estimativa:** XL (2 semanas)  
**Prioridade:** 🟢 BAIXA (longo prazo)

---

## 📦 ÉPICO 5: DEVOPS E AUTOMAÇÃO

### Objetivo
Automatizar deploy, testes e monitoramento.

---

### 🟠 US-023: CI/CD com GitHub Actions

**Como** desenvolvedor,  
**quero** que testes rodem automaticamente ao fazer push,  
**para que** bugs não cheguem à produção.

#### Critérios de Aceite
- [ ] Pipeline roda em todo push para `main`
- [ ] Steps: lint → test → build → deploy
- [ ] Deploy automático em staging
- [ ] Notificação no Telegram se falhar

#### Tarefas Técnicas
- [ ] Criar `.github/workflows/ci.yml`:
  ```yaml
  name: CI/CD
  on:
    push:
      branches: [main]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: 18
        - run: npm install
        - run: npm run lint
        - run: npm run test
        - run: npm run build
    deploy:
      needs: test
      runs-on: ubuntu-latest
      steps:
        - run: netlify deploy --prod
  ```

**Estimativa:** M (3 dias)  
**Prioridade:** 🟠 ALTA

---

### 🟡 US-024: Ambiente de Staging

**Como** desenvolvedor,  
**quero** testar mudanças em staging antes de produção,  
**para que** validação não afete usuários.

#### Critérios de Aceite
- [ ] URL separada (staging.dashboard-sedam.tcero.tc.br)
- [ ] Banco de dados staging (cópia de produção)
- [ ] Deploy automático em push para branch `develop`

#### Tarefas Técnicas
- [ ] Criar projeto Supabase staging
- [ ] Configurar variáveis de ambiente separadas
- [ ] Branching strategy: `main` (prod) ← `develop` (staging)

**Estimativa:** M (2 dias)  
**Prioridade:** 🟡 MÉDIA

---

### 🟡 US-025: Monitoramento de Erros (Sentry)

**Como** desenvolvedor,  
**quero** ser notificado quando erros ocorrem em produção,  
**para que** possa corrigir rapidamente.

#### Critérios de Aceite
- [ ] Sentry integrado ao frontend
- [ ] Erros JavaScript capturados automaticamente
- [ ] Source maps enviados para stack traces legíveis
- [ ] Alertas no email para erros críticos

#### Tarefas Técnicas
- [ ] Criar conta Sentry (plano gratuito)
- [ ] Instalar SDK: `npm install @sentry/browser`
- [ ] Configurar:
  ```javascript
  import * as Sentry from '@sentry/browser'
  
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1
  })
  ```

**Estimativa:** S (1 dia)  
**Prioridade:** 🟡 MÉDIA

---

### 🟢 US-026: Backup Automático Supabase

**Como** administrador,  
**quero** backups diários do banco de dados,  
**para que** possa recuperar dados em caso de desastre.

#### Critérios de Aceite
- [ ] Backup automático configurado no Supabase (plano pago)
- [ ] Retenção de 30 dias
- [ ] Teste de restore validado

#### Tarefas Técnicas
- [ ] Ativar PITR (Point-in-Time Recovery) no Supabase
- [ ] Ou script cron:
  ```bash
  pg_dump -h db.xyz.supabase.co -U postgres -d postgres > backup-$(date +%Y%m%d).sql
  ```
- [ ] Armazenar em S3/Google Cloud Storage

**Estimativa:** M (2 dias)  
**Prioridade:** 🟢 BAIXA (mas CRÍTICO para compliance)

---

## 📊 PRIORIZAÇÃO POR IMPACTO vs ESFORÇO

```
        ALTO IMPACTO
            ▲
            │
    US-001  │  US-002  US-015
    US-003  │  US-004  US-017
    US-018  │  US-023
────────────┼────────────────▶ BAIXO ESFORÇO
    US-008  │  US-013
    US-009  │  US-022
    US-012  │
            │
       BAIXO IMPACTO
```

**Quick Wins (Alto Impacto + Baixo Esforço):**
- US-003: Variáveis de ambiente
- US-006: HTTPS + HSTS
- US-010: ESLint + Prettier
- US-017: Loading states
- US-018: Debounce

**Prioridades Estratégicas (Alto Impacto + Alto Esforço):**
- US-001: Hash de senhas
- US-002: RLS
- US-008: Vite + TypeScript
- US-009: Testes unitários

---

## 📅 CRONOGRAMA SUGERIDO

### Sprint 1 (2 semanas) — Segurança Emergencial
- [ ] US-001: Hash de senhas
- [ ] US-002: RLS
- [ ] US-003: Variáveis de ambiente
- [ ] US-006: HTTPS + HSTS

**Meta:** Sistema seguro para uso produtivo

---

### Sprint 2 (2 semanas) — Segurança Complementar
- [ ] US-004: Sanitização XSS
- [ ] US-005: Rate limiting
- [ ] US-015: Índices de performance
- [ ] US-017: Loading states

**Meta:** UX melhorada + performance

---

### Sprint 3 (2 semanas) — Qualidade de Código
- [ ] US-008: Vite + TypeScript (início)
- [ ] US-010: ESLint + Prettier
- [ ] US-023: CI/CD

**Meta:** Pipeline de desenvolvimento profissional

---

### Sprint 4 (2 semanas) — Testes e Validações
- [ ] US-008: Vite + TypeScript (conclusão)
- [ ] US-009: Testes unitários
- [ ] US-018: Debounce
- [ ] US-019: Validações

**Meta:** Código testável e robusto

---

### Sprint 5 (2 semanas) — UX Avançada
- [ ] US-020: Toast notifications
- [ ] US-021: Confirmações
- [ ] US-024: Staging environment
- [ ] US-025: Sentry

**Meta:** Experiência polida

---

### Sprints 6-12 (3 meses) — Expansão
- [ ] US-007: Auditoria
- [ ] US-011: Documentação
- [ ] US-013: Normalização DB
- [ ] US-014: Tabela responsáveis
- [ ] US-016: Soft delete
- [ ] US-022: PWA offline
- [ ] US-026: Backups

**Meta:** Sistema completo e escalável

---

## 🎯 KPIs DE SUCESSO

| Métrica | Baseline Atual | Meta Q3 2026 | Meta Q4 2026 |
|---|---|---|---|
| Cobertura de testes | 0% | 50% | 80% |
| Vulnerabilidades críticas | 5 | 0 | 0 |
| Tempo de build | N/A | <1min | <30s |
| Performance (Lighthouse) | ~70 | 85 | 95 |
| Bugs em produção (mensal) | ? | <5 | <2 |
| Satisfação do usuário (NPS) | ? | 60 | 80 |

---

## 📝 NOTAS FINAIS

### Regras de Aceite Gerais
- Todas as US devem ter code review aprovado
- Todas as US devem ter testes (quando aplicável)
- Documentação atualizada antes de marcar como Done
- Deploy em staging validado antes de produção

### Definição de Pronto (DoD Global)
- [ ] Código implementado e testado
- [ ] Testes automatizados criados (se aplicável)
- [ ] Documentação atualizada
- [ ] Code review aprovado
- [ ] Merge na branch `develop`
- [ ] Deploy em staging e validação QA
- [ ] Aprovação do PO (Product Owner)

### Dependências Entre Épicos
```
ÉPICO 1 (Segurança) → ÉPICO 2 (Qualidade Código) → ÉPICO 4 (UX)
                              ↓
                        ÉPICO 3 (BD) → ÉPICO 5 (DevOps)
```

---

**Documento vivo — atualizar semanalmente conforme progresso.**

**Responsável pela Gestão do Backlog:** Tech Lead TCE-RO  
**Revisões:** Quinzenais (retrospectiva de sprint)  
**Próxima Revisão:** 27 de maio de 2026
