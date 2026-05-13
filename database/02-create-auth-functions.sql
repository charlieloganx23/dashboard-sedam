-- ============================================
-- US-001: Hash de Senhas com Bcrypt
-- Etapa 2: Criar função de autenticação segura
-- ============================================
-- Data: 13 de maio de 2026
-- Responsável: Engenharia de Software TCE-RO
-- ============================================

-- Função para autenticar usuário TCE-RO
-- Retorna o perfil completo se credenciais forem válidas, senão retorna NULL
CREATE OR REPLACE FUNCTION autenticar_tcero(
  p_username TEXT,
  p_senha_plana TEXT
)
RETURNS TABLE (
  id INTEGER,
  nome_completo TEXT,
  username TEXT,
  cargo TEXT,
  nivel_acesso TEXT,
  permissao_pdf BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.id,
    pt.nome_completo,
    pt.username,
    pt.cargo,
    pt.nivel_acesso,
    pt.permissao_pdf
  FROM perfistce pt
  WHERE pt.username = p_username
    AND pt.senha_hash = crypt(p_senha_plana, pt.senha_hash)
    AND pt.deleted_at IS NULL; -- Preparado para soft delete futuro
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para autenticar usuário SEDAM
-- Retorna o perfil completo se credenciais forem válidas, senão retorna NULL
CREATE OR REPLACE FUNCTION autenticar_sedam(
  p_username TEXT,
  p_senha_plana TEXT
)
RETURNS TABLE (
  id INTEGER,
  nome_completo TEXT,
  username TEXT,
  cargo TEXT,
  nivel_acesso TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome_completo,
    p.username,
    p.cargo,
    p.nivel_acesso
  FROM perfis p
  WHERE p.username = p_username
    AND p.senha_hash = crypt(p_senha_plana, p.senha_hash)
    AND p.deleted_at IS NULL; -- Preparado para soft delete futuro
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar/atualizar senha com hash
-- Uso: SELECT hash_senha('minha_senha_123')
CREATE OR REPLACE FUNCTION hash_senha(p_senha_plana TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(p_senha_plana, gen_salt('bf', 12));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários para documentação
COMMENT ON FUNCTION autenticar_tcero IS 'Autentica usuário TCE-RO usando bcrypt. Retorna perfil completo ou vazio se credenciais inválidas.';
COMMENT ON FUNCTION autenticar_sedam IS 'Autentica usuário SEDAM usando bcrypt. Retorna perfil completo ou vazio se credenciais inválidas.';
COMMENT ON FUNCTION hash_senha IS 'Gera hash bcrypt de uma senha em texto plano. Cost factor: 12 (recomendado OWASP 2026).';
