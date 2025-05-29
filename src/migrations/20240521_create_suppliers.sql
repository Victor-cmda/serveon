
CREATE TABLE dbo.fornecedor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cnpj_cpf VARCHAR(20) NOT NULL UNIQUE,
    tipo CHAR(1) NOT NULL CHECK (tipo IN ('F', 'J')),
    is_estrangeiro BOOLEAN NOT NULL DEFAULT FALSE,
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
    website VARCHAR(100),
    observacoes TEXT,
    responsavel VARCHAR(100),
    celular_responsavel VARCHAR(20),
    condicao_pagamento_id UUID REFERENCES dbo.condicao_pagamento(id),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fornecedor_cnpj_cpf ON dbo.fornecedor(cnpj_cpf);
CREATE INDEX idx_fornecedor_razao_social ON dbo.fornecedor(razao_social);
CREATE INDEX idx_fornecedor_cidade_id ON dbo.fornecedor(cidade_id);
CREATE INDEX idx_fornecedor_condicao_pagamento_id ON dbo.fornecedor(condicao_pagamento_id);

CREATE TRIGGER update_fornecedor_timestamp BEFORE
UPDATE ON dbo.fornecedor FOR EACH ROW EXECUTE PROCEDURE dbo.update_timestamp();


COMMENT ON TABLE dbo.fornecedor IS 'Cadastro de fornecedores';
COMMENT ON COLUMN dbo.fornecedor.id IS 'ID único do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.cnpj_cpf IS 'CNPJ ou CPF do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.tipo IS 'Tipo de fornecedor: F=Física, J=Jurídica';
COMMENT ON COLUMN dbo.fornecedor.is_estrangeiro IS 'Indica se é um fornecedor estrangeiro';
COMMENT ON COLUMN dbo.fornecedor.tipo_documento IS 'Tipo de documento para fornecedores estrangeiros';
COMMENT ON COLUMN dbo.fornecedor.razao_social IS 'Razão social ou nome completo do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.nome_fantasia IS 'Nome fantasia do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.inscricao_estadual IS 'Inscrição estadual do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.inscricao_municipal IS 'Inscrição municipal do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.endereco IS 'Endereço do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.numero IS 'Número do endereço do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.complemento IS 'Complemento do endereço do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.bairro IS 'Bairro do endereço do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.cidade_id IS 'ID da cidade do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.cep IS 'CEP do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.telefone IS 'Telefone do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.email IS 'Email do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.website IS 'Site do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.observacoes IS 'Observações sobre o fornecedor';
COMMENT ON COLUMN dbo.fornecedor.responsavel IS 'Nome do responsável pelo fornecedor';
COMMENT ON COLUMN dbo.fornecedor.celular_responsavel IS 'Celular do responsável do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.condicao_pagamento_id IS 'ID da condição de pagamento padrão do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.ativo IS 'Indica se o fornecedor está ativo';
COMMENT ON COLUMN dbo.fornecedor.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN dbo.fornecedor.updated_at IS 'Data e hora da última atualização do registro';