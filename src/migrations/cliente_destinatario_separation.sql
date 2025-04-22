-- Script para criar tabelas e relacionamentos para separar Clientes de Destinatários

-- Verificar e criar schema dbo se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'dbo') THEN
        EXECUTE 'CREATE SCHEMA dbo';
    END IF;
END
$$;

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS dbo.cliente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cnpj_cpf VARCHAR(20) NOT NULL UNIQUE,
    tipo CHAR(1) NOT NULL CHECK (tipo IN ('F', 'J')),
    is_estrangeiro BOOLEAN DEFAULT FALSE,
    tipo_documento VARCHAR(50),
    razao_social VARCHAR(100) NOT NULL,
    nome_fantasia VARCHAR(60),
    inscricao_estadual VARCHAR(50),
    inscricao_municipal VARCHAR(20),
    endereco VARCHAR(100),
    numero VARCHAR(10),
    complemento VARCHAR(60),
    bairro VARCHAR(50),
    cidade_id UUID REFERENCES dbo.cidade(id),
    cep VARCHAR(15),
    telefone VARCHAR(20),
    email VARCHAR(100),
    is_destinatario BOOLEAN DEFAULT TRUE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar coluna cliente_id na tabela destinatario se ela existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'dbo' AND table_name = 'destinatario') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'dbo' AND table_name = 'destinatario' AND column_name = 'cliente_id') THEN
            ALTER TABLE dbo.destinatario 
            ADD COLUMN cliente_id UUID REFERENCES dbo.cliente(id);
            
            ALTER TABLE dbo.destinatario 
            ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
            
            ALTER TABLE dbo.destinatario
            ADD COLUMN is_estrangeiro BOOLEAN DEFAULT FALSE;
            
            ALTER TABLE dbo.destinatario
            ADD COLUMN tipo_documento VARCHAR(50);
        END IF;
    ELSE
        -- Criar tabela de Destinatários
        CREATE TABLE dbo.destinatario (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            cliente_id UUID REFERENCES dbo.cliente(id),
            cnpj_cpf VARCHAR(20) NOT NULL UNIQUE,
            tipo CHAR(1) NOT NULL CHECK (tipo IN ('F', 'J')),
            is_estrangeiro BOOLEAN DEFAULT FALSE,
            tipo_documento VARCHAR(50),
            razao_social VARCHAR(100) NOT NULL,
            nome_fantasia VARCHAR(60),
            inscricao_estadual VARCHAR(50),
            inscricao_municipal VARCHAR(20),
            endereco VARCHAR(100),
            numero VARCHAR(10),
            complemento VARCHAR(60),
            bairro VARCHAR(50),
            cidade_id UUID REFERENCES dbo.cidade(id),
            cep VARCHAR(15),
            telefone VARCHAR(20),
            email VARCHAR(100),
            ativo BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END
$$;

-- Criar tabela de relacionamento entre Cliente e Destinatário
CREATE TABLE IF NOT EXISTS dbo.cliente_destinatario (
    cliente_id UUID NOT NULL REFERENCES dbo.cliente(id),
    destinatario_id UUID NOT NULL REFERENCES dbo.destinatario(id),
    PRIMARY KEY (cliente_id, destinatario_id)
);

-- Atualizar campo cliente_id nos destinatários existentes
DO $$
DECLARE
    temp_record RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'dbo' AND table_name = 'destinatario') THEN
        -- Verificar se há destinatários sem cliente associado
        FOR temp_record IN SELECT cnpj_cpf FROM dbo.destinatario WHERE cliente_id IS NULL LOOP
            -- Criar cliente para cada destinatário
            INSERT INTO dbo.cliente (
                cnpj_cpf, tipo, razao_social, nome_fantasia, inscricao_estadual, 
                inscricao_municipal, endereco, numero, complemento, bairro, 
                cidade_id, cep, telefone, email, is_destinatario, ativo
            )
            SELECT 
                d.cnpj_cpf, d.tipo, d.razao_social, d.nome_fantasia, d.inscricao_estadual,
                d.inscricao_municipal, d.endereco, d.numero, d.complemento, d.bairro,
                d.cidade_id, d.cep, d.telefone, d.email, TRUE, d.ativo
            FROM dbo.destinatario d
            WHERE d.cnpj_cpf = temp_record.cnpj_cpf
            ON CONFLICT (cnpj_cpf) DO NOTHING;
            
            -- Atualizar cliente_id no destinatário
            UPDATE dbo.destinatario d
            SET cliente_id = c.id
            FROM dbo.cliente c
            WHERE d.cnpj_cpf = c.cnpj_cpf AND d.cnpj_cpf = temp_record.cnpj_cpf;
        END LOOP;
    END IF;
END
$$;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_cliente_cnpj_cpf ON dbo.cliente(cnpj_cpf);
CREATE INDEX IF NOT EXISTS idx_destinatario_cnpj_cpf ON dbo.destinatario(cnpj_cpf);
CREATE INDEX IF NOT EXISTS idx_destinatario_cliente_id ON dbo.destinatario(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_destinatario_cliente_id ON dbo.cliente_destinatario(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cliente_destinatario_destinatario_id ON dbo.cliente_destinatario(destinatario_id);

-- Atualizar NFEs para usar cliente_id em vez de cnpj_destinatario
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'dbo' AND table_name = 'nfe') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'dbo' AND table_name = 'nfe' AND column_name = 'cliente_id') THEN
            ALTER TABLE dbo.nfe ADD COLUMN cliente_id UUID REFERENCES dbo.cliente(id);
            
            -- Atualizar cliente_id com base no cnpj_destinatario
            UPDATE dbo.nfe n
            SET cliente_id = c.id
            FROM dbo.cliente c
            WHERE n.cnpj_destinatario = c.cnpj_cpf;
        END IF;
    END IF;
END
$$;

-- Criar trigger para atualizar campo updated_at
CREATE OR REPLACE FUNCTION dbo.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela cliente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cliente_timestamp') THEN
        CREATE TRIGGER update_cliente_timestamp
        BEFORE UPDATE ON dbo.cliente
        FOR EACH ROW
        EXECUTE FUNCTION dbo.update_timestamp();
    END IF;
END
$$;

-- Aplicar trigger na tabela destinatario
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_destinatario_timestamp') THEN
        CREATE TRIGGER update_destinatario_timestamp
        BEFORE UPDATE ON dbo.destinatario
        FOR EACH ROW
        EXECUTE FUNCTION dbo.update_timestamp();
    END IF;
END
$$; 