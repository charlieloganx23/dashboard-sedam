-- ============================================
-- US-002: Row Level Security (RLS) no Supabase
-- Etapa 3: Funções RPC para acesso seguro aos dados
-- ============================================
-- Data: 13 de maio de 2026
-- Responsável: Engenharia de Software TCE-RO
-- ============================================

-- Com RLS ativado, queries diretas a perfis/perfistce via anon key
-- são bloqueadas (correto, pois contêm senha_hash).
-- Criamos funções RPC que retornam dados seguros (sem senha_hash).

-- ============================================
-- FUNÇÕES PARA LISTAR PERFIS (sem expor senhas)
-- ============================================

-- Listar perfis SEDAM (sem senha_hash)
CREATE OR REPLACE FUNCTION listar_perfis_sedam()
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
  WHERE p.deleted_at IS NULL
  ORDER BY p.nome_completo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Listar perfis TCE-RO (sem senha_hash)
CREATE OR REPLACE FUNCTION listar_perfis_tcero()
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
  WHERE pt.deleted_at IS NULL
  ORDER BY pt.nome_completo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION listar_perfis_sedam IS 
'Lista perfis SEDAM sem expor senha_hash. Seguro para uso via anon key.';

COMMENT ON FUNCTION listar_perfis_tcero IS 
'Lista perfis TCE-RO sem expor senha_hash. Seguro para uso via anon key.';

-- ============================================
-- FUNÇÕES PARA CRIAR PERFIS (com hash)
-- ============================================

-- Criar perfil SEDAM (já integra hash)
CREATE OR REPLACE FUNCTION criar_perfil_sedam(
  p_nome_completo TEXT,
  p_username TEXT,
  p_senha_plana TEXT,
  p_cargo TEXT DEFAULT '',
  p_nivel_acesso TEXT DEFAULT '4'
)
RETURNS JSON AS $$
DECLARE
  v_senha_hash TEXT;
  v_novo_id INTEGER;
