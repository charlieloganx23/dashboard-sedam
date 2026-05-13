# 🔀 Git Workflow — Dashboard SEDAM (Fork Strategy)

**Data de Configuração:** 13 de maio de 2026  
**Estratégia:** Fork + Pull Request

---

## 📍 Configuração Atual

### Remotes Configurados

```bash
git remote -v
```

| Remote | URL | Permissões | Uso |
|---|---|---|---|
| **origin** | `https://github.com/projetosetags/dashboard-sedam` | 📖 Leitura | Repositório upstream (oficial) |
| **meu-fork** | `https://github.com/charlieloganx23/dashboard-sedam` | ✍️ Leitura/Escrita | Seu fork pessoal |

### Branches

| Branch | Rastreando | Propósito |
|---|---|---|
| **main** | `origin/main` | Código estável do repositório oficial |
| **ambientedeteste** | `meu-fork/ambientedeteste` | Branch de desenvolvimento (ATIVA) |

---

## 🔄 Workflow Diário

### 1️⃣ Fazer Alterações (Desenvolvimento)

```bash
# Você já está em ambientedeteste
git branch  # confirmar branch atual

# Fazer alterações nos arquivos...

# Adicionar e commitar
git add .
git commit -m "feat: implementa US-003 variáveis de ambiente"
```

### 2️⃣ Enviar para Seu Fork

```bash
# Push para SEU fork (meu-fork)
git push

# Ou explicitamente:
git push meu-fork ambientedeteste
```

✅ **Agora você tem permissão de push!**

### 3️⃣ Criar Pull Request

Quando quiser mesclar suas alterações no repositório oficial:

1. **Acesse seu fork no GitHub:**
   - https://github.com/charlieloganx23/dashboard-sedam

2. **Clique em "Contribute" → "Open pull request"**

3. **Configure o PR:**
   - **Base repository:** `projetosetags/dashboard-sedam`
   - **Base branch:** `ambientedeteste`
   - **Head repository:** `charlieloganx23/dashboard-sedam`
   - **Compare branch:** `ambientedeteste`

4. **Preencha:**
   - Título: `feat: implementa melhorias de segurança (US-001, US-002, US-003)`
   - Descrição: Lista as alterações, screenshots, etc.

5. **Aguarde aprovação e merge**

---

## 🔄 Sincronizar com Repositório Upstream

Quando o repositório oficial (`projetosetags`) tiver atualizações:

### Atualizar Main Local

```bash
# Mudar para main
git checkout main

# Puxar atualizações do repositório oficial
git pull origin main

# Enviar para seu fork (opcional)
git push meu-fork main
```

### Atualizar Branch de Desenvolvimento

```bash
# Voltar para ambientedeteste
git checkout ambientedeteste

# Fazer merge das atualizações de main
git merge main

# Resolver conflitos se houver...

# Enviar para seu fork
git push meu-fork ambientedeteste
```

---

## 🚀 Comandos Úteis

### Ver Diferenças Entre Branches

```bash
# Ver commits na sua branch que não estão no upstream
git log origin/ambientedeteste..ambientedeteste

# Ver arquivos modificados
git diff origin/ambientedeteste
```

### Desfazer Alterações Locais

```bash
# Descartar mudanças não commitadas
git checkout -- arquivo.js

# Reverter último commit (mantém alterações)
git reset --soft HEAD~1

# Reverter último commit (descarta alterações)
git reset --hard HEAD~1
```

### Limpar Branch

```bash
# Ver branches locais
git branch

# Deletar branch local (após merge)
git branch -d nome-da-branch

# Forçar deleção
git branch -D nome-da-branch
```

---

## 📋 Checklist de Commit

Antes de fazer commit, verifique:

- [ ] Código testado localmente
- [ ] Sem `console.log()` desnecessários
- [ ] Arquivos sensíveis não commitados (`.env`, `config.js`)
- [ ] Mensagem de commit segue padrão:
  - `feat:` nova funcionalidade
  - `fix:` correção de bug
  - `docs:` documentação
  - `refactor:` refatoração de código
  - `test:` adição de testes
  - `chore:` tarefas de manutenção

---

## 🎯 Boas Práticas

### Commits Pequenos e Frequentes

❌ **Ruim:**
```bash
git commit -m "implementa tudo"  # 500 linhas alteradas
```

✅ **Bom:**
```bash
git commit -m "feat(auth): adiciona hash bcrypt nas senhas"
git commit -m "test(auth): adiciona testes de autenticação"
git commit -m "docs(auth): documenta novo fluxo de login"
```

### Mensagens Descritivas

❌ **Ruim:**
```bash
git commit -m "fix"
git commit -m "ajustes"
git commit -m "wip"
```

✅ **Bom:**
```bash
git commit -m "fix(ui): corrige overflow na tabela de deliberações"
git commit -m "refactor(charts): extrai lógica de gráficos para módulo separado"
```

---

## 🔐 Segurança

### Arquivos que NUNCA devem ser commitados

Já configurados no `.gitignore`:

```gitignore
# Credenciais
config.js
.env
.env.local
.env.production

# Node modules
node_modules/
dist/
build/

# IDEs
.vscode/
.idea/
*.swp

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db
```

### Verificar Antes de Push

```bash
# Ver o que será enviado
git log origin/ambientedeteste..HEAD

# Ver diferenças em arquivos
git diff origin/ambientedeteste

# Se encontrar algo sensível:
git reset --soft HEAD~1  # Desfaz commit mantendo alterações
# Remover arquivo sensível
# Refazer commit
```

---

## 🆘 Problemas Comuns

### Erro 403 (Permission Denied)

```bash
remote: Permission denied
fatal: unable to access 'https://github.com/projetosetags/...'
```

**Solução:** Você está tentando fazer push para `origin` em vez de `meu-fork`

```bash
# Errado:
git push origin ambientedeteste

# Certo:
git push meu-fork ambientedeteste
# Ou apenas:
git push  # (já configurado para meu-fork)
```

---

### Conflitos de Merge

```bash
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
```

**Solução:**

1. Abrir arquivo com conflito
2. Procurar por marcadores `<<<<<<<`, `=======`, `>>>>>>>`
3. Resolver manualmente (escolher qual código manter)
4. Remover os marcadores
5. Commitar a resolução:

```bash
git add index.html
git commit -m "merge: resolve conflitos em index.html"
```

---

### Branch Desatualizada

```bash
Your branch is behind 'meu-fork/ambientedeteste' by 5 commits
```

**Solução:**

```bash
git pull  # Puxa atualizações do fork
```

---

## 📊 Visualizar Histórico

### Log Bonito

```bash
git log --oneline --graph --all --decorate
```

### Ver Autores

```bash
git shortlog -sn
```

### Ver Estatísticas

```bash
git diff --stat origin/ambientedeteste
```

---

## 🎓 Resumo Rápido

```bash
# Workflow completo em 4 passos:

# 1. Fazer alterações
code index.html

# 2. Commitar
git add .
git commit -m "feat: adiciona loading spinner"

# 3. Enviar para seu fork
git push

# 4. Criar Pull Request no GitHub
# (interface web)
```

---

**Dúvidas?** Consulte a [documentação oficial do Git](https://git-scm.com/doc) ou abra uma issue no repositório.

**Última atualização:** 13/05/2026
