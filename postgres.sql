-- Script de criação do banco de dados para sistema de Nota Fiscal Eletrônica
-- SGBD: PostgreSQL

-- Criação do banco de dados
CREATE DATABASE nfe_db
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'pt_BR.UTF-8'
    LC_CTYPE = 'pt_BR.UTF-8'
    TEMPLATE = template0;

\c nfe_db;

-- Criar schema
CREATE SCHEMA IF NOT EXISTS nfe;
SET search_path TO nfe;

-- Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabelas de Localização

-- Tabela PAÍS
CREATE TABLE pais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    codigo VARCHAR(3) NOT NULL,
    sigla VARCHAR(2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_pais_codigo UNIQUE (codigo),
    CONSTRAINT uk_pais_sigla UNIQUE (sigla)
);

-- Tabela ESTADO
CREATE TABLE estado (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(60) NOT NULL,
    uf CHAR(2) NOT NULL,
    pais_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_estado_pais FOREIGN KEY (pais_id) REFERENCES pais (id),
    CONSTRAINT uk_estado_uf_pais UNIQUE (uf, pais_id)
);

-- Tabela CIDADE
CREATE TABLE cidade (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    codigo_ibge VARCHAR(7),
    estado_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cidade_estado FOREIGN KEY (estado_id) REFERENCES estado (id),
    CONSTRAINT uk_cidade_codigo_ibge UNIQUE (codigo_ibge)
);

-- Tabelas de Pagamento

