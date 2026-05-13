-- ============================================
-- US-002: Row Level Security (RLS) no Supabase
-- Etapa 1: Ativar RLS nas tabelas
-- ============================================
-- Data: 13 de maio de 2026
-- Responsável: Engenharia de Software TCE-RO
-- ============================================

-- ⚠️ ATENÇÃO: Execute este script APÓS US-001 estar funcionando
-- ⚠️ FAÇA BACKUP DO BANCO ANTES DE EXECUTAR
-- ⚠️ Recomendado: Testar em ambiente de staging primeiro

-- ============================================
-- PARTE 1: Ativar RLS em todas as tabelas
-- ============================================

-- Ativar RLS na tabela de deliberações
ALTER TABLE deliberacoes ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela de perfis SEDAM
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela de perfis TCE-RO
ALTER TABLE perfistce ENABLE ROW LEVEL SECURITY;

-- Verificar se RLS foi ativado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('deliberacoes', 'perfis', 'perfistce')
ORDER BY tablename;

-- Resultado esperado: rls_enabled = true para todas as 3 tabelas

-- ============================================
-- OBSERVAÇÕES IMPORTANTES
-- ============================================

-- Com RLS ativado SEM policies, NENHUM acesso é permitido por padrão
-- Isso significa que:
-- 1. Queries diretas via anon key serão BLOQUEADAS ✅
-- 2. Apenas funções com SECURITY DEFINER podem acessar (como nossas RPCs)
-- 3. Service role (backend) ignora RLS e tem acesso total

-- Este é o comportamento desejado porque:
-- - Frontend não pode mais ler/escrever diretamente nas tabelas
-- - Toda lógica de negócio passa pelas funções RPC seguras
-- - Protege contra acesso não autorizado mesmo que a anon key vaze

-- ============================================
-- LOG DE EXECUÇÃO
-- ============================================

INSERT INTO migration_log (migration_name, status, notes)
VALUES (
  'US-002-enable-rls',
  'COMPLETED',
  'RLS ativado em deliberacoes, perfis, perfistce. Acesso agora controlado via funções SECURITY DEFINER.'
);

-- Verificar log
SELECT * FROM migration_log ORDER BY executed_at DESC LIMIT 3;
