-- Inicia uma transação
BEGIN;
-- Criar schema
CREATE SCHEMA IF NOT EXISTS dbo;
SET search_path TO dbo;

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
-- Tabela estado
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

-- Tabela cidade
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
-- Tabela FORMA DE PAGAMENTO (movida para antes da condição de pagamento)
CREATE TABLE forma_pagamento (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    tipo VARCHAR(30),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela CONDIÇÃO DE PAGAMENTO
CREATE TABLE condicao_pagamento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- Tabela de parcelas das condições de pagamento
CREATE TABLE parcela_condicao_pagamento (
    id SERIAL PRIMARY KEY,
    condicao_pagamento_id INTEGER NOT NULL REFERENCES condicao_pagamento(id),
    numero_parcela INTEGER NOT NULL,
    forma_pagamento_id INTEGER NOT NULL REFERENCES forma_pagamento(id),
    dias_para_pagamento INTEGER NOT NULL,
    percentual_valor DECIMAL(5,2) NOT NULL,
    taxa_juros DECIMAL(5,2) NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uk_numero_parcela_por_condicao UNIQUE (condicao_pagamento_id, numero_parcela)
);

-- Tabelas Principais
-- Tabela emitente
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

-- Tabela cliente
CREATE TABLE cliente (
    id SERIAL PRIMARY KEY,
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
    cidade_id INTEGER REFERENCES cidade(id),
    cep VARCHAR(15),
    telefone VARCHAR(20),
    email VARCHAR(100),
    is_destinatario BOOLEAN NOT NULL DEFAULT TRUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela fornecedor
CREATE TABLE fornecedor (
    id SERIAL PRIMARY KEY,
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
    cidade_id INTEGER REFERENCES cidade(id),
    cep VARCHAR(15),
    telefone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(100),
    observacoes TEXT,
    responsavel VARCHAR(100),
    celular_responsavel VARCHAR(20),
    condicao_pagamento_id INTEGER REFERENCES condicao_pagamento(id),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela DESTINATÁRIO
CREATE TABLE destinatario (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES cliente(id),
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
    cidade_id INTEGER REFERENCES cidade(id),
    cep VARCHAR(15),
    telefone VARCHAR(20),
    email VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de relacionamento entre cliente e Destinatário
CREATE TABLE cliente_destinatario (
    cliente_id INTEGER NOT NULL REFERENCES cliente(id),
    destinatario_id INTEGER NOT NULL REFERENCES destinatario(id),
    PRIMARY KEY (cliente_id, destinatario_id)
);

-- Tabela transportador
CREATE TABLE transportador (
    cnpj_cpf VARCHAR(18) PRIMARY KEY,
    tipo CHAR(1) NOT NULL,
    -- F = Física, J = Jurídica
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
-- Tabela produto
CREATE TABLE produto (
    codigo VARCHAR(30) PRIMARY KEY,
    descricao VARCHAR(150) NOT NULL,
    ncm VARCHAR(10),
    cest VARCHAR(10),
    unidade VARCHAR(6),
    valor_unitario DECIMAL(15, 4),
    peso_liquido DECIMAL(15, 3),
    peso_bruto DECIMAL(15, 3),
    gtin VARCHAR(14),
    -- Código de barras
    gtin_tributavel VARCHAR(14),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Tabela nfe
CREATE TABLE nfe (
    chave_acesso VARCHAR(44) PRIMARY KEY,
    numero VARCHAR(10) NOT NULL,
    serie VARCHAR(3) NOT NULL,
    data_emissao DATE NOT NULL,
    data_saida DATE,
    hora_saida TIME,
    natureza_operacao VARCHAR(100),
    finalidade CHAR(1) NOT NULL DEFAULT '1',
    -- 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
    tipo_operacao CHAR(1) NOT NULL DEFAULT '1',
    -- 0=Entrada, 1=Saída
    valor_produtos DECIMAL(15, 2) NOT NULL,
    valor_total DECIMAL(15, 2) NOT NULL,
    base_calculo_icms DECIMAL(15, 2),
    valor_icms DECIMAL(15, 2),
    base_calculo_icms_st DECIMAL(15, 2),
    valor_icms_st DECIMAL(15, 2),
    valor_frete DECIMAL(15, 2),
    valor_seguro DECIMAL(15, 2),
    valor_desconto DECIMAL(15, 2),
    outras_despesas DECIMAL(15, 2),
    valor_ipi DECIMAL(15, 2),
    valor_pis DECIMAL(15, 2),
    valor_cofins DECIMAL(15, 2),
    protocolo_acesso VARCHAR(20),
    data_hora_autorizacao TIMESTAMP,
    situacao CHAR(1) NOT NULL DEFAULT 'P',
    -- P=Pendente, A=Autorizada, C=Cancelada, D=Denegada, I=Inutilizada
    frete_por_conta CHAR(1),
    -- 0=emitente, 1=Destinatário, 2=Terceiros, 9=Sem Frete
    informacoes_complementares TEXT,
    cnpj_emitente VARCHAR(18) NOT NULL,
    cnpj_destinatario VARCHAR(18) NOT NULL,
    cnpj_transportador VARCHAR(18),
    condicao_pagamento_id INTEGER NOT NULL,
    cliente_id INTEGER REFERENCES cliente(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_nfe_emitente FOREIGN KEY (cnpj_emitente) REFERENCES emitente (cnpj),
    CONSTRAINT fk_nfe_destinatario FOREIGN KEY (cnpj_destinatario) REFERENCES destinatario (cnpj_cpf),
    CONSTRAINT fk_nfe_transportador FOREIGN KEY (cnpj_transportador) REFERENCES transportador (cnpj_cpf),
    CONSTRAINT fk_nfe_condicao_pagamento FOREIGN KEY (condicao_pagamento_id) REFERENCES condicao_pagamento (id),
    CONSTRAINT uk_nfe_numero_serie_emissor UNIQUE (numero, serie, cnpj_emitente)
);
-- Tabela ITEM_nfe
CREATE TABLE itemnfe (
    id SERIAL PRIMARY KEY,
    chave_acesso_nfe VARCHAR(44) NOT NULL,
    codigo_produto VARCHAR(30) NOT NULL,
    cfop VARCHAR(5),
    quantidade DECIMAL(15, 3) NOT NULL,
    valor_unitario DECIMAL(15, 4) NOT NULL,
    valor_total DECIMAL(15, 2) NOT NULL,
    base_calculo_icms DECIMAL(15, 2),
    valor_icms DECIMAL(15, 2),
    aliquota_icms DECIMAL(5, 2),
    valor_ipi DECIMAL(15, 2),
    aliquota_ipi DECIMAL(5, 2),
    valor_pis DECIMAL(15, 2),
    aliquota_pis DECIMAL(5, 2),
    valor_cofins DECIMAL(15, 2),
    aliquota_cofins DECIMAL(5, 2),
    csosn VARCHAR(4),
    cst_icms VARCHAR(3),
    cst_ipi VARCHAR(2),
    cst_pis VARCHAR(2),
    cst_cofins VARCHAR(2),
    valor_desconto DECIMAL(15, 2),
    ordem INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_nfe_nfe FOREIGN KEY (chave_acesso_nfe) REFERENCES nfe (chave_acesso),
    CONSTRAINT fk_item_nfe_produto FOREIGN KEY (codigo_produto) REFERENCES produto (codigo)
);
-- Tabela fatura
CREATE TABLE fatura (
    id SERIAL PRIMARY KEY,
    chave_acesso_nfe VARCHAR(44) NOT NULL,
    numero VARCHAR(20),
    valor_total DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fatura_nfe FOREIGN KEY (chave_acesso_nfe) REFERENCES nfe (chave_acesso)
);
-- Tabela parcela
CREATE TABLE parcela (
    id SERIAL PRIMARY KEY,
    fatura_id INTEGER NOT NULL,
    forma_pagamento_id INTEGER NOT NULL,
    numero INTEGER NOT NULL,
    data_vencimento DATE NOT NULL,
    valor DECIMAL(15, 2) NOT NULL,
    status CHAR(1) NOT NULL DEFAULT 'A',
    -- A=Aberto, P=Pago, C=Cancelado
    data_pagamento DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parcela_fatura FOREIGN KEY (fatura_id) REFERENCES fatura (id),
    CONSTRAINT fk_parcela_forma_pagamento FOREIGN KEY (forma_pagamento_id) REFERENCES forma_pagamento (id)
);
-- Tabela volume
CREATE TABLE volume (
    id SERIAL PRIMARY KEY,
    chave_acesso_nfe VARCHAR(44) NOT NULL,
    quantidade DECIMAL(15, 3),
    especie VARCHAR(30),
    marca VARCHAR(30),
    numeracao VARCHAR(30),
    peso_bruto DECIMAL(15, 3),
    peso_liquido DECIMAL(15, 3),
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
CREATE INDEX idx_destinatario_cliente_id ON destinatario(cliente_id);
CREATE INDEX idx_cliente_destinatario_cliente_id ON cliente_destinatario(cliente_id);
CREATE INDEX idx_cliente_destinatario_destinatario_id ON cliente_destinatario(destinatario_id);
CREATE INDEX idx_cliente_cnpj_cpf ON cliente(cnpj_cpf);
CREATE INDEX idx_fornecedor_cnpj_cpf ON fornecedor(cnpj_cpf);
CREATE INDEX idx_fornecedor_razao_social ON fornecedor(razao_social);
CREATE INDEX idx_fornecedor_cidade_id ON fornecedor(cidade_id);
CREATE INDEX idx_fornecedor_condicao_pagamento_id ON fornecedor(condicao_pagamento_id);
CREATE INDEX idx_transportador_cidade_id ON transportador(cidade_id);
-- Índices para nfe
CREATE INDEX idx_nfe_cnpj_emitente ON nfe(cnpj_emitente);
CREATE INDEX idx_nfe_cnpj_destinatario ON nfe(cnpj_destinatario);
CREATE INDEX idx_nfe_cliente_id ON nfe(cliente_id);
CREATE INDEX idx_nfe_data_emissao ON nfe(data_emissao);
CREATE INDEX idx_nfe_numero ON nfe(numero);
CREATE INDEX idx_nfe_situacao ON nfe(situacao);
-- Índices para ITEM_nfe
CREATE INDEX idx_item_nfe_chave_acesso ON itemnfe(chave_acesso_nfe);
CREATE INDEX idx_item_nfe_codigo_produto ON itemnfe(codigo_produto);
-- Índices para fatura
CREATE INDEX idx_fatura_chave_acesso ON fatura(chave_acesso_nfe);
-- Índices para parcela
CREATE INDEX idx_parcela_fatura_id ON parcela(fatura_id);
CREATE INDEX idx_parcela_forma_pagamento_id ON parcela(forma_pagamento_id);
CREATE INDEX idx_parcela_data_vencimento ON parcela(data_vencimento);
CREATE INDEX idx_parcela_status ON parcela(status);
-- Índices para volume
CREATE INDEX idx_volume_chave_acesso ON volume(chave_acesso_nfe);
-- Índices para CONDIÇÃO DE PAGAMENTO E parcelaS - ADICIONADOS
CREATE INDEX idx_parcela_condicao_pagamento_condicao_id ON parcela_condicao_pagamento(condicao_pagamento_id);
CREATE INDEX idx_parcela_condicao_pagamento_forma_id ON parcela_condicao_pagamento(forma_pagamento_id);
-- Triggers para atualizar o campo updated_at automaticamente
-- Função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Aplicar o trigger em todas as tabelas
CREATE TRIGGER update_pais_timestamp BEFORE
UPDATE ON pais FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_estado_timestamp BEFORE
UPDATE ON estado FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_cidade_timestamp BEFORE
UPDATE ON cidade FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_condicao_pagamento_timestamp BEFORE
UPDATE ON condicao_pagamento FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_forma_pagamento_timestamp BEFORE
UPDATE ON forma_pagamento FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_emitente_timestamp BEFORE
UPDATE ON emitente FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_cliente_timestamp BEFORE
UPDATE ON cliente FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_fornecedor_timestamp BEFORE
UPDATE ON fornecedor FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_destinatario_timestamp BEFORE
UPDATE ON destinatario FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_transportador_timestamp BEFORE
UPDATE ON transportador FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_produto_timestamp BEFORE
UPDATE ON produto FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_nfe_timestamp BEFORE
UPDATE ON nfe FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_item_nfe_timestamp BEFORE
UPDATE ON itemnfe FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_fatura_timestamp BEFORE
UPDATE ON fatura FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_parcela_timestamp BEFORE
UPDATE ON parcela FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_volume_timestamp BEFORE
UPDATE ON volume FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
-- Inserir dados iniciais
-- Inserir país padrão (Brasil)
INSERT INTO pais (nome, codigo, sigla)
VALUES ('BRASIL', '55', 'BR');
-- Inserir formas de pagamento comuns
INSERT INTO forma_pagamento (descricao, codigo, tipo)
VALUES ('DINHEIRO', '01', 'À VISTA'),
    ('CARTÃO DE CRÉDITO', '03', 'CRÉDITO'),
    ('CARTÃO DE DÉBITO', '04', 'DÉBITO'),
    ('PIX', '17', 'À VISTA'),
    ('BOLETO BANCÁRIO', '15', 'À PRAZO');
-- Inserir condições de pagamento comuns
INSERT INTO condicao_pagamento (nome, descricao, ativo)
VALUES ('À VISTA', 'PAGAMENTO À VISTA', true),
    ('30 DIAS', 'PAGAMENTO EM 30 DIAS', true),
    ('30/60', 'PAGAMENTO EM DUAS parcelaS DE 30 E 60 DIAS', true),
    ('30/60/90', 'PAGAMENTO EM TRÊS parcelaS DE 30, 60 e 90 DIAS', true),
    ('ENTRADA + 30 DIAS', 'PAGAMENTO COM ENTRADA E MAIS 30 DIAS', true);
-- Comentários
COMMENT ON SCHEMA dbo IS 'Schema principal para o sistema de NF-e';
COMMENT ON TABLE dbo.pais IS 'Cadastro de países';
COMMENT ON TABLE dbo.estado IS 'Cadastro de estados/províncias';
COMMENT ON TABLE dbo.cidade IS 'Cadastro de cidades/municípios';
COMMENT ON TABLE dbo.condicao_pagamento IS 'Condições de pagamento para notas fiscais';
COMMENT ON TABLE dbo.forma_pagamento IS 'Formas de pagamento das parcelas de notas fiscais';
COMMENT ON TABLE dbo.emitente IS 'Cadastro de empresas emitentes de notas fiscais';
COMMENT ON TABLE dbo.cliente IS 'Cadastro de clientes';
COMMENT ON TABLE dbo.fornecedor IS 'Cadastro de fornecedores';
COMMENT ON TABLE dbo.destinatario IS 'Cadastro de destinatários de notas fiscais';
COMMENT ON TABLE dbo.cliente_destinatario IS 'Relacionamento entre clientes e destinatários';
COMMENT ON TABLE dbo.transportador IS 'Cadastro de transportadores de mercadorias';
COMMENT ON TABLE dbo.produto IS 'Cadastro de produtos';
COMMENT ON TABLE dbo.nfe IS 'Notas fiscais eletrônicas';
COMMENT ON TABLE dbo.itemnfe IS 'Itens de notas fiscais';
COMMENT ON TABLE dbo.fatura IS 'faturas de pagamento de notas fiscais';
COMMENT ON TABLE dbo.parcela IS 'parcelas de pagamento das faturas';
COMMENT ON TABLE dbo.volume IS 'volumes de transporte das notas fiscais';
-- Confirmando a transação apenas se tudo executar corretamente
COMMIT;