import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class CustomersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      const existingCustomer = await this.databaseService.query(
        'SELECT cnpj_cpf FROM dbo.destinatario WHERE cnpj_cpf = $1',
        [createCustomerDto.cnpjCpf]
      );

      if (existingCustomer.rowCount > 0) {
        throw new ConflictException(`Cliente com CNPJ/CPF ${createCustomerDto.cnpjCpf} já existe`);
      }

      const result = await this.databaseService.query(
        `INSERT INTO dbo.destinatario
          (cnpj_cpf, tipo, razao_social, nome_fantasia, inscricao_estadual, 
           inscricao_municipal, endereco, numero, complemento, bairro, 
           cidade_id, cep, telefone, email, ativo)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         RETURNING *`,
        [
          createCustomerDto.cnpjCpf,
          createCustomerDto.tipo,
          createCustomerDto.razaoSocial,
          createCustomerDto.nomeFantasia || null,
          createCustomerDto.inscricaoEstadual || null,
          createCustomerDto.inscricaoMunicipal || null,
          createCustomerDto.endereco || null,
          createCustomerDto.numero || null,
          createCustomerDto.complemento || null,
          createCustomerDto.bairro || null,
          createCustomerDto.cidadeId,
          createCustomerDto.cep || null,
          createCustomerDto.telefone || null,
          createCustomerDto.email || null,
          createCustomerDto.ativo
        ]
      );

      return this.mapToCustomerEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Erro ao criar cliente:', error);
      throw new InternalServerErrorException('Erro ao criar cliente');
    }
  }

  async findAll(): Promise<Customer[]> {
    try {
      const result = await this.databaseService.query(`
        SELECT d.*, c.nome as cidade_nome, e.nome as estado_nome, e.uf
        FROM dbo.destinatario d
        LEFT JOIN dbo.cidade c ON d.cidade_id = c.id
        LEFT JOIN dbo.estado e ON c.estado_id = e.id
        ORDER BY d.razao_social
      `);

      return result.rows.map(row => this.mapToCustomerEntity(row));
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      throw new InternalServerErrorException('Erro ao buscar clientes');
    }
  }

  async findOne(cnpjCpf: string): Promise<Customer> {
    try {
      const result = await this.databaseService.query(`
        SELECT d.*, c.nome as cidade_nome, e.nome as estado_nome, e.uf
        FROM dbo.destinatario d
        LEFT JOIN dbo.cidade c ON d.cidade_id = c.id
        LEFT JOIN dbo.estado e ON c.estado_id = e.id
        WHERE d.cnpj_cpf = $1
      `, [cnpjCpf]);

      if (result.rowCount === 0) {
        throw new NotFoundException(`Cliente com CNPJ/CPF ${cnpjCpf} não encontrado`);
      }

      return this.mapToCustomerEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar cliente ${cnpjCpf}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar cliente ${cnpjCpf}`);
    }
  }

  async update(cnpjCpf: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    try {
      const existingCustomer = await this.databaseService.query(
        'SELECT cnpj_cpf FROM dbo.destinatario WHERE cnpj_cpf = $1',
        [cnpjCpf]
      );

      if (existingCustomer.rowCount === 0) {
        throw new NotFoundException(`Cliente com CNPJ/CPF ${cnpjCpf} não encontrado`);
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      if (updateCustomerDto.tipo !== undefined) {
        updates.push(`tipo = $${paramCounter++}`);
        values.push(updateCustomerDto.tipo);
      }

      if (updateCustomerDto.razaoSocial !== undefined) {
        updates.push(`razao_social = $${paramCounter++}`);
        values.push(updateCustomerDto.razaoSocial);
      }

      if (updateCustomerDto.nomeFantasia !== undefined) {
        updates.push(`nome_fantasia = $${paramCounter++}`);
        values.push(updateCustomerDto.nomeFantasia);
      }

      if (updateCustomerDto.inscricaoEstadual !== undefined) {
        updates.push(`inscricao_estadual = $${paramCounter++}`);
        values.push(updateCustomerDto.inscricaoEstadual);
      }

      if (updateCustomerDto.inscricaoMunicipal !== undefined) {
        updates.push(`inscricao_municipal = $${paramCounter++}`);
        values.push(updateCustomerDto.inscricaoMunicipal);
      }

      if (updateCustomerDto.endereco !== undefined) {
        updates.push(`endereco = $${paramCounter++}`);
        values.push(updateCustomerDto.endereco);
      }

      if (updateCustomerDto.numero !== undefined) {
        updates.push(`numero = $${paramCounter++}`);
        values.push(updateCustomerDto.numero);
      }

      if (updateCustomerDto.complemento !== undefined) {
        updates.push(`complemento = $${paramCounter++}`);
        values.push(updateCustomerDto.complemento);
      }

      if (updateCustomerDto.bairro !== undefined) {
        updates.push(`bairro = $${paramCounter++}`);
        values.push(updateCustomerDto.bairro);
      }

      if (updateCustomerDto.cidadeId !== undefined) {
        updates.push(`cidade_id = $${paramCounter++}`);
        values.push(updateCustomerDto.cidadeId);
      }

      if (updateCustomerDto.cep !== undefined) {
        updates.push(`cep = $${paramCounter++}`);
        values.push(updateCustomerDto.cep);
      }

      if (updateCustomerDto.telefone !== undefined) {
        updates.push(`telefone = $${paramCounter++}`);
        values.push(updateCustomerDto.telefone);
      }

      if (updateCustomerDto.email !== undefined) {
        updates.push(`email = $${paramCounter++}`);
        values.push(updateCustomerDto.email);
      }

      if (updateCustomerDto.ativo !== undefined) {
        updates.push(`ativo = $${paramCounter++}`);
        values.push(updateCustomerDto.ativo);
      }

      // Se não houver campos para atualizar, retornar o cliente atual
      if (updates.length === 0) {
        return this.findOne(cnpjCpf);
      }

      // Adicionar o cnpj_cpf aos valores
      values.push(cnpjCpf);

      // Executar a consulta de atualização
      const updateQuery = `
        UPDATE dbo.destinatario
        SET ${updates.join(', ')}
        WHERE cnpj_cpf = $${paramCounter}
        RETURNING *
      `;

      const result = await this.databaseService.query(updateQuery, values);
      return this.mapToCustomerEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao atualizar cliente ${cnpjCpf}:`, error);
      throw new InternalServerErrorException(`Erro ao atualizar cliente ${cnpjCpf}`);
    }
  }

  async remove(cnpjCpf: string): Promise<void> {
    try {
      // Verificar se o cliente existe
      const existingCustomer = await this.databaseService.query(
        'SELECT cnpj_cpf FROM dbo.destinatario WHERE cnpj_cpf = $1',
        [cnpjCpf]
      );

      if (existingCustomer.rowCount === 0) {
        throw new NotFoundException(`Cliente com CNPJ/CPF ${cnpjCpf} não encontrado`);
      }

      // Verificar se o cliente está sendo referenciado em alguma nota fiscal
      const hasReferences = await this.databaseService.query(
        'SELECT chave_acesso FROM dbo.nfe WHERE cnpj_destinatario = $1 LIMIT 1',
        [cnpjCpf]
      );

      if (hasReferences.rowCount > 0) {
        // Em vez de excluir, marcamos como inativo
        await this.databaseService.query(
          'UPDATE dbo.destinatario SET ativo = false WHERE cnpj_cpf = $1',
          [cnpjCpf]
        );
      } else {
        // Se não há referências, podemos excluir
        await this.databaseService.query(
          'DELETE FROM dbo.destinatario WHERE cnpj_cpf = $1',
          [cnpjCpf]
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao remover cliente ${cnpjCpf}:`, error);
      throw new InternalServerErrorException(`Erro ao remover cliente ${cnpjCpf}`);
    }
  }

  private mapToCustomerEntity(dbRecord: any): Customer {
    const customer: Customer = {
      cnpjCpf: dbRecord.cnpj_cpf,
      tipo: dbRecord.tipo as 'F' | 'J',
      razaoSocial: dbRecord.razao_social,
      nomeFantasia: dbRecord.nome_fantasia,
      inscricaoEstadual: dbRecord.inscricao_estadual,
      inscricaoMunicipal: dbRecord.inscricao_municipal,
      endereco: dbRecord.endereco,
      numero: dbRecord.numero,
      complemento: dbRecord.complemento,
      bairro: dbRecord.bairro,
      cidadeId: dbRecord.cidade_id,
      cep: dbRecord.cep,
      telefone: dbRecord.telefone,
      email: dbRecord.email,
      ativo: dbRecord.ativo,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at
    };
    
    if (dbRecord.cidade_nome) customer.cidadeNome = dbRecord.cidade_nome;
    if (dbRecord.estado_nome) customer.estadoNome = dbRecord.estado_nome;
    if (dbRecord.uf) customer.uf = dbRecord.uf;
    
    return customer;
  }
}