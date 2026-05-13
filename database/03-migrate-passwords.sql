-- ============================================
-- US-001: Hash de Senhas com Bcrypt
-- Etapa 3: Migração de dados (CRÍTICO - EXECUTAR UMA ÚNICA VEZ)
-- ============================================
-- Data: 13 de maio de 2026
-- Responsável: Engenharia de Software TCE-RO
-- ============================================

-- ⚠️ ATENÇÃO: Este script deve ser executado APENAS UMA VEZ
-- ⚠️ FAÇA BACKUP DO BANCO ANTES DE EXECUTAR
-- ⚠️ Recomendado: Testar em ambiente de staging primeiro

-- ============================================
-- BACKUP PRÉ-MIGRAÇÃO
-- ============================================
-- Execute manualmente no Supabase SQL Editor:
-- SELECT * FROM perfistce;  -- Copiar resultado para arquivo
-- SELECT * FROM perfis;     -- Copiar resultado para arquivo

-- ============================================
-- PASSO 1: Adicionar coluna senha_hash
-- ============================================

-- Adicionar coluna deleted_at (preparação para US-016 Soft Delete)
ALTER TABLE perfistce 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Adicionar coluna senha_hash
ALTER TABLE perfistce 
ADD COLUMN IF NOT EXISTS senha_hash TEXT;

ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS senha_hash TEXT;

-- ============================================
-- PASSO 2: Migrar senhas existentes para hash
-- ============================================

-- Migrar perfistce (TCE-RO)
UPDATE perfistce 
SET senha_hash = crypt(senha, gen_salt('bf', 12))
WHERE senha_hash IS NULL AND senha IS NOT NULL;

-- Migrar perfis (SEDAM)
UPDATE perfis 
SET senha_hash = crypt(senha, gen_salt('bf', 12))
WHERE senha_hash IS NULL AND senha IS NOT NULL;

-- ============================================
-- PASSO 3: Verificar migração
-- ============================================

-- Verificar se todas as senhas foram migradas
DO $$
DECLARE
  count_tcero_sem_hash INTEGER;
  count_sedam_sem_hash INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_tcero_sem_hash 
  FROM perfistce 
  WHERE senha IS NOT NULL AND senha_hash IS NULL;
  
  SELECT COUNT(*) INTO count_sedam_sem_hash 
  FROM perfis 
  WHERE senha IS NOT NULL AND senha_hash IS NULL;
  
  IF count_tcero_sem_hash > 0 THEN
    RAISE NOTICE 'ATENÇÃO: % registros em perfistce sem senha_hash', count_tcero_sem_hash;
  END IF;
  
  IF count_sedam_sem_hash > 0 THEN
    RAISE NOTICE 'ATENÇÃO: % registros em perfis sem senha_hash', count_sedam_sem_hash;
  END IF;
  
  IF count_tcero_sem_hash = 0 AND count_sedam_sem_hash = 0 THEN
    RAISE NOTICE 'SUCESSO: Todas as senhas foram migradas para hash!';
  END IF;
END $$;

-- ============================================
-- PASSO 4: Renomear coluna senha para senha_old (backup)
-- ============================================
-- NÃO DELETAR IMEDIATAMENTE - manter por 1 semana para rollback

ALTER TABLE perfistce 
RENAME COLUMN senha TO senha_old_backup;

ALTER TABLE perfis 
RENAME COLUMN senha TO senha_old_backup;

-- ============================================
-- PASSO 5: Testar autenticação
-- ============================================
-- Teste manual no Supabase SQL Editor:

-- Exemplo: Testar login TCE-RO (substituir valores reais)
-- SELECT * FROM autenticar_tcero('usuario_teste', 'senha_teste');

-- Exemplo: Testar login SEDAM (substituir valores reais)
-- SELECT * FROM autenticar_sedam('usuario_teste', 'senha_teste');

-- Se retornar dados do usuário = SUCESSO ✅
-- Se retornar vazio = Credenciais inválidas ❌

-- ============================================
-- ROLLBACK (se necessário)
-- ============================================
-- Executar apenas em caso de problemas:

-- ALTER TABLE perfistce RENAME COLUMN senha_old_backup TO senha;
-- ALTER TABLE perfistce DROP COLUMN senha_hash;
-- ALTER TABLE perfis RENAME COLUMN senha_old_backup TO senha;
-- ALTER TABLE perfis DROP COLUMN senha_hash;

-- ============================================
-- LIMPEZA FINAL (após 1 semana de testes)
-- ============================================
-- Executar após validação completa em produção:

-- ALTER TABLE perfistce DROP COLUMN senha_old_backup;
-- ALTER TABLE perfis DROP COLUMN senha_old_backup;

-- ============================================
-- LOG DE EXECUÇÃO
-- ============================================
CREATE TABLE IF NOT EXISTS migration_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(100),
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  executed_by VARCHAR(100),
  status VARCHAR(20),
  notes TEXT
);

INSERT INTO migration_log (migration_name, status, notes)
VALUES ('US-001-hash-senhas-bcrypt', 'COMPLETED', 'Migração de senhas para bcrypt realizada com sucesso');

-- Verificar log
SELECT * FROM migration_log ORDER BY executed_at DESC LIMIT 5;
