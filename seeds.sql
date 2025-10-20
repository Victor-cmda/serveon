-- =====================================================
-- ARQUIVO DE SEEDS - DADOS INICIAIS
-- Sistema Serveon - Dados pré-inseridos para inicialização
-- =====================================================

-- Inicia uma transação
BEGIN;

-- Garantir que estamos usando o schema correto
SET search_path TO dbo;

-- =====================================================
-- DADOS BÁSICOS DE LOCALIZAÇÃO
-- =====================================================

-- Inserir país padrão (Brasil)
INSERT INTO pais (nome, codigo, sigla, nacionalidade)
VALUES ('BRASIL', '55', 'BR', 'BRASILEIRA');

-- =====================================================
-- FORMAS DE PAGAMENTO
-- =====================================================

-- Inserir formas de pagamento comuns
INSERT INTO forma_pagamento (nome, tipo)
VALUES 
    ('DINHEIRO', 'À VISTA'),
    ('CARTÃO DE CRÉDITO', 'CRÉDITO'),
    ('CARTÃO DE DÉBITO', 'DÉBITO'),
    ('PIX', 'À VISTA'),
    ('BOLETO BANCÁRIO', 'À PRAZO'),
    ('TRANSFERÊNCIA BANCÁRIA', 'À VISTA'),
    ('CHEQUE', 'À PRAZO'),
    ('CREDIÁRIO', 'CRÉDITO'),
    ('DUPLICATA', 'À PRAZO'),
    ('PROMISSÓRIA', 'À PRAZO');

-- =====================================================
-- MODALIDADES DE NFE
-- =====================================================

-- Inserir modalidades de NFe
INSERT INTO modalidade_nfe (codigo, descricao)
VALUES 
    ('55', 'NOTA FISCAL ELETRÔNICA'),
    ('65', 'NOTA FISCAL DE CONSUMIDOR ELETRÔNICA'),
    ('57', 'CONHECIMENTO DE TRANSPORTE ELETRÔNICO'),
    ('67', 'CONHECIMENTO DE TRANSPORTE ELETRÔNICO PARA OUTROS SERVIÇOS');

-- =====================================================
-- CONDIÇÕES DE PAGAMENTO
-- =====================================================

-- Inserir condições de pagamento comuns
INSERT INTO condicao_pagamento (nome, condicao_pagamento, descricao, taxa_juros, taxa_multa, percentual_desconto, ativo)
VALUES 
    ('À VISTA', 'À VISTA', 'PAGAMENTO À VISTA', 0.00, 0.00, 5.00, true),
    ('30 DIAS', '30 DIAS', 'PAGAMENTO EM 30 DIAS', 1.50, 2.00, 0.00, true),
    ('30/60', '30/60', 'PAGAMENTO EM DUAS PARCELAS DE 30 E 60 DIAS', 2.00, 2.00, 0.00, true),
    ('30/60/90', '30/60/90', 'PAGAMENTO EM TRÊS PARCELAS DE 30, 60 E 90 DIAS', 2.50, 2.00, 0.00, true),
    ('ENTRADA + 30 DIAS', 'ENTRADA + 30 DIAS', 'PAGAMENTO COM ENTRADA E MAIS 30 DIAS', 1.00, 2.00, 0.00, true),
    ('15 DIAS', '15 DIAS', 'PAGAMENTO EM 15 DIAS', 1.00, 2.00, 0.00, true),
    ('45 DIAS', '45 DIAS', 'PAGAMENTO EM 45 DIAS', 2.00, 2.00, 0.00, true),
    ('60 DIAS', '60 DIAS', 'PAGAMENTO EM 60 DIAS', 2.50, 2.00, 0.00, true),
    ('30/60/90/120', '30/60/90/120', 'PAGAMENTO EM QUATRO PARCELAS', 3.00, 2.00, 0.00, true),
    ('ENTRADA + 60 DIAS', 'ENTRADA + 60 DIAS', 'PAGAMENTO COM ENTRADA E MAIS 60 DIAS', 1.50, 2.00, 0.00, true);

-- =====================================================
-- UNIDADES DE MEDIDA
-- =====================================================

-- Inserir unidades de medida comuns
INSERT INTO unidade_medida (unidade_medida, nome, sigla, ativo)
VALUES 
    ('UNIDADE', 'UNIDADE', 'UN', true),
    ('QUILOGRAMA', 'QUILOGRAMA', 'KG', true),
    ('GRAMA', 'GRAMA', 'G', true),
    ('LITRO', 'LITRO', 'L', true),
    ('MILILITRO', 'MILILITRO', 'ML', true),
    ('METRO', 'METRO', 'M', true),
    ('CENTÍMETRO', 'CENTÍMETRO', 'CM', true),
    ('METRO QUADRADO', 'METRO QUADRADO', 'M2', true),
    ('METRO CÚBICO', 'METRO CÚBICO', 'M3', true),
    ('PEÇA', 'PEÇA', 'PC', true),
    ('CAIXA', 'CAIXA', 'CX', true),
    ('PACOTE', 'PACOTE', 'PCT', true),
    ('PAR', 'PAR', 'PAR', true),
    ('DÚZIA', 'DÚZIA', 'DZ', true),
    ('CENTO', 'CENTO', 'CT', true),
    ('TONELADA', 'TONELADA', 'TON', true),
    ('MILHEIRO', 'MILHEIRO', 'MIL', true),
    ('RESMA', 'RESMA', 'RESMA', true),
    ('SACO', 'SACO', 'SACO', true),
    ('BALDE', 'BALDE', 'BALDE', true);

-- =====================================================
-- MARCAS
-- =====================================================

-- Inserir marcas exemplo
INSERT INTO marca (nome, descricao, ativo)
VALUES 
    ('GENÉRICA', 'MARCA GENÉRICA PARA PRODUTOS SEM MARCA ESPECÍFICA', true),
    ('PRÓPRIA', 'MARCA PRÓPRIA DA EMPRESA', true),
    ('NACIONAL', 'PRODUTOS NACIONAIS', true),
    ('IMPORTADO', 'PRODUTOS IMPORTADOS', true),
    ('SEM MARCA', 'PRODUTOS SEM MARCA DEFINIDA', true);

