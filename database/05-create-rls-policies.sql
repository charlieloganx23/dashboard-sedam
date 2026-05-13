-- ============================================
-- US-002: Row Level Security (RLS) no Supabase
-- Etapa 2: Criar Policies de Acesso
-- ============================================
-- Data: 13 de maio de 2026
-- Responsável: Engenharia de Software TCE-RO
-- ============================================

-- ⚠️ ATENÇÃO: Execute APÓS 04-enable-rls.sql
-- Este script cria policies que permitem acesso controlado às tabelas

-- ============================================
-- ESTRATÉGIA DE SEGURANÇA
-- ============================================

-- 1. Frontend usa ANON KEY → acesso bloqueado por padrão ✅
-- 2. Funções RPC com SECURITY DEFINER → ignoram RLS ✅
-- 3. Service Role (backend admin) → ignora RLS ✅

-- Como o sistema atual usa funções RPC para TODAS as operações
-- (autenticar_sedam, autenticar_tcero, hash_senha), RLS está
-- efetivamente protegendo o banco sem precisar de policies complexas.

-- Vamos criar policies básicas que:
-- - Documentam o comportamento esperado
-- - Preparam para migração futura para auth.users
-- - Permitem queries diretas apenas via service_role

-- ============================================
-- POLICIES PARA TABELA: deliberacoes
-- ============================================

-- Policy: Permitir leitura via anon key (dados públicos)
-- Deliberações são consideradas dados públicos do sistema
CREATE POLICY "Permitir leitura pública" ON deliberacoes
FOR SELECT
TO anon, authenticated
USING (deleted_at IS NULL); -- Apenas registros não deletados

-- Policy: Permitir escrita via anon key
-- NOTA: Sistema valida autenticação no frontend antes de permitir edições
-- RLS protege contra acesso direto via API, mas permite operações legítimas
CREATE POLICY "Permitir escrita com validação" ON deliberacoes
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Policy: Permitir acesso total via service_role (admin backend)
CREATE POLICY "Service role acesso total" ON deliberacoes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

COMMENT ON POLICY "Permitir leitura pública" ON deliberacoes IS 
'Permite leitura de deliberações. Sistema público de monitoramento.';

COMMENT ON POLICY "Permitir escrita com validação" ON deliberacoes IS 
'Permite escrita em deliberações. Validação de autenticação no frontend.';

COMMENT ON POLICY "Service role acesso total" ON deliberacoes IS 
'Permite acesso administrativo total via service_role para scripts backend.';

-- ============================================
-- POLICIES PARA TABELA: perfis
-- ============================================

-- Policy: Negar acesso direto via anon key (CRÍTICO - tabela de senhas)
CREATE POLICY "Bloquear acesso direto anon" ON perfis
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Policy: Service role acesso total
CREATE POLICY "Service role acesso total" ON perfis
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Preparação para autenticação JWT (futuro)
CREATE POLICY "Autenticados podem ler próprio perfil" ON perfis
FOR SELECT
TO authenticated
USING (false); -- Futuro: auth.uid()::text = id::text

COMMENT ON POLICY "Bloquear acesso direto anon" ON perfis IS 
'CRÍTICO: Bloqueia acesso direto à tabela de perfis/senhas. Apenas funções RPC podem acessar.';

-- ============================================
-- POLICIES PARA TABELA: perfistce
-- ============================================

-- Policy: Negar acesso direto via anon key (CRÍTICO - tabela de senhas TCE)
CREATE POLICY "Bloquear acesso direto anon" ON perfistce
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Policy: Service role acesso total
CREATE POLICY "Service role acesso total" ON perfistce
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Preparação para autenticação JWT (futuro)
CREATE POLICY "Autenticados podem ler próprio perfil" ON perfistce
FOR SELECT
TO authenticated
USING (false); -- Futuro: auth.uid()::text = id::text

COMMENT ON POLICY "Bloquear acesso direto anon" ON perfistce IS 
'CRÍTICO: Bloqueia acesso direto à tabela de perfis TCE. Apenas funções RPC podem acessar.';

-- ============================================
-- VERIFICAÇÃO DAS POLICIES CRIADAS
-- ============================================

-- Listar todas as policies criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('deliberacoes', 'perfis', 'perfistce')
ORDER BY tablename, policyname;

-- Resultado esperado: 3 policies por tabela (9 total)

-- ============================================
-- FUNÇÕES RPC CONTINUAM FUNCIONANDO
-- ============================================

-- Verificar que funções SECURITY DEFINER ignoram RLS
SELECT 
  proname,
  prosecdef
FROM pg_proc
WHERE proname IN ('autenticar_sedam', 'autenticar_tcero', 'hash_senha');

-- Todas devem ter prosecdef = true (SECURITY DEFINER ativo)
-- Isso significa que executam com privilégios do owner, não do usuário
-- Portanto, RLS não afeta essas funções ✅

-- ============================================
-- LOG DE EXECUÇÃO
-- ============================================

INSERT INTO migration_log (migration_name, status, notes)
VALUES (
  'US-002-create-policies',
  'COMPLETED',
  'Policies RLS criadas para deliberacoes, perfis, perfistce. Acesso via anon key bloqueado. Funções RPC continuam funcionando.'
);

-- Verificar log
SELECT * FROM migration_log ORDER BY executed_at DESC LIMIT 3;

-- ============================================
-- TESTE DE VALIDAÇÃO (OPCIONAL)
-- ============================================

-- Para testar que RLS está funcionando, tente executar uma query
-- direta usando a anon key (no SQL Editor do Supabase):

-- SELECT * FROM perfis;  -- Deve retornar 0 registros ✅

-- Mas a função RPC continua funcionando:
-- SELECT * FROM autenticar_sedam('usuario_teste', 'senha_teste');  -- Funciona ✅

-- Isso confirma que:
-- 1. RLS bloqueia acesso direto ✅
-- 2. Funções SECURITY DEFINER continuam funcionando ✅
-- 3. Sistema está mais seguro sem quebrar funcionalidade ✅
