-- Migração para a nova estrutura de Condições de Pagamento
BEGIN;

-- 1. Renomear a tabela antiga e criar a nova estrutura
ALTER TABLE IF EXISTS dbo.CondicaoPagamento RENAME TO condicao_pagamento_old;

-- 2. Criar a nova tabela de condições de pagamento
CREATE TABLE IF NOT EXISTS dbo.condicao_pagamento (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

-- 3. Criar a tabela de parcelas das condições de pagamento
CREATE TABLE IF NOT EXISTS dbo.parcela_condicao_pagamento (
  id SERIAL PRIMARY KEY,
  condicao_pagamento_id INTEGER NOT NULL REFERENCES dbo.condicao_pagamento(id),
  numero_parcela INTEGER NOT NULL,
  forma_pagamento_id UUID NOT NULL REFERENCES dbo.forma_pagamento(id),
  dias_para_pagamento INTEGER NOT NULL,
  percentual_valor DECIMAL(5,2) NOT NULL,
  taxa_juros DECIMAL(5,2) NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  CONSTRAINT uk_numero_parcela_por_condicao UNIQUE (condicao_pagamento_id, numero_parcela)
);

-- 4. Migrar dados da tabela antiga para a nova estrutura (se houver dados)
INSERT INTO dbo.condicao_pagamento (nome, descricao, ativo, created_at, updated_at)
SELECT 
  descricao, 
  CASE 
    WHEN dias IS NOT NULL AND parcelas IS NOT NULL THEN 
      'Dias: ' || dias || ', Parcelas: ' || parcelas
    ELSE NULL
  END as descricao,
  ativo,
  created_at,
  updated_at
FROM dbo.condicao_pagamento_old;

-- 5. Adicionar trigger para atualização automática do timestamp
CREATE TRIGGER update_condicao_pagamento_timestamp
BEFORE UPDATE ON dbo.condicao_pagamento
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_parcela_condicao_pagamento_timestamp
BEFORE UPDATE ON dbo.parcela_condicao_pagamento
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- 6. Criar índices para melhorar performance
CREATE INDEX idx_parcela_condicao_pagamento_condicao_id 
ON dbo.parcela_condicao_pagamento(condicao_pagamento_id);

CREATE INDEX idx_parcela_condicao_pagamento_forma_pagamento_id 
ON dbo.parcela_condicao_pagamento(forma_pagamento_id);

-- 7. Adicionar comentários para documentação
COMMENT ON TABLE dbo.condicao_pagamento IS 'Condições de pagamento para notas fiscais';
COMMENT ON TABLE dbo.parcela_condicao_pagamento IS 'Parcelas das condições de pagamento';

-- 8. Criar condições de pagamento padrão com parcelas
DO $$
DECLARE
  vista_id INTEGER;
  trinta_id INTEGER;
  forma_dinheiro_id UUID;
  forma_boleto_id UUID;
BEGIN
  -- Obter IDs das formas de pagamento
  SELECT id INTO forma_dinheiro_id FROM dbo.forma_pagamento WHERE descricao = 'Dinheiro' LIMIT 1;
  SELECT id INTO forma_boleto_id FROM dbo.forma_pagamento WHERE descricao = 'Boleto Bancário' LIMIT 1;
  
  -- Se não existirem formas de pagamento, usar valores padrão
  IF forma_dinheiro_id IS NULL THEN
    INSERT INTO dbo.forma_pagamento (descricao, codigo, tipo)
    VALUES ('Dinheiro', '01', 'À vista')
    RETURNING id INTO forma_dinheiro_id;
  END IF;
  
  IF forma_boleto_id IS NULL THEN
    INSERT INTO dbo.forma_pagamento (descricao, codigo, tipo)
    VALUES ('Boleto Bancário', '15', 'À prazo')
    RETURNING id INTO forma_boleto_id;
  END IF;
  
  -- Criar condição à vista
  INSERT INTO dbo.condicao_pagamento (nome, descricao)
  VALUES ('À Vista', 'Pagamento integral no ato')
  RETURNING id INTO vista_id;
  
  -- Adicionar parcela única para à vista
  INSERT INTO dbo.parcela_condicao_pagamento 
    (condicao_pagamento_id, numero_parcela, forma_pagamento_id, 
     dias_para_pagamento, percentual_valor)
  VALUES 
    (vista_id, 1, forma_dinheiro_id, 0, 100);
  
  -- Criar condição 30 dias
  INSERT INTO dbo.condicao_pagamento (nome, descricao)
  VALUES ('30 Dias', 'Pagamento em 30 dias')
  RETURNING id INTO trinta_id;
  
  -- Adicionar parcela única para 30 dias
  INSERT INTO dbo.parcela_condicao_pagamento 
    (condicao_pagamento_id, numero_parcela, forma_pagamento_id, 
     dias_para_pagamento, percentual_valor)
  VALUES 
    (trinta_id, 1, forma_boleto_id, 30, 100);
  
END $$;

COMMIT;