-- Migration para adicionar campos RG e cidade_id à tabela funcionario
-- Data: 2025-06-28

BEGIN;

-- Adicionar campo RG à tabela funcionario
ALTER TABLE dbo.funcionario 
ADD COLUMN IF NOT EXISTS rg VARCHAR(20);

-- Adicionar campo cidade_id à tabela funcionario
ALTER TABLE dbo.funcionario 
ADD COLUMN IF NOT EXISTS cidade_id INTEGER REFERENCES dbo.cidade(id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_funcionario_rg ON dbo.funcionario(rg);
CREATE INDEX IF NOT EXISTS idx_funcionario_cidade_id ON dbo.funcionario(cidade_id);

-- Comentários nos novos campos
COMMENT ON COLUMN dbo.funcionario.rg IS 'RG do funcionário';
COMMENT ON COLUMN dbo.funcionario.cidade_id IS 'ID da cidade do funcionário';

COMMIT;