BEGIN
  -- Validar inputs
  IF p_nome_completo IS NULL OR TRIM(p_nome_completo) = '' THEN
    RETURN json_build_object('error', 'Nome é obrigatório');
  END IF;
  
  IF p_username IS NULL OR TRIM(p_username) = '' THEN
    RETURN json_build_object('error', 'Usuário é obrigatório');
  END IF;
  
  IF p_senha_plana IS NULL OR TRIM(p_senha_plana) = '' THEN
    RETURN json_build_object('error', 'Senha é obrigatória');
  END IF;
  
  -- Verificar se username já existe
  IF EXISTS (SELECT 1 FROM perfis WHERE username = LOWER(TRIM(p_username))) THEN
    RETURN json_build_object('error', 'Usuário já existe');
  END IF;
  
  -- Gerar hash da senha
  v_senha_hash := crypt(p_senha_plana, gen_salt('bf', 12));
  
  -- Inserir perfil
  INSERT INTO perfis (nome_completo, username, senha_hash, cargo, nivel_acesso)
  VALUES (
    TRIM(p_nome_completo),
    LOWER(TRIM(p_username)),
    v_senha_hash,
    TRIM(p_cargo),
    p_nivel_acesso
  )
  RETURNING id INTO v_novo_id;
  
  RETURN json_build_object('success', true, 'id', v_novo_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar perfil TCE-RO (já integra hash)
CREATE OR REPLACE FUNCTION criar_perfil_tcero(
  p_nome_completo TEXT,
  p_username TEXT,
  p_senha_plana TEXT,
  p_cargo TEXT DEFAULT '',
  p_nivel_acesso TEXT DEFAULT '4',
  p_permissao_pdf BOOLEAN DEFAULT false
)
RETURNS JSON AS $$
DECLARE
  v_senha_hash TEXT;
  v_novo_id INTEGER;
BEGIN
  -- Validar inputs
  IF p_nome_completo IS NULL OR TRIM(p_nome_completo) = '' THEN
    RETURN json_build_object('error', 'Nome é obrigatório');
  END IF;
  
  IF p_username IS NULL OR TRIM(p_username) = '' THEN
    RETURN json_build_object('error', 'Usuário é obrigatório');
  END IF;
  
  IF p_senha_plana IS NULL OR TRIM(p_senha_plana) = '' THEN
    RETURN json_build_object('error', 'Senha é obrigatória');
  END IF;
  
  -- Verificar se username já existe
  IF EXISTS (SELECT 1 FROM perfistce WHERE username = LOWER(TRIM(p_username))) THEN
    RETURN json_build_object('error', 'Usuário já existe');
  END IF;
  
  -- Gerar hash da senha
  v_senha_hash := crypt(p_senha_plana, gen_salt('bf', 12));
  
  -- Inserir perfil
  INSERT INTO perfistce (nome_completo, username, senha_hash, cargo, nivel_acesso, permissao_pdf)
  VALUES (
    TRIM(p_nome_completo),
    LOWER(TRIM(p_username)),
    v_senha_hash,
    TRIM(p_cargo),
    p_nivel_acesso,
    p_permissao_pdf
  )
  RETURNING id INTO v_novo_id;
  
  RETURN json_build_object('success', true, 'id', v_novo_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNÇÕES PARA ATUALIZAR PERFIS
-- ============================================

-- Atualizar perfil SEDAM
CREATE OR REPLACE FUNCTION atualizar_perfil_sedam(
  p_id INTEGER,
  p_nome_completo TEXT,
  p_username TEXT,
  p_senha_plana TEXT DEFAULT NULL,  -- NULL = não alterar senha
  p_cargo TEXT DEFAULT '',
  p_nivel_acesso TEXT DEFAULT '4'
)
RETURNS JSON AS $$
DECLARE
  v_senha_hash TEXT;
BEGIN
  -- Verificar se perfil existe
  IF NOT EXISTS (SELECT 1 FROM perfis WHERE id = p_id) THEN
    RETURN json_build_object('error', 'Perfil não encontrado');
  END IF;
  
  -- Se senha fornecida, gerar hash
  IF p_senha_plana IS NOT NULL AND TRIM(p_senha_plana) != '' THEN
    v_senha_hash := crypt(p_senha_plana, gen_salt('bf', 12));
    
    UPDATE perfis 
    SET 
      nome_completo = TRIM(p_nome_completo),
      username = LOWER(TRIM(p_username)),
      senha_hash = v_senha_hash,
      cargo = TRIM(p_cargo),
      nivel_acesso = p_nivel_acesso
    WHERE id = p_id;
  ELSE
    -- Não alterar senha
    UPDATE perfis 
    SET 
      nome_completo = TRIM(p_nome_completo),
      username = LOWER(TRIM(p_username)),
      cargo = TRIM(p_cargo),
      nivel_acesso = p_nivel_acesso
    WHERE id = p_id;
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar perfil TCE-RO
CREATE OR REPLACE FUNCTION atualizar_perfil_tcero(
  p_id INTEGER,
  p_nome_completo TEXT,
  p_username TEXT,
  p_senha_plana TEXT DEFAULT NULL,
  p_cargo TEXT DEFAULT '',
  p_nivel_acesso TEXT DEFAULT '4',
  p_permissao_pdf BOOLEAN DEFAULT false
)
RETURNS JSON AS $$
DECLARE
  v_senha_hash TEXT;
BEGIN
  -- Verificar se perfil existe
  IF NOT EXISTS (SELECT 1 FROM perfistce WHERE id = p_id) THEN
    RETURN json_build_object('error', 'Perfil não encontrado');
  END IF;
  
  -- Se senha fornecida, gerar hash
  IF p_senha_plana IS NOT NULL AND TRIM(p_senha_plana) != '' THEN
    v_senha_hash := crypt(p_senha_plana, gen_salt('bf', 12));
    
    UPDATE perfistce 
    SET 
      nome_completo = TRIM(p_nome_completo),
      username = LOWER(TRIM(p_username)),
      senha_hash = v_senha_hash,
      cargo = TRIM(p_cargo),
      nivel_acesso = p_nivel_acesso,
      permissao_pdf = p_permissao_pdf
    WHERE id = p_id;
  ELSE
    UPDATE perfistce 
    SET 
      nome_completo = TRIM(p_nome_completo),
      username = LOWER(TRIM(p_username)),
      cargo = TRIM(p_cargo),
      nivel_acesso = p_nivel_acesso,
      permissao_pdf = p_permissao_pdf
    WHERE id = p_id;
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNÇÕES PARA DELETAR PERFIS
-- ============================================

-- Deletar perfil SEDAM (soft delete)
CREATE OR REPLACE FUNCTION deletar_perfil_sedam(p_id INTEGER)
RETURNS JSON AS $$
BEGIN
  -- Verificar se perfil existe
  IF NOT EXISTS (SELECT 1 FROM perfis WHERE id = p_id AND deleted_at IS NULL) THEN
    RETURN json_build_object('error', 'Perfil não encontrado');
  END IF;
  
  -- Soft delete
  UPDATE perfis 
  SET deleted_at = NOW()
  WHERE id = p_id;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deletar perfil TCE-RO (soft delete)
CREATE OR REPLACE FUNCTION deletar_perfil_tcero(p_id INTEGER)
RETURNS JSON AS $$
BEGIN
  -- Verificar se perfil existe
  IF NOT EXISTS (SELECT 1 FROM perfistce WHERE id = p_id AND deleted_at IS NULL) THEN
    RETURN json_build_object('error', 'Perfil não encontrado');
  END IF;
  
  -- Proteger perfis críticos
  IF EXISTS (
    SELECT 1 FROM perfistce 
    WHERE id = p_id 
    AND LOWER(username) IN ('manoel', 'vagner', 'gleidi')
  ) THEN
    RETURN json_build_object('error', 'Perfil protegido não pode ser excluído');
  END IF;
  
  -- Soft delete
  UPDATE perfistce 
  SET deleted_at = NOW()
  WHERE id = p_id;
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ============================================

COMMENT ON FUNCTION criar_perfil_sedam IS 
'Cria novo perfil SEDAM com senha hasheada. Validações embutidas. Retorna JSON com success/error.';

COMMENT ON FUNCTION criar_perfil_tcero IS 
'Cria novo perfil TCE-RO com senha hasheada. Validações embutidas. Retorna JSON com success/error.';

COMMENT ON FUNCTION atualizar_perfil_sedam IS 
'Atualiza perfil SEDAM. Se senha_plana = NULL, mantém senha atual.';

COMMENT ON FUNCTION atualizar_perfil_tcero IS 
'Atualiza perfil TCE-RO. Se senha_plana = NULL, mantém senha atual.';

COMMENT ON FUNCTION deletar_perfil_sedam IS 
'Soft delete de perfil SEDAM (marca deleted_at). Retorna JSON com success/error.';

COMMENT ON FUNCTION deletar_perfil_tcero IS 
'Soft delete de perfil TCE-RO (marca deleted_at). Protege perfis críticos. Retorna JSON com success/error.';

-- ============================================
-- LOG DE EXECUÇÃO
-- ============================================

INSERT INTO migration_log (migration_name, status, notes)
VALUES (
  'US-002-create-rpc-functions',
  'COMPLETED',
  'Funções RPC criadas para CRUD seguro de perfis sem expor senha_hash.'
);

-- Verificar funções criadas
SELECT 
  proname,
  prosecdef,
  pg_get_function_arguments(oid) as argumentos
FROM pg_proc
WHERE proname LIKE '%perfil%'
ORDER BY proname;

-- Resultado esperado: 6 novas funções listadas