-- =====================================================
-- CATEGORIAS
-- =====================================================

-- Inserir categorias exemplo
INSERT INTO categoria (nome, descricao, ativo)
VALUES 
    ('GERAL', 'CATEGORIA GERAL PARA PRODUTOS DIVERSOS', true),
    ('INFORMÁTICA', 'PRODUTOS DE INFORMÁTICA E TECNOLOGIA', true),
    ('ELETRÔNICOS', 'PRODUTOS ELETRÔNICOS', true),
    ('ESCRITÓRIO', 'MATERIAIS DE ESCRITÓRIO', true),
    ('LIMPEZA', 'PRODUTOS DE LIMPEZA', true),
    ('ALIMENTAÇÃO', 'PRODUTOS ALIMENTÍCIOS', true),
    ('CONSTRUÇÃO', 'MATERIAIS DE CONSTRUÇÃO', true),
    ('AUTOMOTIVO', 'PEÇAS E ACESSÓRIOS AUTOMOTIVOS', true),
    ('VESTUÁRIO', 'ROUPAS E ACESSÓRIOS', true),
    ('CASA E JARDIM', 'PRODUTOS PARA CASA E JARDIM', true),
    ('SAÚDE E BELEZA', 'PRODUTOS DE SAÚDE E BELEZA', true),
    ('ESPORTES', 'ARTIGOS ESPORTIVOS', true);

-- =====================================================
-- DEPARTAMENTOS
-- =====================================================

-- Inserir departamentos básicos
INSERT INTO departamento (nome, descricao, ativo)
VALUES 
    ('VENDAS', 'DEPARTAMENTO DE VENDAS E ATENDIMENTO AO CLIENTE', true),
    ('COMPRAS', 'DEPARTAMENTO DE COMPRAS E SUPRIMENTOS', true),
    ('ESTOQUE', 'DEPARTAMENTO DE CONTROLE DE ESTOQUE', true),
    ('FINANCEIRO', 'DEPARTAMENTO FINANCEIRO E CONTÁBIL', true),
    ('ADMINISTRATIVO', 'DEPARTAMENTO ADMINISTRATIVO', true),
    ('RECURSOS HUMANOS', 'DEPARTAMENTO DE RECURSOS HUMANOS', true),
    ('TI', 'DEPARTAMENTO DE TECNOLOGIA DA INFORMAÇÃO', true),
    ('LOGÍSTICA', 'DEPARTAMENTO DE LOGÍSTICA E TRANSPORTE', true),
    ('PRODUÇÃO', 'DEPARTAMENTO DE PRODUÇÃO', true),
    ('QUALIDADE', 'DEPARTAMENTO DE CONTROLE DE QUALIDADE', true);

-- =====================================================
-- CARGOS
-- =====================================================

-- Inserir cargos básicos relacionados aos departamentos
INSERT INTO cargo (nome, descricao, departamento_id, ativo)
VALUES 
    ('VENDEDOR', 'VENDEDOR INTERNO E EXTERNO', (SELECT id FROM departamento WHERE nome = 'VENDAS'), true),
    ('GERENTE DE VENDAS', 'GERENTE DO DEPARTAMENTO DE VENDAS', (SELECT id FROM departamento WHERE nome = 'VENDAS'), true),
    ('COMPRADOR', 'RESPONSÁVEL PELAS COMPRAS', (SELECT id FROM departamento WHERE nome = 'COMPRAS'), true),
    ('GERENTE DE COMPRAS', 'GERENTE DO DEPARTAMENTO DE COMPRAS', (SELECT id FROM departamento WHERE nome = 'COMPRAS'), true),
    ('ALMOXARIFE', 'RESPONSÁVEL PELO CONTROLE DE ESTOQUE', (SELECT id FROM departamento WHERE nome = 'ESTOQUE'), true),
    ('CONFERENTE', 'CONFERENTE DE MERCADORIAS', (SELECT id FROM departamento WHERE nome = 'ESTOQUE'), true),
    ('OPERADOR DE CAIXA', 'OPERADOR DE CAIXA', (SELECT id FROM departamento WHERE nome = 'FINANCEIRO'), true),
    ('ANALISTA FINANCEIRO', 'ANALISTA FINANCEIRO', (SELECT id FROM departamento WHERE nome = 'FINANCEIRO'), true),
    ('MOTORISTA', 'MOTORISTA PARA ENTREGAS', (SELECT id FROM departamento WHERE nome = 'LOGÍSTICA'), true),
    ('AUXILIAR ADMINISTRATIVO', 'AUXILIAR ADMINISTRATIVO', (SELECT id FROM departamento WHERE nome = 'ADMINISTRATIVO'), true);

-- =====================================================
-- FUNÇÕES DE FUNCIONÁRIO
-- =====================================================

-- Inserir funções de funcionários para o módulo de compras e vendas
INSERT INTO funcao_funcionario (funcao_funcionario, descricao, salario_base, carga_horaria, ativo)
VALUES 
    ('VENDEDOR', 'VENDEDOR INTERNO E EXTERNO', 2500.00, 44.00, true),
    ('GERENTE DE VENDAS', 'GERENTE DO DEPARTAMENTO DE VENDAS', 5000.00, 44.00, true),
    ('COMPRADOR', 'RESPONSÁVEL PELAS COMPRAS DA EMPRESA', 3500.00, 44.00, true),
    ('GERENTE DE COMPRAS', 'GERENTE DO DEPARTAMENTO DE COMPRAS', 5500.00, 44.00, true),
    ('ALMOXARIFE', 'RESPONSÁVEL PELO CONTROLE DE ESTOQUE', 2200.00, 44.00, true),
    ('CONFERENTE', 'CONFERENTE DE MERCADORIAS', 2000.00, 44.00, true),
    ('MOTORISTA', 'MOTORISTA PARA ENTREGAS', 2300.00, 44.00, true),
    ('OPERADOR DE CAIXA', 'OPERADOR DE CAIXA E FINANCEIRO', 2100.00, 44.00, true),
    ('AUXILIAR ADMINISTRATIVO', 'AUXILIAR DE SERVIÇOS ADMINISTRATIVOS', 1800.00, 44.00, true),
    ('ANALISTA FINANCEIRO', 'ANALISTA DO DEPARTAMENTO FINANCEIRO', 3800.00, 44.00, true),
    ('SUPERVISOR DE VENDAS', 'SUPERVISOR DE EQUIPE DE VENDAS', 3200.00, 44.00, true),
    ('AUXILIAR DE ESTOQUE', 'AUXILIAR DE CONTROLE DE ESTOQUE', 1900.00, 44.00, true);

