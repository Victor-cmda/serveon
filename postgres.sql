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
    nacionalidade VARCHAR(100),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
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
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
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
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cidade_estado FOREIGN KEY (estado_id) REFERENCES estado (id),
    CONSTRAINT uk_cidade_codigo_ibge UNIQUE (codigo_ibge)
);

-- Tabelas de Pagamento
-- Tabela FORMA DE PAGAMENTO (movida para antes da condição de pagamento)
CREATE TABLE forma_pagamento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela CONDIÇÃO DE PAGAMENTO
CREATE TABLE condicao_pagamento (
    id SERIAL PRIMARY KEY,
    condicao_pagamento VARCHAR(255),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    numero_parcelas INTEGER DEFAULT 1,
    parcelas INTEGER NOT NULL DEFAULT 1,
    dias_primeira_parcela INTEGER DEFAULT 0,
    dias_entre_parcelas INTEGER DEFAULT 0,
    taxa_juros DECIMAL(5,2) NOT NULL DEFAULT 0,
    taxa_multa DECIMAL(5,2) NOT NULL DEFAULT 0,
    percentual_juros DECIMAL(10,2) DEFAULT 0.00,
    percentual_multa DECIMAL(10,2) DEFAULT 0.00,
    percentual_desconto DECIMAL(5,2) NOT NULL DEFAULT 0,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de parcelas das condições de pagamento
CREATE TABLE parcela_condicao_pagamento (
    id SERIAL PRIMARY KEY,
    condicao_pagamento_id INTEGER NOT NULL REFERENCES condicao_pagamento(id),
    numero_parcela INTEGER NOT NULL,
    forma_pagamento_id INTEGER NOT NULL REFERENCES forma_pagamento(id),
    dias_para_pagamento INTEGER NOT NULL,
    percentual_valor DECIMAL(5,2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
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
    cpf_cpnj VARCHAR(14) UNIQUE,
    tipo CHAR(1) NOT NULL CHECK (tipo IN ('F', 'J')),
    is_estrangeiro BOOLEAN NOT NULL DEFAULT FALSE,
    tipo_documento VARCHAR(50),
    razao_social VARCHAR(100) NOT NULL,
    nome_fantasia VARCHAR(60),
    inscricao_estadual VARCHAR(50),
    rg_inscricao_estadual VARCHAR(14),
    endereco VARCHAR(100),
    numero VARCHAR(10),
    complemento VARCHAR(60),
    bairro VARCHAR(50),
    cidade_id INTEGER REFERENCES cidade(id),
    cep VARCHAR(15),
    telefone VARCHAR(20),
    email VARCHAR(100),
    data_nascimento DATE,
    estado_civil VARCHAR(255),
    sexo VARCHAR(1) CHECK (sexo IN ('M', 'F')),
    nacionalidade_id INTEGER REFERENCES pais(id),
    limite_credito DECIMAL(10,2) DEFAULT 0.00,
    observacao VARCHAR(255),
    observacoes TEXT,
    is_destinatario BOOLEAN NOT NULL DEFAULT TRUE,
    condicao_pagamento_id INTEGER REFERENCES condicao_pagamento(id),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

-- Tabela transportadora
CREATE TABLE transportadora (
    id SERIAL PRIMARY KEY,
    razao_social VARCHAR(150) NOT NULL,
    nome_fantasia VARCHAR(100),
    cnpj VARCHAR(18),
    email VARCHAR(100),
    telefone VARCHAR(20),
    endereco VARCHAR(200),
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade_id INTEGER REFERENCES cidade(id),
    cep VARCHAR(10),
    tipo CHAR(1) DEFAULT 'J' CHECK (tipo IN ('F', 'J')),
    rg_ie VARCHAR(20),
    condicao_pagamento_id INTEGER REFERENCES condicao_pagamento(id),
    observacao VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela fornecedor
CREATE TABLE fornecedor (
    id SERIAL PRIMARY KEY,
    cnpj_cpf VARCHAR(20) NOT NULL UNIQUE,
    cpf_cnpj VARCHAR(14),
    tipo CHAR(1) NOT NULL CHECK (tipo IN ('F', 'J')),
    is_estrangeiro BOOLEAN NOT NULL DEFAULT FALSE,
    tipo_documento VARCHAR(50),
    razao_social VARCHAR(100) NOT NULL,
    nome_fantasia VARCHAR(60),
    inscricao_estadual VARCHAR(50),
    rg_inscricao_estadual VARCHAR(14),
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
    nacionalidade_id INTEGER REFERENCES pais(id),
    responsavel VARCHAR(100),
    celular_responsavel VARCHAR(20),
    limite_credito DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    condicao_pagamento_id INTEGER REFERENCES condicao_pagamento(id),
    transportadora_id INTEGER REFERENCES transportadora(id),
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
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES cliente(id),
    destinatario_id INTEGER NOT NULL REFERENCES destinatario(id),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_cliente_destinatario UNIQUE (cliente_id, destinatario_id)
);

-- Tabelas auxiliares do fornecedor
CREATE TABLE fornecedor_email (
    id SERIAL PRIMARY KEY,
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedor(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'COMERCIAL',
    principal BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fornecedor_telefone (
    id SERIAL PRIMARY KEY,
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedor(id) ON DELETE CASCADE,
    telefone VARCHAR(20) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'COMERCIAL',
    principal BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabelas auxiliares da transportadora
CREATE TABLE transportadora_emails (
    id_email SERIAL PRIMARY KEY,
    cod_trans INTEGER NOT NULL REFERENCES transportadora(id) ON DELETE CASCADE,
    email VARCHAR(50) NOT NULL
);

CREATE TABLE transportadora_telefones (
    id_telefone SERIAL PRIMARY KEY,
    cod_trans INTEGER NOT NULL REFERENCES transportadora(id) ON DELETE CASCADE,
    telefone VARCHAR(20) NOT NULL
);

-- Tabela veiculo
CREATE TABLE veiculo (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) NOT NULL,
    modelo VARCHAR(50),
    marca VARCHAR(50),
    ano INTEGER,
    capacidade DECIMAL(10,2),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transportadora_veiculo (
    transportadora_id INTEGER NOT NULL REFERENCES transportadora(id),
    veiculo_id INTEGER NOT NULL REFERENCES veiculo(id),
    PRIMARY KEY (transportadora_id, veiculo_id)
);

CREATE TABLE transp_item (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    descricao VARCHAR(100),
    transportadora_id INTEGER REFERENCES transportadora(id),
    codigo_transp VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabelas de RH
-- Tabela departamento
CREATE TABLE departamento (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela funcao_funcionario
CREATE TABLE funcao_funcionario (
    id SERIAL PRIMARY KEY,
    funcao_funcionario VARCHAR(255) NOT NULL,
    descricao VARCHAR(255),
    salario_base DECIMAL(10,2) DEFAULT 0.00,
    requer_cnh BOOLEAN DEFAULT FALSE,
    carga_horaria DECIMAL(10,2) NOT NULL,
    observacao VARCHAR(255),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela cargo
CREATE TABLE cargo (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    departamento_id INTEGER REFERENCES departamento(id),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabelas auxiliares para produtos
-- Tabela marca
CREATE TABLE marca (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela categoria
CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela unidade_medida
CREATE TABLE unidade_medida (
    id SERIAL PRIMARY KEY,
    unidade_medida VARCHAR(255) NOT NULL,
    nome VARCHAR(50) NOT NULL,
    sigla VARCHAR(6) NOT NULL UNIQUE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela produto
CREATE TABLE produto (
    id SERIAL PRIMARY KEY,
    produto VARCHAR(255) NOT NULL,
    unidade_medida_id INTEGER REFERENCES unidade_medida(id),
    codigo_barras VARCHAR(255),
    referencia VARCHAR(10),
    marca_id INTEGER REFERENCES marca(id),
    categoria_id INTEGER REFERENCES categoria(id),
    quantidade_minima INTEGER DEFAULT 0,
    valor_compra NUMERIC(10, 2),
    valor_venda NUMERIC(10, 2),
    quantidade INTEGER DEFAULT 0,
    percentual_lucro NUMERIC(10, 2),
    descricao VARCHAR(255),
    observacoes VARCHAR(255),
    situacao DATE,
    data_criacao DATE DEFAULT CURRENT_DATE,
    data_alteracao DATE DEFAULT CURRENT_DATE,
    usuario_criacao TEXT,
    usuario_atualizacao TEXT,
    -- Campos originais mantidos para compatibilidade com NFe
    codigo VARCHAR(30) UNIQUE,
    ncm VARCHAR(10),
    cest VARCHAR(10),
    unidade VARCHAR(6),
    valor_unitario DECIMAL(15, 4),
    peso_liquido DECIMAL(15, 3),
    peso_bruto DECIMAL(15, 3),
    gtin VARCHAR(14), -- Código de barras
    gtin_tributavel VARCHAR(14),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela produto_fornecedor
CREATE TABLE produto_fornecedor (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produto(id),
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedor(id),
    codigo_prod VARCHAR(50),
    custo DECIMAL(10,2),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela modalidade_nfe
CREATE TABLE modalidade_nfe (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    descricao VARCHAR(100) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela funcionario
CREATE TABLE funcionario (
    id SERIAL PRIMARY KEY,
    funcionario VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    apelido VARCHAR(60),
    cpf VARCHAR(11) NOT NULL UNIQUE,
    cpf_cpnj VARCHAR(14),
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    celular VARCHAR(20),
    rg VARCHAR(20),
    rg_inscricao_estadual VARCHAR(14),
    orgao_emissor VARCHAR(20),
    cnh VARCHAR(25),
    data_validade_cnh DATE,
    data_nascimento DATE,
    estado_civil VARCHAR(20),
    sexo INTEGER CHECK (sexo IN (1, 2)),
    nacionalidade VARCHAR(30),
    nacionalidade_id INTEGER NOT NULL REFERENCES pais(id),
    tipo INTEGER DEFAULT 1,

    -- Campos de endereço
    cep VARCHAR(10),
    endereco VARCHAR(200),
    numero VARCHAR(10),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade_id INTEGER REFERENCES cidade(id),

    -- Campos profissionais
    cargo_id INTEGER REFERENCES cargo(id),
    departamento_id INTEGER REFERENCES departamento(id),
    funcao_funcionario_id INTEGER NOT NULL REFERENCES funcao_funcionario(id),
    data_admissao DATE NOT NULL,
    data_demissao DATE,
    salario DECIMAL(10, 2),
    observacoes TEXT,
    observacao VARCHAR(255) NOT NULL,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela nfe
CREATE TABLE nfe (
    id SERIAL PRIMARY KEY,
    chave_acesso VARCHAR(44) UNIQUE,
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
    forma_pagamento_id INTEGER REFERENCES forma_pagamento(id),
    transportadora_id INTEGER REFERENCES transportadora(id),
    veiculo_id INTEGER REFERENCES veiculo(id),
    modalidade_id INTEGER REFERENCES modalidade_nfe(id),
    cancelada BOOLEAN DEFAULT FALSE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
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
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
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
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
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
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
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
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_volume_nfe FOREIGN KEY (chave_acesso_nfe) REFERENCES nfe (chave_acesso)
);

-- Tabela item_nfe (versão alternativa para compatibilidade)
CREATE TABLE item_nfe (
    id SERIAL PRIMARY KEY,
    nfe_id INTEGER NOT NULL REFERENCES nfe(id),
    produto_id INTEGER NOT NULL REFERENCES produto(id),
    quantidade DECIMAL(10,3) NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela movimentacao_nfe
CREATE TABLE movimentacao_nfe (
    id SERIAL PRIMARY KEY,
    nfe_id INTEGER NOT NULL REFERENCES nfe(id),
    data_movimentacao TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- MÓDULO DE COMPRAS E VENDAS (ERP)
-- =============================================================

-- Criar sequências para numeração automática
CREATE SEQUENCE compra_numero_seq START 1;

-- Tabela compra (Pedidos de Compra)
CREATE TABLE compra (
    numero_pedido VARCHAR(20) NOT NULL,
    modelo VARCHAR(10) NOT NULL, -- Modelo da nota fiscal
    serie VARCHAR(10) NOT NULL, -- Série da nota fiscal
    codigo_fornecedor VARCHAR(50) NOT NULL, -- Código interno do fornecedor
    numero_sequencial INTEGER UNIQUE DEFAULT nextval('compra_numero_seq'),
    codigo VARCHAR(50), -- Código da nota fiscal
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedor(id),
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE, -- Data de emissão (antes data_pedido)
    data_chegada DATE, -- Data de chegada prevista (antes data_entrega_prevista)
    data_entrega_realizada DATE,
    condicao_pagamento_id INTEGER NOT NULL REFERENCES condicao_pagamento(id),
    forma_pagamento_id INTEGER REFERENCES forma_pagamento(id),
    funcionario_id INTEGER REFERENCES funcionario(id), -- Responsável pela compra
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'APROVADO', 'ENVIADO', 'RECEBIDO', 'CANCELADO')),
    tipo_frete VARCHAR(20) DEFAULT 'CIF' CHECK (tipo_frete IN ('CIF', 'FOB')),
    transportadora_id INTEGER REFERENCES transportadora(id),
    valor_frete DECIMAL(15,2) DEFAULT 0.00,
    valor_seguro DECIMAL(15,2) DEFAULT 0.00,
    outras_despesas DECIMAL(15,2) DEFAULT 0.00, -- Outras despesas
    valor_desconto DECIMAL(15,2) DEFAULT 0.00,
    valor_acrescimo DECIMAL(15,2) DEFAULT 0.00,
    total_produtos DECIMAL(15,2) NOT NULL DEFAULT 0.00, -- Total dos produtos
    total_a_pagar DECIMAL(15,2) NOT NULL DEFAULT 0.00, -- Total a pagar (valor final)
    valor_produtos DECIMAL(15,2) NOT NULL DEFAULT 0.00, -- Mantido para compatibilidade
    valor_total DECIMAL(15,2) NOT NULL DEFAULT 0.00, -- Mantido para compatibilidade
    observacoes TEXT,
    aprovado_por INTEGER REFERENCES funcionario(id),
    data_aprovacao TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (numero_pedido, modelo, serie, codigo_fornecedor)
);

-- Tabela item_compra (Itens do Pedido de Compra)
CREATE TABLE item_compra (
    id SERIAL PRIMARY KEY,
    compra_numero_pedido VARCHAR(20) NOT NULL,
    compra_modelo VARCHAR(10) NOT NULL,
    compra_serie VARCHAR(10) NOT NULL,
    compra_codigo_fornecedor VARCHAR(50) NOT NULL,
    codigo VARCHAR(50) NOT NULL, -- Código do produto
    produto_id INTEGER NOT NULL REFERENCES produto(id),
    produto VARCHAR(255) NOT NULL, -- Nome do produto
    unidade VARCHAR(20) NOT NULL, -- Unidade de medida
    quantidade DECIMAL(15,3) NOT NULL,
    preco_un DECIMAL(15,4) NOT NULL, -- Preço unitário
    desc_un DECIMAL(15,4) DEFAULT 0.00, -- Desconto unitário
    liquido_un DECIMAL(15,4) NOT NULL, -- Valor líquido unitário
    total DECIMAL(15,2) NOT NULL, -- Total do item
    rateio DECIMAL(15,2) DEFAULT 0.00, -- Rateio
    custo_final_un DECIMAL(15,4) NOT NULL, -- Custo final unitário
    custo_final DECIMAL(15,2) NOT NULL, -- Custo final total
    valor_unitario DECIMAL(15,4), -- Mantido para compatibilidade
    valor_desconto DECIMAL(15,2) DEFAULT 0.00, -- Mantido para compatibilidade
    valor_total DECIMAL(15,2), -- Mantido para compatibilidade (será igual a total)
    quantidade_recebida DECIMAL(15,3) DEFAULT 0.00,
    data_entrega_item DATE,
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compra_numero_pedido, compra_modelo, compra_serie, compra_codigo_fornecedor) 
        REFERENCES compra(numero_pedido, modelo, serie, codigo_fornecedor) ON DELETE CASCADE
);

-- Tabela parcela_compra (Parcelas do Pedido de Compra)
CREATE TABLE parcela_compra (
    id SERIAL PRIMARY KEY,
    compra_numero_pedido VARCHAR(20) NOT NULL,
    compra_modelo VARCHAR(10) NOT NULL,
    compra_serie VARCHAR(10) NOT NULL,
    compra_codigo_fornecedor VARCHAR(50) NOT NULL,
    parcela INTEGER NOT NULL, -- Número da parcela
    codigo_forma_pagto VARCHAR(20) NOT NULL, -- Código da forma de pagamento
    forma_pagamento_id INTEGER NOT NULL REFERENCES forma_pagamento(id),
    forma_pagamento VARCHAR(100) NOT NULL, -- Nome da forma de pagamento
    data_vencimento DATE NOT NULL, -- Data de vencimento da parcela
    valor_parcela DECIMAL(15,2) NOT NULL, -- Valor da parcela
    status VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO')),
    data_pagamento DATE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compra_numero_pedido, compra_modelo, compra_serie, compra_codigo_fornecedor) 
        REFERENCES compra(numero_pedido, modelo, serie, codigo_fornecedor) ON DELETE CASCADE,
    CONSTRAINT uk_parcela_compra UNIQUE (compra_numero_pedido, compra_modelo, compra_serie, compra_codigo_fornecedor, parcela)
);

-- Tabela recebimento_compra (Controle de Recebimentos)
CREATE TABLE recebimento_compra (
    id SERIAL PRIMARY KEY,
    compra_numero_pedido VARCHAR(20) NOT NULL,
    compra_modelo VARCHAR(10) NOT NULL,
    compra_serie VARCHAR(10) NOT NULL,
    compra_codigo_fornecedor VARCHAR(50) NOT NULL,
    numero_recebimento VARCHAR(20) NOT NULL UNIQUE,
    data_recebimento DATE NOT NULL DEFAULT CURRENT_DATE,
    funcionario_responsavel_id INTEGER NOT NULL REFERENCES funcionario(id),
    nfe_referencia VARCHAR(44), -- Chave da NFe do fornecedor
    valor_total_recebido DECIMAL(15,2) NOT NULL,
    observacoes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'RECEBIDO' CHECK (status IN ('RECEBIDO', 'CONFERIDO', 'DIVERGENCIA')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compra_numero_pedido, compra_modelo, compra_serie, compra_codigo_fornecedor) 
        REFERENCES compra(numero_pedido, modelo, serie, codigo_fornecedor)
);

-- Tabela item_recebimento_compra (Itens Recebidos)
CREATE TABLE item_recebimento_compra (
    id SERIAL PRIMARY KEY,
    recebimento_id INTEGER NOT NULL REFERENCES recebimento_compra(id) ON DELETE CASCADE,
    item_compra_id INTEGER NOT NULL REFERENCES item_compra(id),
    quantidade_recebida DECIMAL(15,3) NOT NULL,
    valor_unitario_recebido DECIMAL(15,4) NOT NULL,
    lote VARCHAR(50),
    data_validade DATE,
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela venda (Pedidos de Venda)
CREATE TABLE venda (
    id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(20) NOT NULL UNIQUE,
    cliente_id INTEGER NOT NULL REFERENCES cliente(id),
    vendedor_id INTEGER REFERENCES funcionario(id), -- Funcionário vendedor
    data_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    data_entrega_prevista DATE,
    data_entrega_realizada DATE,
    condicao_pagamento_id INTEGER NOT NULL REFERENCES condicao_pagamento(id),
    forma_pagamento_id INTEGER REFERENCES forma_pagamento(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ORCAMENTO' CHECK (status IN ('ORCAMENTO', 'PEDIDO', 'PRODUCAO', 'FATURADO', 'ENTREGUE', 'CANCELADO')),
    tipo_venda VARCHAR(20) NOT NULL DEFAULT 'VENDA' CHECK (tipo_venda IN ('VENDA', 'ORCAMENTO', 'CONSIGNACAO', 'BONIFICACAO')),
    tipo_frete VARCHAR(20) DEFAULT 'CIF' CHECK (tipo_frete IN ('CIF', 'FOB', 'SEM_FRETE')),
    transportadora_id INTEGER REFERENCES transportadora(id),
    endereco_entrega TEXT,
    valor_frete DECIMAL(15,2) DEFAULT 0.00,
    valor_seguro DECIMAL(15,2) DEFAULT 0.00,
    valor_desconto DECIMAL(15,2) DEFAULT 0.00,
    percentual_desconto DECIMAL(5,2) DEFAULT 0.00,
    valor_acrescimo DECIMAL(15,2) DEFAULT 0.00,
    valor_produtos DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    valor_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    observacoes TEXT,
    aprovado_por INTEGER REFERENCES funcionario(id),
    data_aprovacao TIMESTAMP,
    nfe_id INTEGER REFERENCES nfe(id), -- NFe gerada para esta venda
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela item_venda (Itens do Pedido de Venda)
CREATE TABLE item_venda (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER NOT NULL REFERENCES venda(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produto(id),
    quantidade DECIMAL(15,3) NOT NULL,
    valor_unitario DECIMAL(15,4) NOT NULL,
    valor_desconto DECIMAL(15,2) DEFAULT 0.00,
    percentual_desconto DECIMAL(5,2) DEFAULT 0.00,
    valor_total DECIMAL(15,2) NOT NULL,
    quantidade_entregue DECIMAL(15,3) DEFAULT 0.00,
    data_entrega_item DATE,
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela entrega_venda (Controle de Entregas)
CREATE TABLE entrega_venda (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER NOT NULL REFERENCES venda(id),
    numero_entrega VARCHAR(20) NOT NULL UNIQUE,
    data_entrega DATE NOT NULL DEFAULT CURRENT_DATE,
    funcionario_responsavel_id INTEGER NOT NULL REFERENCES funcionario(id),
    transportadora_id INTEGER REFERENCES transportadora(id),
    veiculo_id INTEGER REFERENCES veiculo(id),
    endereco_entrega TEXT NOT NULL,
    valor_total_entregue DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PREPARANDO' CHECK (status IN ('PREPARANDO', 'TRANSPORTE', 'ENTREGUE', 'DEVOLVIDO')),
    data_saida TIMESTAMP,
    data_chegada TIMESTAMP,
    observacoes TEXT,
    assinatura_recebimento TEXT, -- Pode armazenar o nome de quem recebeu
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela item_entrega_venda (Itens Entregues)
CREATE TABLE item_entrega_venda (
    id SERIAL PRIMARY KEY,
    entrega_id INTEGER NOT NULL REFERENCES entrega_venda(id) ON DELETE CASCADE,
    item_venda_id INTEGER NOT NULL REFERENCES item_venda(id),
    quantidade_entregue DECIMAL(15,3) NOT NULL,
    valor_unitario_entregue DECIMAL(15,4) NOT NULL,
    lote VARCHAR(50),
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela estoque_movimento (Controle de Movimentações de Estoque)
CREATE TABLE estoque_movimento (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER NOT NULL REFERENCES produto(id),
    tipo_movimento VARCHAR(20) NOT NULL CHECK (tipo_movimento IN ('ENTRADA', 'SAIDA', 'AJUSTE', 'TRANSFERENCIA', 'INVENTARIO')),
    origem VARCHAR(30) NOT NULL CHECK (origem IN ('COMPRA', 'VENDA', 'AJUSTE', 'PRODUCAO', 'DEVOLUCAO', 'INVENTARIO')),
    documento_origem_id INTEGER, -- ID do documento que originou o movimento (compra_id, venda_id, etc.)
    numero_documento VARCHAR(50),
    data_movimento DATE NOT NULL DEFAULT CURRENT_DATE,
    funcionario_id INTEGER NOT NULL REFERENCES funcionario(id),
    quantidade_anterior DECIMAL(15,3) NOT NULL,
    quantidade_movimento DECIMAL(15,3) NOT NULL,
    quantidade_atual DECIMAL(15,3) NOT NULL,
    valor_unitario DECIMAL(15,4),
    valor_total DECIMAL(15,2),
    lote VARCHAR(50),
    data_validade DATE,
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela contas_pagar (Contas a Pagar - Geradas das Compras)
CREATE TABLE contas_pagar (
    id SERIAL PRIMARY KEY,
    compra_numero_pedido VARCHAR(20),
    compra_modelo VARCHAR(10),
    compra_serie VARCHAR(10),
    compra_codigo_fornecedor VARCHAR(50),
    fornecedor_id INTEGER NOT NULL REFERENCES fornecedor(id),
    numero_documento VARCHAR(50) NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL DEFAULT 'FATURA' CHECK (tipo_documento IN ('FATURA', 'DUPLICATA', 'BOLETO', 'NOTA_FISCAL')),
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor_original DECIMAL(15,2) NOT NULL,
    valor_desconto DECIMAL(15,2) DEFAULT 0.00,
    valor_juros DECIMAL(15,2) DEFAULT 0.00,
    valor_multa DECIMAL(15,2) DEFAULT 0.00,
    valor_pago DECIMAL(15,2) DEFAULT 0.00,
    valor_saldo DECIMAL(15,2) NOT NULL,
    forma_pagamento_id INTEGER REFERENCES forma_pagamento(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'PAGO', 'PARCIAL', 'VENCIDO', 'CANCELADO')),
    observacoes TEXT,
    pago_por INTEGER REFERENCES funcionario(id),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (compra_numero_pedido, compra_modelo, compra_serie, compra_codigo_fornecedor) 
        REFERENCES compra(numero_pedido, modelo, serie, codigo_fornecedor)
);

-- Tabela contas_receber (Contas a Receber - Geradas das Vendas)
CREATE TABLE contas_receber (
    id SERIAL PRIMARY KEY,
    venda_id INTEGER REFERENCES venda(id),
    cliente_id INTEGER NOT NULL REFERENCES cliente(id),
    numero_documento VARCHAR(50) NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL DEFAULT 'FATURA' CHECK (tipo_documento IN ('FATURA', 'DUPLICATA', 'BOLETO', 'NOTA_FISCAL')),
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    data_recebimento DATE,
    valor_original DECIMAL(15,2) NOT NULL,
    valor_desconto DECIMAL(15,2) DEFAULT 0.00,
    valor_juros DECIMAL(15,2) DEFAULT 0.00,
    valor_multa DECIMAL(15,2) DEFAULT 0.00,
    valor_recebido DECIMAL(15,2) DEFAULT 0.00,
    valor_saldo DECIMAL(15,2) NOT NULL,
    forma_pagamento_id INTEGER REFERENCES forma_pagamento(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'RECEBIDO', 'PARCIAL', 'VENCIDO', 'CANCELADO')),
    observacoes TEXT,
    recebido_por INTEGER REFERENCES funcionario(id),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela orcamento (Orçamentos separados das Vendas)
CREATE TABLE orcamento (
    id SERIAL PRIMARY KEY,
    numero_orcamento VARCHAR(20) NOT NULL UNIQUE,
    cliente_id INTEGER NOT NULL REFERENCES cliente(id),
    vendedor_id INTEGER REFERENCES funcionario(id),
    data_orcamento DATE NOT NULL DEFAULT CURRENT_DATE,
    data_validade DATE NOT NULL,
    condicao_pagamento_id INTEGER NOT NULL REFERENCES condicao_pagamento(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ABERTO' CHECK (status IN ('ABERTO', 'ENVIADO', 'APROVADO', 'REJEITADO', 'CONVERTIDO', 'VENCIDO')),
    valor_produtos DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    valor_desconto DECIMAL(15,2) DEFAULT 0.00,
    percentual_desconto DECIMAL(5,2) DEFAULT 0.00,
    valor_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    observacoes TEXT,
    venda_id INTEGER REFERENCES venda(id), -- Se foi convertido em venda
    data_conversao TIMESTAMP,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela item_orcamento (Itens do Orçamento)
CREATE TABLE item_orcamento (
    id SERIAL PRIMARY KEY,
    orcamento_id INTEGER NOT NULL REFERENCES orcamento(id) ON DELETE CASCADE,
    produto_id INTEGER NOT NULL REFERENCES produto(id),
    quantidade DECIMAL(15,3) NOT NULL,
    valor_unitario DECIMAL(15,4) NOT NULL,
    valor_desconto DECIMAL(15,2) DEFAULT 0.00,
    percentual_desconto DECIMAL(5,2) DEFAULT 0.00,
    valor_total DECIMAL(15,2) NOT NULL,
    observacoes TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
CREATE INDEX idx_cliente_condicao_pagamento_id ON cliente(condicao_pagamento_id);
CREATE INDEX idx_cliente_nacionalidade_id ON cliente(nacionalidade_id);
CREATE INDEX idx_fornecedor_cnpj_cpf ON fornecedor(cnpj_cpf);
CREATE INDEX idx_fornecedor_razao_social ON fornecedor(razao_social);
CREATE INDEX idx_fornecedor_cidade_id ON fornecedor(cidade_id);
CREATE INDEX idx_fornecedor_condicao_pagamento_id ON fornecedor(condicao_pagamento_id);
CREATE INDEX idx_fornecedor_nacionalidade_id ON fornecedor(nacionalidade_id);
CREATE INDEX idx_fornecedor_transportadora_id ON fornecedor(transportadora_id);
CREATE INDEX idx_funcionario_cpf ON funcionario(cpf);
CREATE INDEX idx_funcionario_email ON funcionario(email);
CREATE INDEX idx_funcionario_cargo_id ON funcionario(cargo_id);
CREATE INDEX idx_funcionario_departamento_id ON funcionario(departamento_id);
CREATE INDEX idx_funcionario_cidade_id ON funcionario(cidade_id);
CREATE INDEX idx_funcionario_funcao_id ON funcionario(funcao_funcionario_id);
CREATE INDEX idx_funcionario_nacionalidade_id ON funcionario(nacionalidade_id);
CREATE INDEX idx_transportador_cidade_id ON transportador(cidade_id);
CREATE INDEX idx_transportadora_cidade_id ON transportadora(cidade_id);
CREATE INDEX idx_transportadora_condicao_pagamento_id ON transportadora(condicao_pagamento_id);
-- Índices para produtos e tabelas relacionadas
CREATE INDEX idx_produto_marca_id ON produto(marca_id);
CREATE INDEX idx_produto_categoria_id ON produto(categoria_id);
CREATE INDEX idx_produto_unidade_medida_id ON produto(unidade_medida_id);
CREATE INDEX idx_produto_codigo ON produto(codigo);
CREATE INDEX idx_produto_codigo_barras ON produto(codigo_barras);
CREATE INDEX idx_produto_produto ON produto(produto);
CREATE INDEX idx_produto_ativo ON produto(ativo);
-- Índices para nfe
CREATE INDEX idx_nfe_cnpj_emitente ON nfe(cnpj_emitente);
CREATE INDEX idx_nfe_cnpj_destinatario ON nfe(cnpj_destinatario);
CREATE INDEX idx_nfe_cliente_id ON nfe(cliente_id);
CREATE INDEX idx_nfe_data_emissao ON nfe(data_emissao);
CREATE INDEX idx_nfe_numero ON nfe(numero);
CREATE INDEX idx_nfe_situacao ON nfe(situacao);
CREATE INDEX idx_nfe_forma_pagamento_id ON nfe(forma_pagamento_id);
CREATE INDEX idx_nfe_transportadora_id ON nfe(transportadora_id);
CREATE INDEX idx_nfe_veiculo_id ON nfe(veiculo_id);
CREATE INDEX idx_nfe_modalidade_id ON nfe(modalidade_id);
-- Índices para ITEM_nfe
CREATE INDEX idx_item_nfe_chave_acesso ON itemnfe(chave_acesso_nfe);
CREATE INDEX idx_item_nfe_codigo_produto ON itemnfe(codigo_produto);
CREATE INDEX idx_item_nfe_nfe_id ON item_nfe(nfe_id);
CREATE INDEX idx_item_nfe_produto_id ON item_nfe(produto_id);
-- Índices para fatura
CREATE INDEX idx_fatura_chave_acesso ON fatura(chave_acesso_nfe);
-- Índices para parcela
CREATE INDEX idx_parcela_fatura_id ON parcela(fatura_id);
CREATE INDEX idx_parcela_forma_pagamento_id ON parcela(forma_pagamento_id);
CREATE INDEX idx_parcela_data_vencimento ON parcela(data_vencimento);
CREATE INDEX idx_parcela_status ON parcela(status);
-- Índices para volume
CREATE INDEX idx_volume_chave_acesso ON volume(chave_acesso_nfe);
-- Índices para CONDIÇÃO DE PAGAMENTO E parcelas - ADICIONADOS
CREATE INDEX idx_parcela_condicao_pagamento_condicao_id ON parcela_condicao_pagamento(condicao_pagamento_id);
CREATE INDEX idx_parcela_condicao_pagamento_forma_id ON parcela_condicao_pagamento(forma_pagamento_id);
-- Índices para tabelas auxiliares
CREATE INDEX idx_fornecedor_email_fornecedor_id ON fornecedor_email(fornecedor_id);
CREATE INDEX idx_fornecedor_telefone_fornecedor_id ON fornecedor_telefone(fornecedor_id);
CREATE INDEX idx_transportadora_emails_cod_trans ON transportadora_emails(cod_trans);
CREATE INDEX idx_transportadora_telefones_cod_trans ON transportadora_telefones(cod_trans);
CREATE INDEX idx_produto_fornecedor_produto_id ON produto_fornecedor(produto_id);
CREATE INDEX idx_produto_fornecedor_fornecedor_id ON produto_fornecedor(fornecedor_id);
CREATE INDEX idx_movimentacao_nfe_nfe_id ON movimentacao_nfe(nfe_id);
-- Índices para módulo de compras e vendas
CREATE INDEX idx_compra_fornecedor_id ON compra(fornecedor_id);
CREATE INDEX idx_compra_data_emissao ON compra(data_emissao);
CREATE INDEX idx_compra_status ON compra(status);
CREATE INDEX idx_compra_funcionario_id ON compra(funcionario_id);
CREATE INDEX idx_compra_condicao_pagamento_id ON compra(condicao_pagamento_id);
CREATE INDEX idx_compra_transportadora_id ON compra(transportadora_id);
CREATE INDEX idx_compra_numero_pedido ON compra(numero_pedido);
CREATE INDEX idx_compra_modelo ON compra(modelo);
CREATE INDEX idx_compra_serie ON compra(serie);
CREATE INDEX idx_compra_codigo_fornecedor ON compra(codigo_fornecedor);
CREATE INDEX idx_item_compra_compra ON item_compra(compra_numero_pedido, compra_modelo, compra_serie, compra_codigo_fornecedor);
CREATE INDEX idx_item_compra_produto_id ON item_compra(produto_id);
CREATE INDEX idx_item_compra_codigo ON item_compra(codigo);
CREATE INDEX idx_parcela_compra_compra ON parcela_compra(compra_numero_pedido, compra_modelo, compra_serie, compra_codigo_fornecedor);
CREATE INDEX idx_parcela_compra_forma_pagamento_id ON parcela_compra(forma_pagamento_id);
CREATE INDEX idx_parcela_compra_data_vencimento ON parcela_compra(data_vencimento);
CREATE INDEX idx_parcela_compra_status ON parcela_compra(status);
CREATE INDEX idx_recebimento_compra_compra ON recebimento_compra(compra_numero_pedido, compra_modelo, compra_serie, compra_codigo_fornecedor);
CREATE INDEX idx_recebimento_compra_data ON recebimento_compra(data_recebimento);
CREATE INDEX idx_item_recebimento_recebimento_id ON item_recebimento_compra(recebimento_id);
CREATE INDEX idx_item_recebimento_item_compra_id ON item_recebimento_compra(item_compra_id);
CREATE INDEX idx_venda_cliente_id ON venda(cliente_id);
CREATE INDEX idx_venda_vendedor_id ON venda(vendedor_id);
CREATE INDEX idx_venda_data_pedido ON venda(data_pedido);
CREATE INDEX idx_venda_status ON venda(status);
CREATE INDEX idx_venda_condicao_pagamento_id ON venda(condicao_pagamento_id);
CREATE INDEX idx_venda_transportadora_id ON venda(transportadora_id);
CREATE INDEX idx_venda_nfe_id ON venda(nfe_id);
CREATE INDEX idx_item_venda_venda_id ON item_venda(venda_id);
CREATE INDEX idx_item_venda_produto_id ON item_venda(produto_id);
CREATE INDEX idx_entrega_venda_venda_id ON entrega_venda(venda_id);
CREATE INDEX idx_entrega_venda_data ON entrega_venda(data_entrega);
CREATE INDEX idx_entrega_venda_status ON entrega_venda(status);
CREATE INDEX idx_item_entrega_entrega_id ON item_entrega_venda(entrega_id);
CREATE INDEX idx_item_entrega_item_venda_id ON item_entrega_venda(item_venda_id);
CREATE INDEX idx_estoque_movimento_produto_id ON estoque_movimento(produto_id);
CREATE INDEX idx_estoque_movimento_data ON estoque_movimento(data_movimento);
CREATE INDEX idx_estoque_movimento_tipo ON estoque_movimento(tipo_movimento);
CREATE INDEX idx_estoque_movimento_origem ON estoque_movimento(origem);
CREATE INDEX idx_contas_pagar_fornecedor_id ON contas_pagar(fornecedor_id);
CREATE INDEX idx_contas_pagar_compra ON contas_pagar(compra_numero_pedido, compra_modelo, compra_serie, compra_codigo_fornecedor);
CREATE INDEX idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX idx_contas_receber_cliente_id ON contas_receber(cliente_id);
CREATE INDEX idx_contas_receber_venda_id ON contas_receber(venda_id);
CREATE INDEX idx_contas_receber_vencimento ON contas_receber(data_vencimento);
CREATE INDEX idx_contas_receber_status ON contas_receber(status);
CREATE INDEX idx_orcamento_cliente_id ON orcamento(cliente_id);
CREATE INDEX idx_orcamento_vendedor_id ON orcamento(vendedor_id);
CREATE INDEX idx_orcamento_data ON orcamento(data_orcamento);
CREATE INDEX idx_orcamento_status ON orcamento(status);
CREATE INDEX idx_orcamento_venda_id ON orcamento(venda_id);
CREATE INDEX idx_item_orcamento_orcamento_id ON item_orcamento(orcamento_id);
CREATE INDEX idx_item_orcamento_produto_id ON item_orcamento(produto_id);
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
CREATE TRIGGER update_parcela_condicao_pagamento_timestamp BEFORE
UPDATE ON parcela_condicao_pagamento FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_emitente_timestamp BEFORE
UPDATE ON emitente FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_cliente_timestamp BEFORE
UPDATE ON cliente FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_fornecedor_timestamp BEFORE
UPDATE ON fornecedor FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_departamento_timestamp BEFORE
UPDATE ON departamento FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_funcao_funcionario_timestamp BEFORE
UPDATE ON funcao_funcionario FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_cargo_timestamp BEFORE
UPDATE ON cargo FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_marca_timestamp BEFORE
UPDATE ON marca FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_categoria_timestamp BEFORE
UPDATE ON categoria FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_unidade_medida_timestamp BEFORE
UPDATE ON unidade_medida FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_modalidade_nfe_timestamp BEFORE
UPDATE ON modalidade_nfe FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_veiculo_timestamp BEFORE
UPDATE ON veiculo FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_funcionario_timestamp BEFORE
UPDATE ON funcionario FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_destinatario_timestamp BEFORE
UPDATE ON destinatario FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_transportador_timestamp BEFORE
UPDATE ON transportador FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_transportadora_timestamp BEFORE
UPDATE ON transportadora FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_fornecedor_email_timestamp BEFORE
UPDATE ON fornecedor_email FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_fornecedor_telefone_timestamp BEFORE
UPDATE ON fornecedor_telefone FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_produto_fornecedor_timestamp BEFORE
UPDATE ON produto_fornecedor FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_transp_item_timestamp BEFORE
UPDATE ON transp_item FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_produto_timestamp BEFORE
UPDATE ON produto FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_nfe_timestamp BEFORE
UPDATE ON nfe FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_item_nfe_timestamp BEFORE
UPDATE ON itemnfe FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_item_nfe_alt_timestamp BEFORE
UPDATE ON item_nfe FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_movimentacao_nfe_timestamp BEFORE
UPDATE ON movimentacao_nfe FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_compra_timestamp BEFORE
UPDATE ON compra FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_item_compra_timestamp BEFORE
UPDATE ON item_compra FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_parcela_compra_timestamp BEFORE
UPDATE ON parcela_compra FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_recebimento_compra_timestamp BEFORE
UPDATE ON recebimento_compra FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_item_recebimento_compra_timestamp BEFORE
UPDATE ON item_recebimento_compra FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_venda_timestamp BEFORE
UPDATE ON venda FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_item_venda_timestamp BEFORE
UPDATE ON item_venda FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_entrega_venda_timestamp BEFORE
UPDATE ON entrega_venda FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_item_entrega_venda_timestamp BEFORE
UPDATE ON item_entrega_venda FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_estoque_movimento_timestamp BEFORE
UPDATE ON estoque_movimento FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_contas_pagar_timestamp BEFORE
UPDATE ON contas_pagar FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_contas_receber_timestamp BEFORE
UPDATE ON contas_receber FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_orcamento_timestamp BEFORE
UPDATE ON orcamento FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_item_orcamento_timestamp BEFORE
UPDATE ON item_orcamento FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_fatura_timestamp BEFORE
UPDATE ON fatura FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_parcela_timestamp BEFORE
UPDATE ON parcela FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_volume_timestamp BEFORE
UPDATE ON volume FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER update_cliente_destinatario_timestamp BEFORE
UPDATE ON cliente_destinatario FOR EACH ROW EXECUTE PROCEDURE update_timestamp();


-- Comentários
COMMENT ON SCHEMA dbo IS 'Schema principal para o sistema de NF-e';
COMMENT ON TABLE dbo.pais IS 'Cadastro de países';
COMMENT ON TABLE dbo.estado IS 'Cadastro de estados/províncias';
COMMENT ON TABLE dbo.cidade IS 'Cadastro de cidades/municípios';
COMMENT ON COLUMN dbo.condicao_pagamento.nome IS 'Nome da condição de pagamento';
COMMENT ON COLUMN dbo.condicao_pagamento.descricao IS 'Descrição da condição de pagamento';
COMMENT ON COLUMN dbo.condicao_pagamento.taxa_juros IS 'Taxa de juros mensal aplicada à condição de pagamento (%)';
COMMENT ON COLUMN dbo.condicao_pagamento.taxa_multa IS 'Taxa de multa por atraso no pagamento (%)';
COMMENT ON COLUMN dbo.condicao_pagamento.percentual_desconto IS 'Percentual de desconto concedido na condição de pagamento (%)';
COMMENT ON COLUMN dbo.condicao_pagamento.ativo IS 'Indica se a condição de pagamento está ativa';
COMMENT ON COLUMN dbo.condicao_pagamento.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN dbo.condicao_pagamento.updated_at IS 'Data da última atualização do registro';
COMMENT ON COLUMN dbo.parcela_condicao_pagamento.condicao_pagamento_id IS 'ID da condição de pagamento';
COMMENT ON COLUMN dbo.parcela_condicao_pagamento.numero_parcela IS 'Número sequencial da parcela';
COMMENT ON COLUMN dbo.parcela_condicao_pagamento.forma_pagamento_id IS 'ID da forma de pagamento';
COMMENT ON COLUMN dbo.parcela_condicao_pagamento.dias_para_pagamento IS 'Dias para vencimento da parcela';
COMMENT ON COLUMN dbo.parcela_condicao_pagamento.percentual_valor IS 'Percentual do valor total que representa esta parcela';
COMMENT ON COLUMN dbo.parcela_condicao_pagamento.ativo IS 'Indica se a parcela está ativa';
COMMENT ON COLUMN dbo.parcela_condicao_pagamento.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN dbo.parcela_condicao_pagamento.updated_at IS 'Data da última atualização do registro';
COMMENT ON TABLE dbo.marca IS 'Cadastro de marcas de produtos';
COMMENT ON TABLE dbo.categoria IS 'Cadastro de categorias de produtos';
COMMENT ON TABLE dbo.unidade_medida IS 'Cadastro de unidades de medida';
COMMENT ON COLUMN dbo.unidade_medida.id IS 'ID único da unidade de medida';
COMMENT ON COLUMN dbo.unidade_medida.nome IS 'Nome da unidade de medida';
COMMENT ON COLUMN dbo.unidade_medida.sigla IS 'Sigla da unidade de medida';
COMMENT ON COLUMN dbo.unidade_medida.ativo IS 'Indica se a unidade de medida está ativa';
COMMENT ON COLUMN dbo.unidade_medida.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN dbo.unidade_medida.updated_at IS 'Data da última atualização do registro';
COMMENT ON TABLE dbo.produto IS 'Cadastro de produtos';
COMMENT ON COLUMN dbo.produto.id IS 'ID único do produto';
COMMENT ON COLUMN dbo.produto.produto IS 'Nome/descrição do produto';
COMMENT ON COLUMN dbo.produto.unidade_medida_id IS 'ID da unidade de medida';
COMMENT ON COLUMN dbo.produto.codigo_barras IS 'Código de barras do produto';
COMMENT ON COLUMN dbo.produto.referencia IS 'Referência interna do produto';
COMMENT ON COLUMN dbo.produto.marca_id IS 'ID da marca do produto';
COMMENT ON COLUMN dbo.produto.categoria_id IS 'ID da categoria do produto';
COMMENT ON COLUMN dbo.produto.quantidade_minima IS 'Quantidade mínima em estoque';
COMMENT ON COLUMN dbo.produto.valor_compra IS 'Valor de compra do produto';
COMMENT ON COLUMN dbo.produto.valor_venda IS 'Valor de venda do produto';
COMMENT ON COLUMN dbo.produto.quantidade IS 'Quantidade atual em estoque';
COMMENT ON COLUMN dbo.produto.percentual_lucro IS 'Percentual de lucro sobre o produto';
COMMENT ON COLUMN dbo.produto.descricao IS 'Descrição detalhada do produto';
COMMENT ON COLUMN dbo.produto.observacoes IS 'Observações sobre o produto';
COMMENT ON COLUMN dbo.produto.situacao IS 'Data de situação do produto';
COMMENT ON COLUMN dbo.produto.data_criacao IS 'Data de criação do produto';
COMMENT ON COLUMN dbo.produto.data_alteracao IS 'Data da última alteração';
COMMENT ON COLUMN dbo.produto.usuario_criacao IS 'Usuário que criou o produto';
COMMENT ON COLUMN dbo.produto.usuario_atualizacao IS 'Usuário que atualizou o produto';
COMMENT ON COLUMN dbo.produto.codigo IS 'Código do produto para NFe';
COMMENT ON COLUMN dbo.produto.ncm IS 'NCM do produto';
COMMENT ON COLUMN dbo.produto.cest IS 'CEST do produto';
COMMENT ON COLUMN dbo.produto.unidade IS 'Unidade para NFe';
COMMENT ON COLUMN dbo.produto.valor_unitario IS 'Valor unitário para NFe';
COMMENT ON COLUMN dbo.produto.peso_liquido IS 'Peso líquido em kg';
COMMENT ON COLUMN dbo.produto.peso_bruto IS 'Peso bruto em kg';
COMMENT ON COLUMN dbo.produto.gtin IS 'GTIN/EAN do produto';
COMMENT ON COLUMN dbo.produto.gtin_tributavel IS 'GTIN tributável';
COMMENT ON COLUMN dbo.produto.ativo IS 'Indica se o produto está ativo';
COMMENT ON COLUMN dbo.produto.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN dbo.produto.updated_at IS 'Data da última atualização do registro';
COMMENT ON TABLE dbo.emitente IS 'Cadastro de empresas emitentes de notas fiscais';
COMMENT ON TABLE dbo.cliente IS 'Cadastro de clientes';
COMMENT ON COLUMN dbo.cliente.condicao_pagamento_id IS 'ID da condição de pagamento padrão do cliente';
COMMENT ON TABLE dbo.fornecedor IS 'Cadastro de fornecedores';
COMMENT ON COLUMN dbo.fornecedor.id IS 'ID único do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.cnpj_cpf IS 'CNPJ ou CPF do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.tipo IS 'Tipo de fornecedor: F=Física, J=Jurídica';
COMMENT ON COLUMN dbo.fornecedor.is_estrangeiro IS 'Indica se é um fornecedor estrangeiro';
COMMENT ON COLUMN dbo.fornecedor.tipo_documento IS 'Tipo de documento para fornecedores estrangeiros';
COMMENT ON COLUMN dbo.fornecedor.razao_social IS 'Razão social ou nome completo do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.nome_fantasia IS 'Nome fantasia do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.inscricao_estadual IS 'Inscrição estadual do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.endereco IS 'Endereço do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.numero IS 'Número do endereço do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.complemento IS 'Complemento do endereço do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.bairro IS 'Bairro do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.cidade_id IS 'ID da cidade do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.cep IS 'CEP do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.telefone IS 'Telefone do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.email IS 'Email do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.website IS 'Website do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.observacoes IS 'Observações sobre o fornecedor';
COMMENT ON COLUMN dbo.fornecedor.responsavel IS 'Nome do responsável pelo fornecedor';
COMMENT ON COLUMN dbo.fornecedor.celular_responsavel IS 'Celular do responsável pelo fornecedor';
COMMENT ON COLUMN dbo.fornecedor.condicao_pagamento_id IS 'ID da condição de pagamento do fornecedor';
COMMENT ON COLUMN dbo.fornecedor.ativo IS 'Indica se o fornecedor está ativo';
COMMENT ON COLUMN dbo.fornecedor.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN dbo.fornecedor.updated_at IS 'Data da última atualização do registro';
COMMENT ON TABLE dbo.funcionario IS 'Cadastro de funcionários';
COMMENT ON COLUMN dbo.funcionario.id IS 'ID único do funcionário';
COMMENT ON COLUMN dbo.funcionario.nome IS 'Nome completo do funcionário';
COMMENT ON COLUMN dbo.funcionario.cpf IS 'CPF do funcionário (apenas números)';
COMMENT ON COLUMN dbo.funcionario.email IS 'Email profissional do funcionário';
COMMENT ON COLUMN dbo.funcionario.telefone IS 'Telefone de contato do funcionário';
COMMENT ON COLUMN dbo.funcionario.celular IS 'Telefone celular do funcionário';
COMMENT ON COLUMN dbo.funcionario.rg IS 'RG do funcionário';
COMMENT ON COLUMN dbo.funcionario.orgao_emissor IS 'Órgão emissor do RG';
COMMENT ON COLUMN dbo.funcionario.data_nascimento IS 'Data de nascimento do funcionário';
COMMENT ON COLUMN dbo.funcionario.estado_civil IS 'Estado civil do funcionário';
COMMENT ON COLUMN dbo.funcionario.nacionalidade IS 'Nacionalidade do funcionário';
COMMENT ON COLUMN dbo.funcionario.cep IS 'CEP do endereço do funcionário';
COMMENT ON COLUMN dbo.funcionario.endereco IS 'Endereço do funcionário';
COMMENT ON COLUMN dbo.funcionario.numero IS 'Número do endereço do funcionário';
COMMENT ON COLUMN dbo.funcionario.complemento IS 'Complemento do endereço do funcionário';
COMMENT ON COLUMN dbo.funcionario.bairro IS 'Bairro do funcionário';
COMMENT ON COLUMN dbo.funcionario.cidade_id IS 'ID da cidade do funcionário';
COMMENT ON COLUMN dbo.funcionario.cargo_id IS 'ID do cargo do funcionário';
COMMENT ON COLUMN dbo.funcionario.departamento_id IS 'ID do departamento do funcionário';
COMMENT ON COLUMN dbo.funcionario.data_admissao IS 'Data de admissão do funcionário';
COMMENT ON COLUMN dbo.funcionario.data_demissao IS 'Data de demissão do funcionário (se aplicável)';
COMMENT ON COLUMN dbo.funcionario.salario IS 'Salário do funcionário';
COMMENT ON COLUMN dbo.funcionario.observacoes IS 'Observações sobre o funcionário';
COMMENT ON COLUMN dbo.funcionario.ativo IS 'Indica se o funcionário está ativo';
COMMENT ON COLUMN dbo.funcionario.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN dbo.funcionario.updated_at IS 'Data da última atualização do registro';
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