-- Tabela CONDIÇÃO DE PAGAMENTO
CREATE TABLE condicao_pagamento (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    dias INTEGER,
    parcelas INTEGER,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela FORMA DE PAGAMENTO
CREATE TABLE forma_pagamento (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    tipo VARCHAR(30),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabelas Principais

-- Tabela EMITENTE
CREATE TABLE emitente (
    cnpj VARCHAR(18) PRIMARY KEY,
    razao_social VARCHAR(100) NOT NULL,
    nome_fantasia VARCHAR(60),
    inscricao_estadual VARCHAR(20),
    inscricao_estadual_st VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    endereco VARCHAR(100),
    numero VARCHAR(10),
    complemento VARCHAR(60),
    bairro VARCHAR(50),
    cidade_id INTEGER NOT NULL,
    cep VARCHAR(10),
    telefone VARCHAR(20),
    email VARCHAR(100),
    regime_tributario VARCHAR(30),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_emitente_cidade FOREIGN KEY (cidade_id) REFERENCES cidade (id)
);

-- Tabela DESTINATÁRIO
CREATE TABLE destinatario (
    cnpj_cpf VARCHAR(18) PRIMARY KEY,
    tipo CHAR(1) NOT NULL, -- F = Física, J = Jurídica
    razao_social VARCHAR(100) NOT NULL,
    nome_fantasia VARCHAR(60),
    inscricao_estadual VARCHAR(20),
    inscricao_municipal VARCHAR(20),
    endereco VARCHAR(100),
    numero VARCHAR(10),
    complemento VARCHAR(60),
    bairro VARCHAR(50),
    cidade_id INTEGER NOT NULL,
    cep VARCHAR(10),
    telefone VARCHAR(20),
    email VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_destinatario_cidade FOREIGN KEY (cidade_id) REFERENCES cidade (id),
    CONSTRAINT ck_destinatario_tipo CHECK (tipo IN ('F', 'J'))
);

-- Tabela TRANSPORTADOR
CREATE TABLE transportador (
    cnpj_cpf VARCHAR(18) PRIMARY KEY,
    tipo CHAR(1) NOT NULL, -- F = Física, J = Jurídica
    razao_social VARCHAR(100),
    nome_fantasia VARCHAR(60),
    inscricao_estadual VARCHAR(20),
    endereco VARCHAR(100),
    numero VARCHAR(10),
    complemento VARCHAR(60),
    bairro VARCHAR(50),
    cidade_id INTEGER,
    cep VARCHAR(10),
    codigo_antt VARCHAR(20),
    placa_veiculo VARCHAR(10),
    uf_veiculo CHAR(2),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_transportador_cidade FOREIGN KEY (cidade_id) REFERENCES cidade (id),
    CONSTRAINT ck_transportador_tipo CHECK (tipo IN ('F', 'J'))
);

-- Tabela PRODUTO
CREATE TABLE produto (
    codigo VARCHAR(30) PRIMARY KEY,
    descricao VARCHAR(150) NOT NULL,
    ncm VARCHAR(10),
    cest VARCHAR(10),
    unidade VARCHAR(6),
    valor_unitario DECIMAL(15,4),
    peso_liquido DECIMAL(15,3),
    peso_bruto DECIMAL(15,3),
    gtin VARCHAR(14), -- Código de barras
    gtin_tributavel VARCHAR(14),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela NFE
CREATE TABLE nfe (
    chave_acesso VARCHAR(44) PRIMARY KEY,
    numero VARCHAR(10) NOT NULL,
    serie VARCHAR(3) NOT NULL,
    data_emissao DATE NOT NULL,
    data_saida DATE,
    hora_saida TIME,
    natureza_operacao VARCHAR(100),
    finalidade CHAR(1) NOT NULL DEFAULT '1', -- 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
    tipo_operacao CHAR(1) NOT NULL DEFAULT '1', -- 0=Entrada, 1=Saída
    valor_produtos DECIMAL(15,2) NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,
    base_calculo_icms DECIMAL(15,2),
    valor_icms DECIMAL(15,2),
    base_calculo_icms_st DECIMAL(15,2),
    valor_icms_st DECIMAL(15,2),
    valor_frete DECIMAL(15,2),
    valor_seguro DECIMAL(15,2),
    valor_desconto DECIMAL(15,2),
    outras_despesas DECIMAL(15,2),
    valor_ipi DECIMAL(15,2),
    valor_pis DECIMAL(15,2),
    valor_cofins DECIMAL(15,2),
    protocolo_acesso VARCHAR(20),
    data_hora_autorizacao TIMESTAMP,
    situacao CHAR(1) NOT NULL DEFAULT 'P', -- P=Pendente, A=Autorizada, C=Cancelada, D=Denegada, I=Inutilizada
    frete_por_conta CHAR(1), -- 0=Emitente, 1=Destinatário, 2=Terceiros, 9=Sem Frete
    informacoes_complementares TEXT,
    cnpj_emitente VARCHAR(18) NOT NULL,
    cnpj_destinatario VARCHAR(18) NOT NULL,
    cnpj_transportador VARCHAR(18),
    condicao_pagamento_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nfe_emitente FOREIGN KEY (cnpj_emitente) REFERENCES emitente (cnpj),
    CONSTRAINT fk_nfe_destinatario FOREIGN KEY (cnpj_destinatario) REFERENCES destinatario (cnpj_cpf),
    CONSTRAINT fk_nfe_transportador FOREIGN KEY (cnpj_transportador) REFERENCES transportador (cnpj_cpf),
    CONSTRAINT fk_nfe_condicao_pagamento FOREIGN KEY (condicao_pagamento_id) REFERENCES condicao_pagamento (id),
    CONSTRAINT uk_nfe_numero_serie_emissor UNIQUE (numero, serie, cnpj_emitente)
);

-- Tabela ITEM_NFE
CREATE TABLE item_nfe (
    id SERIAL PRIMARY KEY,
    chave_acesso_nfe VARCHAR(44) NOT NULL,
    codigo_produto VARCHAR(30) NOT NULL,
    cfop VARCHAR(5),
    quantidade DECIMAL(15,3) NOT NULL,
    valor_unitario DECIMAL(15,4) NOT NULL,
    valor_total DECIMAL(15,2) NOT NULL,
    base_calculo_icms DECIMAL(15,2),
    valor_icms DECIMAL(15,2),
    aliquota_icms DECIMAL(5,2),
    valor_ipi DECIMAL(15,2),
    aliquota_ipi DECIMAL(5,2),
    valor_pis DECIMAL(15,2),
    aliquota_pis DECIMAL(5,2),
    valor_cofins DECIMAL(15,2),
    aliquota_cofins DECIMAL(5,2),
    csosn VARCHAR(4),
    cst_icms VARCHAR(3),
    cst_ipi VARCHAR(2),
    cst_pis VARCHAR(2),
    cst_cofins VARCHAR(2),
    valor_desconto DECIMAL(15,2),
    ordem INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_nfe_nfe FOREIGN KEY (chave_acesso_nfe) REFERENCES nfe (chave_acesso),
    CONSTRAINT fk_item_nfe_produto FOREIGN KEY (codigo_produto) REFERENCES produto (codigo)
);

-- Tabela FATURA
CREATE TABLE fatura (
    id SERIAL PRIMARY KEY,
    chave_acesso_nfe VARCHAR(44) NOT NULL,
    numero VARCHAR(20),
    valor_total DECIMAL(15,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fatura_nfe FOREIGN KEY (chave_acesso_nfe) REFERENCES nfe (chave_acesso)
);

-- Tabela PARCELA
CREATE TABLE parcela (
    id SERIAL PRIMARY KEY,
    fatura_id INTEGER NOT NULL,
    forma_pagamento_id INTEGER NOT NULL,
    numero INTEGER NOT NULL,
    data_vencimento DATE NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    status CHAR(1) NOT NULL DEFAULT 'A', -- A=Aberto, P=Pago, C=Cancelado
    data_pagamento DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parcela_fatura FOREIGN KEY (fatura_id) REFERENCES fatura (id),
    CONSTRAINT fk_parcela_forma_pagamento FOREIGN KEY (forma_pagamento_id) REFERENCES forma_pagamento (id)
);

-- Tabela VOLUME
CREATE TABLE volume (
    id SERIAL PRIMARY KEY,
    chave_acesso_nfe VARCHAR(44) NOT NULL,
    quantidade DECIMAL(15,3),
    especie VARCHAR(30),
    marca VARCHAR(30),
    numeracao VARCHAR(30),
    peso_bruto DECIMAL(15,3),
    peso_liquido DECIMAL(15,3),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_volume_nfe FOREIGN KEY (chave_acesso_nfe) REFERENCES nfe (chave_acesso)
);

-- Criar índices para melhorar performance

-- Índices para chaves estrangeiras
CREATE INDEX idx_estado_pais_id ON estado(pais_id);
CREATE INDEX idx_cidade_estado_id ON cidade(estado_id);
CREATE INDEX idx_emitente_cidade_id ON emitente(cidade_id);
CREATE INDEX idx_destinatario_cidade_id ON destinatario(cidade_id);
CREATE INDEX idx_transportador_cidade_id ON transportador(cidade_id);

-- Índices para NFE
CREATE INDEX idx_nfe_cnpj_emitente ON nfe(cnpj_emitente);
CREATE INDEX idx_nfe_cnpj_destinatario ON nfe(cnpj_destinatario);
CREATE INDEX idx_nfe_data_emissao ON nfe(data_emissao);
CREATE INDEX idx_nfe_numero ON nfe(numero);
CREATE INDEX idx_nfe_situacao ON nfe(situacao);

-- Índices para ITEM_NFE
CREATE INDEX idx_item_nfe_chave_acesso ON item_nfe(chave_acesso_nfe);
CREATE INDEX idx_item_nfe_codigo_produto ON item_nfe(codigo_produto);

-- Índices para FATURA
CREATE INDEX idx_fatura_chave_acesso ON fatura(chave_acesso_nfe);

-- Índices para PARCELA
CREATE INDEX idx_parcela_fatura_id ON parcela(fatura_id);
CREATE INDEX idx_parcela_forma_pagamento_id ON parcela(forma_pagamento_id);
CREATE INDEX idx_parcela_data_vencimento ON parcela(data_vencimento);
CREATE INDEX idx_parcela_status ON parcela(status);

-- Índices para VOLUME
CREATE INDEX idx_volume_chave_acesso ON volume(chave_acesso_nfe);

-- Triggers para atualizar o campo updated_at automaticamente

-- Função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar o trigger em todas as tabelas
CREATE TRIGGER update_pais_timestamp BEFORE UPDATE ON pais
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_estado_timestamp BEFORE UPDATE ON estado
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_cidade_timestamp BEFORE UPDATE ON cidade
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_condicao_pagamento_timestamp BEFORE UPDATE ON condicao_pagamento
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_forma_pagamento_timestamp BEFORE UPDATE ON forma_pagamento
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_emitente_timestamp BEFORE UPDATE ON emitente
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_destinatario_timestamp BEFORE UPDATE ON destinatario
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_transportador_timestamp BEFORE UPDATE ON transportador
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_produto_timestamp BEFORE UPDATE ON produto
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_nfe_timestamp BEFORE UPDATE ON nfe
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_item_nfe_timestamp BEFORE UPDATE ON item_nfe
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_fatura_timestamp BEFORE UPDATE ON fatura
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_parcela_timestamp BEFORE UPDATE ON parcela
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_volume_timestamp BEFORE UPDATE ON volume
    FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Inserir dados iniciais

-- Inserir país padrão (Brasil)
INSERT INTO pais (nome, codigo, sigla) VALUES ('Brasil', '55', 'BR');

-- Inserir formas de pagamento comuns
INSERT INTO forma_pagamento (descricao, codigo, tipo) VALUES 
('Dinheiro', '01', 'À vista'),
('Cartão de Crédito', '03', 'Crédito'),
('Cartão de Débito', '04', 'Débito'),
('PIX', '17', 'À vista'),
('Boleto Bancário', '15', 'À prazo');

-- Inserir condições de pagamento comuns
INSERT INTO condicao_pagamento (descricao, dias, parcelas) VALUES 
('À Vista', 0, 1),
('30 Dias', 30, 1),
('30/60', 30, 2),
('30/60/90', 30, 3),
('Entrada + 30 Dias', 30, 2);

-- Comentários
COMMENT ON DATABASE nfe_db IS 'Banco de dados para sistema de Nota Fiscal Eletrônica';
COMMENT ON SCHEMA nfe IS 'Schema principal para o sistema de NF-e';
COMMENT ON TABLE nfe.pais IS 'Cadastro de países';
COMMENT ON TABLE nfe.estado IS 'Cadastro de estados/províncias';
COMMENT ON TABLE nfe.cidade IS 'Cadastro de cidades/municípios';
COMMENT ON TABLE nfe.condicao_pagamento IS 'Condições de pagamento para notas fiscais';
COMMENT ON TABLE nfe.forma_pagamento IS 'Formas de pagamento das parcelas de notas fiscais';
COMMENT ON TABLE nfe.emitente IS 'Cadastro de empresas emitentes de notas fiscais';
COMMENT ON TABLE nfe.destinatario IS 'Cadastro de destinatários de notas fiscais';
COMMENT ON TABLE nfe.transportador IS 'Cadastro de transportadores de mercadorias';
COMMENT ON TABLE nfe.produto IS 'Cadastro de produtos';
COMMENT ON TABLE nfe.nfe IS 'Notas fiscais eletrônicas';
COMMENT ON TABLE nfe.item_nfe IS 'Itens de notas fiscais';
COMMENT ON TABLE nfe.fatura IS 'Faturas de pagamento de notas fiscais';
COMMENT ON TABLE nfe.parcela IS 'Parcelas de pagamento das faturas';
COMMENT ON TABLE nfe.volume IS 'Volumes de transporte das notas fiscais';