-- =====================================================
-- PARCELAS PARA CONDIÇÕES DE PAGAMENTO
-- =====================================================

-- Parcelas para À VISTA (100% à vista)
INSERT INTO parcela_condicao_pagamento (condicao_pagamento_id, numero_parcela, forma_pagamento_id, dias_para_pagamento, percentual_valor, ativo)
VALUES 
    ((SELECT id FROM condicao_pagamento WHERE nome = 'À VISTA'), 1, (SELECT id FROM forma_pagamento WHERE nome = 'DINHEIRO'), 0, 100.00, true);

-- Parcelas para 30 DIAS (100% em 30 dias)
INSERT INTO parcela_condicao_pagamento (condicao_pagamento_id, numero_parcela, forma_pagamento_id, dias_para_pagamento, percentual_valor, ativo)
VALUES 
    ((SELECT id FROM condicao_pagamento WHERE nome = '30 DIAS'), 1, (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'), 30, 100.00, true);

-- Parcelas para 30/60 (50% em 30 dias e 50% em 60 dias)
INSERT INTO parcela_condicao_pagamento (condicao_pagamento_id, numero_parcela, forma_pagamento_id, dias_para_pagamento, percentual_valor, ativo)
VALUES 
    ((SELECT id FROM condicao_pagamento WHERE nome = '30/60'), 1, (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'), 30, 50.00, true),
    ((SELECT id FROM condicao_pagamento WHERE nome = '30/60'), 2, (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'), 60, 50.00, true);

-- Parcelas para 30/60/90 (33.33% em cada data)
INSERT INTO parcela_condicao_pagamento (condicao_pagamento_id, numero_parcela, forma_pagamento_id, dias_para_pagamento, percentual_valor, ativo)
VALUES 
    ((SELECT id FROM condicao_pagamento WHERE nome = '30/60/90'), 1, (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'), 30, 33.33, true),
    ((SELECT id FROM condicao_pagamento WHERE nome = '30/60/90'), 2, (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'), 60, 33.33, true),
    ((SELECT id FROM condicao_pagamento WHERE nome = '30/60/90'), 3, (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'), 90, 33.34, true);

-- Parcelas para ENTRADA + 30 DIAS (50% entrada e 50% em 30 dias)
INSERT INTO parcela_condicao_pagamento (condicao_pagamento_id, numero_parcela, forma_pagamento_id, dias_para_pagamento, percentual_valor, ativo)
VALUES 
    ((SELECT id FROM condicao_pagamento WHERE nome = 'ENTRADA + 30 DIAS'), 1, (SELECT id FROM forma_pagamento WHERE nome = 'DINHEIRO'), 0, 50.00, true),
    ((SELECT id FROM condicao_pagamento WHERE nome = 'ENTRADA + 30 DIAS'), 2, (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'), 30, 50.00, true);

-- =====================================================
-- DADOS COMPLEMENTARES E RELACIONAMENTOS
-- =====================================================

-- =====================================================
-- ESTADOS E CIDADES
-- =====================================================

INSERT INTO estado (nome, uf, pais_id)
VALUES ('SÃO PAULO', 'SP', (SELECT id FROM pais WHERE sigla = 'BR'));

INSERT INTO cidade (nome, codigo_ibge, estado_id)
VALUES ('SÃO PAULO', '3550308', (SELECT id FROM estado WHERE uf = 'SP' AND pais_id = (SELECT id FROM pais WHERE sigla = 'BR')));

-- =====================================================
-- EMITENTE
-- =====================================================

INSERT INTO emitente (
    cnpj, razao_social, nome_fantasia, inscricao_estadual,
    endereco, numero, bairro, cidade_id, cep, telefone, email, regime_tributario
) VALUES (
    '12345678000190', 'EMPRESA MODELO LTDA', 'EMPRESA MODELO', '123456789',
    'RUA EXEMPLO', '100', 'CENTRO', (SELECT id FROM cidade WHERE nome = 'SÃO PAULO'), '01000000', '11333333333', 'contato@exemplo.com', 'SIMPLES NACIONAL'
);

-- =====================================================
-- CLIENTES, DESTINATÁRIOS E RELACIONAMENTOS
-- =====================================================

INSERT INTO cliente (
    cnpj_cpf, tipo, is_estrangeiro, razao_social, nome_fantasia,
    endereco, numero, bairro, cidade_id, cep, telefone, email, sexo,
    nacionalidade_id, limite_credito, is_destinatario, condicao_pagamento_id
) VALUES (
    '45987654000100', 'J', false, 'CLIENTE MODELO LTDA', 'CLIENTE MODELO',
    'AV. CENTRAL', '200', 'CENTRO', (SELECT id FROM cidade WHERE nome = 'SÃO PAULO'), '01010000', '11222222222', 'cliente@exemplo.com', 'M',
    (SELECT id FROM pais WHERE sigla = 'BR'), 50000.00, true, (SELECT id FROM condicao_pagamento WHERE nome = 'À VISTA')
);

INSERT INTO destinatario (
    cliente_id, cnpj_cpf, tipo, is_estrangeiro, razao_social, nome_fantasia,
    endereco, numero, bairro, cidade_id, cep, telefone, email
) VALUES (
    (SELECT id FROM cliente WHERE cnpj_cpf = '45987654000100'), '45987654000100', 'J', false, 'CLIENTE MODELO LTDA', 'CLIENTE MODELO',
    'AV. CENTRAL', '200', 'CENTRO', (SELECT id FROM cidade WHERE nome = 'SÃO PAULO'), '01010000', '11222222222', 'cliente@exemplo.com'
);

INSERT INTO cliente_destinatario (cliente_id, destinatario_id)
VALUES (
    (SELECT id FROM cliente WHERE cnpj_cpf = '45987654000100'),
    (SELECT id FROM destinatario WHERE cnpj_cpf = '45987654000100')
);

-- =====================================================
-- TRANSPORTADORAS E TRANSPORTADORES
-- =====================================================

INSERT INTO transportadora (
    razao_social, nome_fantasia, cnpj, email, telefone, endereco, numero, bairro, cidade_id, cep,
    tipo, rg_ie, condicao_pagamento_id, observacao, ativo
) VALUES (
    'TRANSPORTES MODELO LTDA', 'TRANS-MODELO', '98765432000155', 'contato@transmodelo.com', '11444444444', 'RUA LOGÍSTICA', '50', 'INDUSTRIAL', (SELECT id FROM cidade WHERE nome = 'SÃO PAULO'), '01100000',
    'J', '123456789', (SELECT id FROM condicao_pagamento WHERE nome = '30 DIAS'), 'TRANSPORTADORA PADRÃO', true
);

INSERT INTO transportador (
    cnpj_cpf, tipo, razao_social, nome_fantasia, inscricao_estadual, endereco, numero, bairro, cidade_id, cep, codigo_antt,
    placa_veiculo, uf_veiculo
) VALUES (
    '23456789000110', 'J', 'TRANSPORTADOR AUXILIAR LTDA', 'TRANS-AUX', '1122334455', 'AV. DAS CARGAS', '300', 'PORTO', (SELECT id FROM cidade WHERE nome = 'SÃO PAULO'), '01111000', 'ANTT12345',
    'ABC1D23', 'SP'
);

INSERT INTO veiculo (placa, modelo, marca, ano, capacidade)
VALUES ('ABC1D23', 'VUC', 'VW', 2022, 3.50);

INSERT INTO transportadora_emails (cod_trans, email)
VALUES ((SELECT id FROM transportadora WHERE cnpj = '98765432000155'), 'logistica@transmodelo.com');

INSERT INTO transportadora_telefones (cod_trans, telefone)
VALUES ((SELECT id FROM transportadora WHERE cnpj = '98765432000155'), '11555555555');

INSERT INTO transportadora_veiculo (transportadora_id, veiculo_id)
VALUES (
    (SELECT id FROM transportadora WHERE cnpj = '98765432000155'),
    (SELECT id FROM veiculo WHERE placa = 'ABC1D23')
);

INSERT INTO transp_item (codigo, descricao, transportadora_id, codigo_transp)
VALUES ('TITEM001', 'SERVIÇO DE TRANSPORTE PADRÃO', (SELECT id FROM transportadora WHERE cnpj = '98765432000155'), 'STD');

-- =====================================================
-- FORNECEDORES E CONTATOS
-- =====================================================

INSERT INTO fornecedor (
    cnpj_cpf, tipo, is_estrangeiro, razao_social, nome_fantasia,
    endereco, numero, bairro, cidade_id, cep, telefone, email, website,
    nacionalidade_id, responsavel, celular_responsavel, limite_credito,
    condicao_pagamento_id, transportadora_id
) VALUES (
    '66777888000155', 'J', false, 'FORNECEDOR MODELO LTDA', 'FORN-MODELO',
    'RUA DOS FORNECEDORES', '10', 'COMERCIAL', (SELECT id FROM cidade WHERE nome = 'SÃO PAULO'), '01234000', '11777777777', 'contato@fornmodelo.com', 'www.fornmodelo.com',
    (SELECT id FROM pais WHERE sigla = 'BR'), 'JOÃO COMPRAS', '11900000000', 100000.00,
    (SELECT id FROM condicao_pagamento WHERE nome = '30 DIAS'), (SELECT id FROM transportadora WHERE cnpj = '98765432000155')
);

INSERT INTO fornecedor_email (fornecedor_id, email, tipo, principal)
VALUES ((SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'), 'financeiro@fornmodelo.com', 'FINANCEIRO', true);

INSERT INTO fornecedor_telefone (fornecedor_id, telefone, tipo, principal)
VALUES ((SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'), '11888888888', 'COMERCIAL', true);

-- =====================================================
-- PRODUTOS E RELACIONAMENTOS
-- =====================================================

INSERT INTO produto (
    produto, unidade_medida_id, codigo_barras, referencia, marca_id, categoria_id,
    quantidade_minima, valor_compra, valor_venda, quantidade, percentual_lucro,
    descricao, codigo, ncm, cest, unidade, valor_unitario, peso_liquido, peso_bruto, gtin, gtin_tributavel
) VALUES (
    'PRODUTO A',
    (SELECT id FROM unidade_medida WHERE sigla = 'UN'),
    '7890000000011', 'REF-A',
    (SELECT id FROM marca WHERE nome = 'GENÉRICA'),
    (SELECT id FROM categoria WHERE nome = 'GERAL'),
    5, 50.00, 80.00, 0, 60.00,
    'PRODUTO A DE EXEMPLO', 'P0001', '12345678', '12.345.67', 'UN', 80.00, 0.500, 0.550, '7890000000011', '7890000000011'
);

INSERT INTO produto (
    produto, unidade_medida_id, codigo_barras, referencia, marca_id, categoria_id,
    quantidade_minima, valor_compra, valor_venda, quantidade, percentual_lucro,
    descricao, codigo, ncm, cest, unidade, valor_unitario, peso_liquido, peso_bruto, gtin, gtin_tributavel
) VALUES (
    'PRODUTO B',
    (SELECT id FROM unidade_medida WHERE sigla = 'UN'),
    '7890000000028', 'REF-B',
    (SELECT id FROM marca WHERE nome = 'GENÉRICA'),
    (SELECT id FROM categoria WHERE nome = 'GERAL'),
    3, 30.00, 50.00, 0, 66.67,
    'PRODUTO B DE EXEMPLO', 'P0002', '87654321', '76.543.21', 'UN', 50.00, 0.300, 0.330, '7890000000028', '7890000000028'
);

INSERT INTO produto_fornecedor (produto_id, fornecedor_id, codigo_prod, custo)
VALUES
    ((SELECT id FROM produto WHERE codigo = 'P0001'), (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'), 'FORN-P0001', 50.00),
    ((SELECT id FROM produto WHERE codigo = 'P0002'), (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'), 'FORN-P0002', 30.00);

-- =====================================================
-- FUNCIONÁRIOS
-- =====================================================

-- Reset da sequência para garantir IDs previsíveis
SELECT setval('funcionario_id_seq', 1, false);

INSERT INTO funcionario (
    funcionario, nome, cpf, email, telefone, celular, sexo,
    nacionalidade_id, cep, endereco, numero, bairro, cidade_id,
    cargo_id, departamento_id, funcao_funcionario_id,
    data_admissao, salario, observacao
) VALUES (
    'VENDEDOR TESTE', 'VENDEDOR TESTE', '12345678901', 'vendedor@exemplo.com', '11999911111', '11988881111', 1,
    (SELECT id FROM pais WHERE sigla = 'BR'), '01020000', 'RUA DOS VENDEDORES', '10', 'CENTRO', (SELECT id FROM cidade WHERE nome = 'SÃO PAULO'),
    (SELECT id FROM cargo WHERE nome = 'VENDEDOR'), (SELECT id FROM departamento WHERE nome = 'VENDAS'), (SELECT id FROM funcao_funcionario WHERE funcao_funcionario = 'VENDEDOR'),
    CURRENT_DATE - INTERVAL '365 days', 2500.00, 'Funcionario de teste - vendedor'
);

INSERT INTO funcionario (
    funcionario, nome, cpf, email, telefone, celular, sexo,
    nacionalidade_id, cep, endereco, numero, bairro, cidade_id,
    cargo_id, departamento_id, funcao_funcionario_id,
    data_admissao, salario, observacao
) VALUES (
    'COMPRADOR TESTE', 'COMPRADOR TESTE', '10987654321', 'comprador@exemplo.com', '11999922222', '11988882222', 2,
    (SELECT id FROM pais WHERE sigla = 'BR'), '01030000', 'RUA DAS COMPRAS', '20', 'CENTRO', (SELECT id FROM cidade WHERE nome = 'SÃO PAULO'),
    (SELECT id FROM cargo WHERE nome = 'COMPRADOR'), (SELECT id FROM departamento WHERE nome = 'COMPRAS'), (SELECT id FROM funcao_funcionario WHERE funcao_funcionario = 'COMPRADOR'),
    CURRENT_DATE - INTERVAL '200 days', 3500.00, 'Funcionario de teste - comprador'
);

-- =====================================================
-- COMPRAS
-- =====================================================

INSERT INTO compra (
    numero_pedido, modelo, serie, fornecedor_id,
    data_emissao, data_chegada,
    condicao_pagamento_id, forma_pagamento_id, funcionario_id, status, tipo_frete, transportadora_id,
    valor_frete, valor_seguro, valor_desconto, valor_acrescimo, total_produtos, total_a_pagar, observacoes
) VALUES (
    '1', '55', '1', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days',
    (SELECT id FROM condicao_pagamento WHERE nome = '30 DIAS'),
    (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'),
    (SELECT id FROM funcionario WHERE email = 'comprador@exemplo.com'), 'APROVADO', 'FOB', (SELECT id FROM transportadora WHERE cnpj = '98765432000155'),
    100.00, 0.00, 0.00, 0.00, 5000.00, 5100.00, 'COMPRA INICIAL DE ESTOQUE'
);

INSERT INTO item_compra (
    compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id,
    codigo, produto_id, produto, unidade, quantidade, preco_un, desc_un, liquido_un, total, custo_final_un, custo_final, valor_unitario, valor_desconto, valor_total
) VALUES (
    '1', '55', '1', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    'P0001', 
    (SELECT id FROM produto WHERE codigo = 'P0001'), 
    'PRODUTO A', 
    'UN', 
    100.000, 
    50.00, 
    0.00, 
    50.00, 
    5000.00, 
    50.00, 
    5000.00, 
    50.00, 
    0.00, 
    5000.00
);

INSERT INTO recebimento_compra (
    compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id,
    numero_recebimento, data_recebimento, funcionario_responsavel_id, nfe_referencia, valor_total_recebido, observacoes, status
) VALUES (
    '1', '55', '1', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    '1', CURRENT_DATE + INTERVAL '6 days', (SELECT id FROM funcionario WHERE email = 'comprador@exemplo.com'), NULL, 5000.00, 'RECEBIMENTO TOTAL', 'RECEBIDO'
);

INSERT INTO item_recebimento_compra (
    recebimento_id, item_compra_id, quantidade_recebida, valor_unitario_recebido, lote
) VALUES (
    (SELECT id FROM recebimento_compra WHERE numero_recebimento = '1'), 
    (SELECT id FROM item_compra WHERE compra_numero_pedido = '1' AND compra_modelo = '55' AND compra_serie = '1' AND compra_fornecedor_id = (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155') LIMIT 1), 
    100.000, 50.00, 'Lote-001'
);

-- Segunda compra - Demonstra a chave composta permitindo mesmo numero_pedido com modelo/série/fornecedor diferentes
INSERT INTO compra (
    numero_pedido, modelo, serie, fornecedor_id,
    data_emissao, data_chegada,
    condicao_pagamento_id, forma_pagamento_id, funcionario_id, status, tipo_frete, transportadora_id,
    valor_frete, valor_seguro, valor_desconto, valor_acrescimo, total_produtos, total_a_pagar, observacoes
) VALUES (
    '2', '55', '1', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '15 days',
    (SELECT id FROM condicao_pagamento WHERE nome = '30/60'),
    (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'),
    (SELECT id FROM funcionario WHERE email = 'comprador@exemplo.com'), 'PENDENTE', 'CIF', (SELECT id FROM transportadora WHERE cnpj = '98765432000155'),
    50.00, 0.00, 150.00, 0.00, 1500.00, 1400.00, 'SEGUNDA COMPRA - PRODUTO B'
);

INSERT INTO item_compra (
    compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id,
    codigo, produto_id, produto, unidade, quantidade, preco_un, desc_un, liquido_un, total, custo_final_un, custo_final, valor_unitario, valor_desconto, valor_total
) VALUES (
    '2', '55', '1', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    'P0002', 
    (SELECT id FROM produto WHERE codigo = 'P0002'), 
    'PRODUTO B', 
    'UN', 
    50.000, 
    30.00, 
    0.00, 
    30.00, 
    1500.00, 
    30.00, 
    1500.00, 
    30.00, 
    0.00, 
    1500.00
);

-- Terceira compra - Mesmo número 1, mas série diferente (demonstra unicidade da chave composta)
INSERT INTO compra (
    numero_pedido, modelo, serie, fornecedor_id,
    data_emissao, data_chegada,
    condicao_pagamento_id, forma_pagamento_id, funcionario_id, status, tipo_frete, transportadora_id,
    valor_frete, valor_seguro, valor_desconto, valor_acrescimo, total_produtos, total_a_pagar, observacoes
) VALUES (
    '1', '55', '2', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '25 days',
    (SELECT id FROM condicao_pagamento WHERE nome = 'À VISTA'),
    (SELECT id FROM forma_pagamento WHERE nome = 'PIX'),
    (SELECT id FROM funcionario WHERE email = 'comprador@exemplo.com'), 'APROVADO', 'FOB', (SELECT id FROM transportadora WHERE cnpj = '98765432000155'),
    0.00, 0.00, 0.00, 0.00, 800.00, 800.00, 'TERCEIRA COMPRA - MESMA NUMERAÇÃO MAS SÉRIE DIFERENTE'
);

INSERT INTO item_compra (
    compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id,
    codigo, produto_id, produto, unidade, quantidade, preco_un, desc_un, liquido_un, total, custo_final_un, custo_final, valor_unitario, valor_desconto, valor_total
) VALUES (
    '1', '55', '2', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    'P0001', 
    (SELECT id FROM produto WHERE codigo = 'P0001'), 
    'PRODUTO A', 
    'UN', 
    16.000, 
    50.00, 
    0.00, 
    50.00, 
    800.00, 
    50.00, 
    800.00, 
    50.00, 
    0.00, 
    800.00
);

-- Parcelas das compras
INSERT INTO parcela_compra (
    compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id,
    parcela, codigo_forma_pagto, forma_pagamento_id, forma_pagamento, data_vencimento, valor_parcela, status
) VALUES (
    '1', '55', '1', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    1, 'BOL', (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'), 'BOLETO BANCÁRIO', 
    CURRENT_DATE + INTERVAL '30 days', 5100.00, 'PENDENTE'
);

INSERT INTO parcela_compra (
    compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id,
    parcela, codigo_forma_pagto, forma_pagamento_id, forma_pagamento, data_vencimento, valor_parcela, status
) VALUES (
    '2', '55', '1', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    1, 'BOL', (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'), 'BOLETO BANCÁRIO', 
    CURRENT_DATE + INTERVAL '30 days', 700.00, 'PENDENTE'
),
(
    '2', '55', '1', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    2, 'BOL', (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'), 'BOLETO BANCÁRIO', 
    CURRENT_DATE + INTERVAL '60 days', 700.00, 'PENDENTE'
);

INSERT INTO parcela_compra (
    compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id,
    parcela, codigo_forma_pagto, forma_pagamento_id, forma_pagamento, data_vencimento, valor_parcela, status
) VALUES (
    '1', '55', '2', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    1, 'PIX', (SELECT id FROM forma_pagamento WHERE nome = 'PIX'), 'PIX', 
    CURRENT_DATE + INTERVAL '20 days', 800.00, 'PENDENTE'
);

-- =====================================================
-- VENDAS
-- =====================================================

INSERT INTO venda (
    numero_pedido, cliente_id, vendedor_id, data_pedido, data_entrega_prevista,
    condicao_pagamento_id, forma_pagamento_id, status, tipo_venda, tipo_frete,
    transportadora_id, endereco_entrega, valor_frete, valor_produtos, valor_total, observacoes
) VALUES (
    '1',
    (SELECT id FROM cliente WHERE cnpj_cpf = '45987654000100'),
    (SELECT id FROM funcionario WHERE email = 'vendedor@exemplo.com'),
    CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days',
    (SELECT id FROM condicao_pagamento WHERE nome = 'À VISTA'), (SELECT id FROM forma_pagamento WHERE nome = 'PIX'), 'FATURADO', 'VENDA', 'CIF',
    (SELECT id FROM transportadora WHERE cnpj = '98765432000155'), 'AV. CENTRAL, 200 - CENTRO - SÃO PAULO/SP', 50.00, 800.00, 850.00, 'VENDA INICIAL'
);

INSERT INTO item_venda (
    venda_id, produto_id, quantidade, valor_unitario, valor_total
) VALUES (
    (SELECT id FROM venda WHERE numero_pedido = '1'), (SELECT id FROM produto WHERE codigo = 'P0001'), 10.000, 80.00, 800.00
);

INSERT INTO entrega_venda (
    venda_id, numero_entrega, data_entrega, funcionario_responsavel_id, transportadora_id, veiculo_id,
    endereco_entrega, valor_total_entregue, status, data_saida
) VALUES (
    (SELECT id FROM venda WHERE numero_pedido = '1'), '1', CURRENT_DATE + INTERVAL '3 days', (SELECT id FROM funcionario WHERE email = 'vendedor@exemplo.com'),
    (SELECT id FROM transportadora WHERE cnpj = '98765432000155'), (SELECT id FROM veiculo WHERE placa = 'ABC1D23'),
    'AV. CENTRAL, 200 - CENTRO - SÃO PAULO/SP', 800.00, 'TRANSPORTE', CURRENT_TIMESTAMP
);

INSERT INTO item_entrega_venda (
    entrega_id, item_venda_id, quantidade_entregue, valor_unitario_entregue, lote
) VALUES (
    (SELECT id FROM entrega_venda WHERE numero_entrega = '1'), (SELECT id FROM item_venda LIMIT 1), 10.000, 80.00, 'Lote-001'
);

-- =====================================================
-- NF-E, ITENS E FATURAMENTO
-- =====================================================

-- Nota Fiscal vinculada à venda
INSERT INTO nfe (
    chave_acesso, numero, serie, data_emissao, natureza_operacao, valor_produtos, valor_total, cnpj_emitente, cnpj_destinatario,
    condicao_pagamento_id, cliente_id, forma_pagamento_id, transportadora_id, veiculo_id, modalidade_id, frete_por_conta
) VALUES (
    '11111111111111111111111111111111111111111111', '1', '001', CURRENT_DATE, 'VENDA DE MERCADORIA', 800.00, 850.00,
    '12345678000190', '45987654000100',
    (SELECT id FROM condicao_pagamento WHERE nome = 'À VISTA'),
    (SELECT id FROM cliente WHERE cnpj_cpf = '45987654000100'),
    (SELECT id FROM forma_pagamento WHERE nome = 'PIX'),
    (SELECT id FROM transportadora WHERE cnpj = '98765432000155'),
    (SELECT id FROM veiculo WHERE placa = 'ABC1D23'),
    (SELECT id FROM modalidade_nfe WHERE codigo = '55'),
    '0'
);

INSERT INTO itemnfe (
    chave_acesso_nfe, codigo_produto, cfop, quantidade, valor_unitario, valor_total, ordem
) VALUES (
    '11111111111111111111111111111111111111111111', 'P0001', '5102', 10.000, 80.00, 800.00, 1
);

INSERT INTO item_nfe (
    nfe_id, produto_id, quantidade, valor_unitario, valor_total
) VALUES (
    (SELECT id FROM nfe WHERE chave_acesso = '11111111111111111111111111111111111111111111'),
    (SELECT id FROM produto WHERE codigo = 'P0001'), 10.000, 80.00, 800.00
);

INSERT INTO fatura (chave_acesso_nfe, numero, valor_total)
VALUES ('11111111111111111111111111111111111111111111', 'FAT-0001', 850.00);

INSERT INTO parcela (fatura_id, forma_pagamento_id, numero, data_vencimento, valor, status)
VALUES 
    ((SELECT id FROM fatura WHERE numero = 'FAT-0001'), (SELECT id FROM forma_pagamento WHERE nome = 'PIX'), 1, CURRENT_DATE, 850.00, 'A');

INSERT INTO volume (
    chave_acesso_nfe, quantidade, especie, marca, numeracao, peso_bruto, peso_liquido
) VALUES (
    '11111111111111111111111111111111111111111111', 1.000, 'CAIXA', 'TRANS-MODELO', '001', 6.000, 5.500
);

INSERT INTO movimentacao_nfe (nfe_id, data_movimentacao, status, descricao)
VALUES ((SELECT id FROM nfe WHERE chave_acesso = '11111111111111111111111111111111111111111111'), CURRENT_TIMESTAMP, 'AUTORIZADA', 'NF-E AUTORIZADA PELA SEFAZ');

-- =====================================================
-- ESTOQUE
-- =====================================================

-- Entrada de estoque da compra
-- Nota: documento_origem_id pode ser NULL pois compra não tem id simples (chave composta)
INSERT INTO estoque_movimento (
    produto_id, tipo_movimento, origem, documento_origem_id, numero_documento, data_movimento, funcionario_id,
    quantidade_anterior, quantidade_movimento, quantidade_atual, valor_unitario, valor_total, lote
) VALUES (
    (SELECT id FROM produto WHERE codigo = 'P0001'), 'ENTRADA', 'COMPRA', NULL, '1-55-1', CURRENT_DATE + INTERVAL '6 days',
    (SELECT id FROM funcionario WHERE email = 'comprador@exemplo.com'),
    0.000, 100.000, 100.000, 50.00, 5000.00, 'Lote-001'
);

-- Saída de estoque da venda
INSERT INTO estoque_movimento (
    produto_id, tipo_movimento, origem, documento_origem_id, numero_documento, data_movimento, funcionario_id,
    quantidade_anterior, quantidade_movimento, quantidade_atual, valor_unitario, valor_total, lote
) VALUES (
    (SELECT id FROM produto WHERE codigo = 'P0001'), 'SAIDA', 'VENDA', (SELECT id FROM venda WHERE numero_pedido = '1'), '1', CURRENT_DATE + INTERVAL '3 days',
    (SELECT id FROM funcionario WHERE email = 'vendedor@exemplo.com'),
    100.000, -10.000, 90.000, 80.00, 800.00, 'Lote-001'
);

-- =====================================================
-- FINANCEIRO
-- =====================================================

INSERT INTO contas_pagar (
    compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id,
    fornecedor_id, numero_documento, tipo_documento, data_emissao, data_vencimento,
    valor_original, valor_saldo, forma_pagamento_id, status, observacoes
) VALUES (
    '1', '55', '1', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'), 'DUP-0001', 'DUPLICATA', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
    5100.00, 5100.00, (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'), 'ABERTO', 'A PAGAR DA COMPRA 1 SÉRIE 1'
);

INSERT INTO contas_pagar (
    compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id,
    fornecedor_id, numero_documento, tipo_documento, data_emissao, data_vencimento,
    valor_original, valor_saldo, forma_pagamento_id, status, observacoes
) VALUES (
    '2', '55', '1', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'), 'DUP-0002', 'DUPLICATA', CURRENT_DATE + INTERVAL '10 days', CURRENT_DATE + INTERVAL '40 days',
    1400.00, 1400.00, (SELECT id FROM forma_pagamento WHERE nome = 'BOLETO BANCÁRIO'), 'ABERTO', 'A PAGAR DA COMPRA 2'
);

INSERT INTO contas_pagar (
    compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id,
    fornecedor_id, numero_documento, tipo_documento, data_emissao, data_vencimento,
    valor_original, valor_saldo, forma_pagamento_id, status, observacoes
) VALUES (
    '1', '55', '2', (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'),
    (SELECT id FROM fornecedor WHERE cnpj_cpf = '66777888000155'), 'DUP-0003', 'DUPLICATA', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '40 days',
    800.00, 800.00, (SELECT id FROM forma_pagamento WHERE nome = 'PIX'), 'ABERTO', 'A PAGAR DA COMPRA 1 SÉRIE 2'
);

INSERT INTO contas_receber (
    venda_id, cliente_id, numero_documento, tipo_documento, data_emissao, data_vencimento,
    valor_original, valor_saldo, forma_pagamento_id, status, observacoes
) VALUES (
    (SELECT id FROM venda WHERE numero_pedido = '1'), (SELECT id FROM cliente WHERE cnpj_cpf = '45987654000100'), 'REC-0001', 'DUPLICATA', CURRENT_DATE, CURRENT_DATE + INTERVAL '5 days',
    850.00, 850.00, (SELECT id FROM forma_pagamento WHERE nome = 'PIX'), 'ABERTO', 'A RECEBER DA VENDA 1'
);

-- =====================================================
-- ORÇAMENTO
-- =====================================================

INSERT INTO orcamento (
    numero_orcamento, cliente_id, vendedor_id, data_orcamento, data_validade, condicao_pagamento_id, status,
    valor_produtos, valor_desconto, percentual_desconto, valor_total, observacoes
) VALUES (
    '1', (SELECT id FROM cliente WHERE cnpj_cpf = '45987654000100'), (SELECT id FROM funcionario WHERE email = 'vendedor@exemplo.com'),
    CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', (SELECT id FROM condicao_pagamento WHERE nome = '30 DIAS'), 'ENVIADO',
    500.00, 0.00, 0.00, 500.00, 'ORÇAMENTO DE PRODUTO B'
);

INSERT INTO item_orcamento (
    orcamento_id, produto_id, quantidade, valor_unitario, valor_total
) VALUES (
    (SELECT id FROM orcamento WHERE numero_orcamento = '1'), (SELECT id FROM produto WHERE codigo = 'P0002'), 10.000, 50.00, 500.00
);

-- =====================================================
-- FINALIZAÇÃO
-- =====================================================

-- Comentários sobre os dados inseridos
COMMENT ON SCHEMA dbo IS 'Schema principal do sistema Serveon - Dados iniciais carregados';

-- Mensagem de confirmação
SELECT 'DADOS INICIAIS INSERIDOS COM SUCESSO!' AS status,
             (SELECT COUNT(*) FROM pais) AS paises,
             (SELECT COUNT(*) FROM estado) AS estados,
             (SELECT COUNT(*) FROM cidade) AS cidades,
             (SELECT COUNT(*) FROM forma_pagamento) AS formas_pagamento,
             (SELECT COUNT(*) FROM modalidade_nfe) AS modalidades_nfe,
             (SELECT COUNT(*) FROM condicao_pagamento) AS condicoes_pagamento,
             (SELECT COUNT(*) FROM parcela_condicao_pagamento) AS parcelas_configuradas,
             (SELECT COUNT(*) FROM unidade_medida) AS unidades_medida,
             (SELECT COUNT(*) FROM marca) AS marcas,
             (SELECT COUNT(*) FROM categoria) AS categorias,
             (SELECT COUNT(*) FROM departamento) AS departamentos,
             (SELECT COUNT(*) FROM cargo) AS cargos,
             (SELECT COUNT(*) FROM funcao_funcionario) AS funcoes_funcionario,
             (SELECT COUNT(*) FROM emitente) AS emitentes,
             (SELECT COUNT(*) FROM cliente) AS clientes,
             (SELECT COUNT(*) FROM destinatario) AS destinatarios,
             (SELECT COUNT(*) FROM cliente_destinatario) AS cliente_destinatario_rel,
             (SELECT COUNT(*) FROM transportadora) AS transportadoras,
             (SELECT COUNT(*) FROM transportador) AS transportadores,
             (SELECT COUNT(*) FROM veiculo) AS veiculos,
             (SELECT COUNT(*) FROM transportadora_emails) AS transportadora_emails,
             (SELECT COUNT(*) FROM transportadora_telefones) AS transportadora_telefones,
             (SELECT COUNT(*) FROM transportadora_veiculo) AS transportadora_veiculos,
             (SELECT COUNT(*) FROM transp_item) AS transp_itens,
             (SELECT COUNT(*) FROM fornecedor) AS fornecedores,
             (SELECT COUNT(*) FROM fornecedor_email) AS fornecedor_emails,
             (SELECT COUNT(*) FROM fornecedor_telefone) AS fornecedor_telefones,
             (SELECT COUNT(*) FROM produto) AS produtos,
             (SELECT COUNT(*) FROM produto_fornecedor) AS produto_fornecedor_rel,
             (SELECT COUNT(*) FROM funcionario) AS funcionarios,
             (SELECT COUNT(*) FROM compra) AS compras,
             (SELECT COUNT(*) FROM item_compra) AS itens_compra,
             (SELECT COUNT(*) FROM recebimento_compra) AS recebimentos_compra,
             (SELECT COUNT(*) FROM item_recebimento_compra) AS itens_recebimento_compra,
             (SELECT COUNT(*) FROM venda) AS vendas,
             (SELECT COUNT(*) FROM item_venda) AS itens_venda,
             (SELECT COUNT(*) FROM entrega_venda) AS entregas_venda,
             (SELECT COUNT(*) FROM item_entrega_venda) AS itens_entrega_venda,
             (SELECT COUNT(*) FROM nfe) AS nfes,
             (SELECT COUNT(*) FROM itemnfe) AS itens_nfe,
             (SELECT COUNT(*) FROM item_nfe) AS itens_nfe_alt,
             (SELECT COUNT(*) FROM fatura) AS faturas,
             (SELECT COUNT(*) FROM parcela) AS parcelas,
             (SELECT COUNT(*) FROM volume) AS volumes,
             (SELECT COUNT(*) FROM movimentacao_nfe) AS movimentacoes_nfe,
             (SELECT COUNT(*) FROM estoque_movimento) AS movimentos_estoque,
             (SELECT COUNT(*) FROM contas_pagar) AS contas_pagar,
             (SELECT COUNT(*) FROM contas_receber) AS contas_receber,
             (SELECT COUNT(*) FROM orcamento) AS orcamentos,
             (SELECT COUNT(*) FROM item_orcamento) AS itens_orcamento;

-- Confirma a transação
COMMIT;
