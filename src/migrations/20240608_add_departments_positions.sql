-- Migration para adicionar tabelas de departamentos e cargos
-- Data: 2024-06-08

BEGIN;

-- Criar tabelas de departamentos e cargos
CREATE TABLE IF NOT EXISTS dbo.departamento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS dbo.cargo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    departamento_id INTEGER REFERENCES dbo.departamento(id),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Inserir alguns departamentos padrão
INSERT INTO dbo.departamento (nome, descricao) VALUES 
('Comercial', 'Departamento responsável pelas vendas e relacionamento com clientes'),
('Administrativo', 'Departamento responsável pela gestão administrativa'),
('Financeiro', 'Departamento responsável pela gestão financeira'),
('Recursos Humanos', 'Departamento responsável pela gestão de pessoas'),
('Tecnologia da Informação', 'Departamento responsável pela infraestrutura tecnológica'),
('Operacional', 'Departamento responsável pelas operações do dia a dia');

-- Inserir alguns cargos padrão
INSERT INTO dbo.cargo (nome, descricao, departamento_id) VALUES 
('Vendedor', 'Responsável pela venda de produtos e serviços', 1),
('Gerente Comercial', 'Responsável pela gestão da equipe de vendas', 1),
('Assistente Administrativo', 'Responsável por atividades administrativas', 2),
('Analista Financeiro', 'Responsável pela análise financeira', 3),
('Desenvolvedor', 'Responsável pelo desenvolvimento de sistemas', 5),
('Analista de Sistemas', 'Responsável pela análise de sistemas', 5);

-- Adicionar novas colunas à tabela funcionario
ALTER TABLE dbo.funcionario 
ADD COLUMN IF NOT EXISTS departamento_id INTEGER REFERENCES dbo.departamento(id),
ADD COLUMN IF NOT EXISTS cargo_id INTEGER REFERENCES dbo.cargo(id);

-- Migrar dados existentes (opcional - pode ser feito manualmente)
-- UPDATE dbo.funcionario SET departamento_id = 1 WHERE departamento = 'Comercial';
-- UPDATE dbo.funcionario SET cargo_id = 1 WHERE cargo = 'Vendedor';

-- Comentar as colunas antigas (não removê-las ainda para manter compatibilidade)
-- ALTER TABLE dbo.funcionario DROP COLUMN IF EXISTS departamento;
-- ALTER TABLE dbo.funcionario DROP COLUMN IF EXISTS cargo;

COMMIT;
