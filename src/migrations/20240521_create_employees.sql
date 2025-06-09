CREATE TABLE dbo.funcionario (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    cargo VARCHAR(50) NOT NULL,
    departamento VARCHAR(50) NOT NULL,
    data_admissao DATE NOT NULL,
    data_demissao DATE,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_funcionario_cpf ON dbo.funcionario(cpf);
CREATE INDEX idx_funcionario_email ON dbo.funcionario(email);
CREATE INDEX idx_funcionario_cargo ON dbo.funcionario(cargo);
CREATE INDEX idx_funcionario_departamento ON dbo.funcionario(departamento);

CREATE TRIGGER update_funcionario_timestamp BEFORE
UPDATE ON dbo.funcionario FOR EACH ROW EXECUTE PROCEDURE dbo.update_timestamp();


COMMENT ON TABLE dbo.funcionario IS 'Cadastro de funcionários';
COMMENT ON COLUMN dbo.funcionario.id IS 'ID único do funcionário';
COMMENT ON COLUMN dbo.funcionario.nome IS 'Nome completo do funcionário';
COMMENT ON COLUMN dbo.funcionario.cpf IS 'CPF do funcionário (apenas números)';
COMMENT ON COLUMN dbo.funcionario.email IS 'Email profissional do funcionário';
COMMENT ON COLUMN dbo.funcionario.telefone IS 'Telefone de contato do funcionário';
COMMENT ON COLUMN dbo.funcionario.cargo IS 'Cargo do funcionário';
COMMENT ON COLUMN dbo.funcionario.departamento IS 'Departamento do funcionário';
COMMENT ON COLUMN dbo.funcionario.data_admissao IS 'Data de admissão do funcionário';
COMMENT ON COLUMN dbo.funcionario.data_demissao IS 'Data de demissão do funcionário (se aplicável)';
COMMENT ON COLUMN dbo.funcionario.ativo IS 'Indica se o funcionário está ativo';
COMMENT ON COLUMN dbo.funcionario.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN dbo.funcionario.updated_at IS 'Data da última atualização do registro';
