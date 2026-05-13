-- ============================================
-- US-001: Hash de Senhas com Bcrypt
-- Etapa 1: Habilitar extensão pgcrypto
-- ============================================
-- Data: 13 de maio de 2026
-- Responsável: Engenharia de Software TCE-RO
-- ============================================

-- Habilitar extensão pgcrypto (se não estiver habilitada)
-- No Supabase, isso geralmente já está disponível
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verificar se a extensão está instalada
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';
