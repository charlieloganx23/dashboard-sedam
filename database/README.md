# 🗄️ Scripts SQL — Dashboard SEDAM

Scripts de banco de dados para melhorias de segurança e manutenção.

---

## 📋 Ordem de Execução

Execute os scripts **NA ORDEM NUMÉRICA** no **Supabase SQL Editor**.

| # | Arquivo | Descrição | Requer Backup? |
|---|---|---|---|
| 1 | `01-enable-pgcrypto.sql` | Habilita extensão de criptografia | ❌ Não |
| 2 | `02-create-auth-functions.sql` | Cria funções de autenticação bcrypt | ❌ Não |
| 3 | `03-migrate-passwords.sql` | **Migra senhas para hash** | ✅ **SIM - CRÍTICO** |

---

## ⚠️ IMPORTANTE

### Antes de Executar Qualquer Script

1. **Fazer backup completo do banco de dados**
2. **Testar primeiro em staging**
3. **Ler a documentação:** [docs/US-001-IMPLEMENTACAO.md](../docs/US-001-IMPLEMENTACAO.md)
4. **Executar fora do horário comercial**

---

## 🚀 Como Executar

### 1. Acessar Supabase

```
https://app.supabase.com/project/SEU_PROJETO_ID/sql
```

### 2. Executar Scripts

1. Abrir arquivo no editor de texto
2. Copiar conteúdo completo
3. Colar no SQL Editor do Supabase
4. Clicar em "Run" ou Ctrl+Enter
5. Verificar resultado na aba "Results"

### 3. Verificar Sucesso

Cada script tem seção de verificação no final. Exemplo:

```sql
-- Verificar se extensão foi instalada
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';
```

Se retornar linhas = ✅ Sucesso  
Se retornar vazio = ❌ Erro (verificar logs)

---

## 🔄 Rollback

### Script 01 e 02 (Reversível sem Perda de Dados)

```sql
-- Remover funções (se necessário)
DROP FUNCTION IF EXISTS autenticar_sedam;
DROP FUNCTION IF EXISTS autenticar_tcero;
DROP FUNCTION IF EXISTS hash_senha;
```

### Script 03 (CUIDADO - Tem Rollback Automático)

O script já renomeia `senha` para `senha_old_backup` ao invés de deletar.

**Para reverter:**

```sql
-- Voltar ao estado anterior
ALTER TABLE perfistce RENAME COLUMN senha_old_backup TO senha;
ALTER TABLE perfistce DROP COLUMN senha_hash;
ALTER TABLE perfis RENAME COLUMN senha_old_backup TO senha;
ALTER TABLE perfis DROP COLUMN senha_hash;
```

---

## 📊 Log de Execução

Cada execução é registrada em `migration_log`:

```sql
SELECT * FROM migration_log ORDER BY executed_at DESC;
```

---

## 🆘 Suporte

Dúvidas ou problemas? Consulte:

- **Documentação completa:** [docs/US-001-IMPLEMENTACAO.md](../docs/US-001-IMPLEMENTACAO.md)
- **Troubleshooting:** Seção "🐛 Troubleshooting" na documentação
- **Issues:** https://github.com/charlieloganx23/dashboard-sedam/issues

---

**Última atualização:** 13 de maio de 2026
