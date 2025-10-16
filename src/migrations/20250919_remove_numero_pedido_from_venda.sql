-- Migração para remover a coluna numero_pedido da tabela venda
-- Data: 2025-09-19
-- Descrição: Remove o campo numero_pedido do módulo de vendas conforme solicitado

-- Primeiro remove a constraint UNIQUE se existir
ALTER TABLE venda DROP CONSTRAINT IF EXISTS venda_numero_pedido_key;

-- Remove a coluna numero_pedido
ALTER TABLE venda DROP COLUMN IF EXISTS numero_pedido;

-- Atualiza o comentário da tabela
COMMENT ON TABLE venda IS 'Tabela de vendas - numero_pedido removido em 2025-09-19';