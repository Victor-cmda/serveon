import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Supplier } from '../entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    try {
      const client = await this.databaseService.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Verificar se fornecedor já existe
        const existingSupplier = await client.query(
          'SELECT id FROM dbo.fornecedor WHERE cnpj_cpf = $1',
          [createSupplierDto.cnpjCpf]
        );

        if (existingSupplier.rowCount > 0) {
          throw new ConflictException(`Fornecedor com CNPJ/CPF ${createSupplierDto.cnpjCpf} já existe`);
        }
          // Inserir o novo fornecedor (ID será gerado automaticamente)
        
        // Inserir o novo fornecedor
        const result = await client.query(
          `INSERT INTO dbo.fornecedor
            (cnpj_cpf, tipo, is_estrangeiro, tipo_documento, razao_social, 
            nome_fantasia, inscricao_estadual, inscricao_municipal, 
            endereco, numero, complemento, bairro, 
            cidade_id, cep, telefone, email, website, responsavel, 
            celular_responsavel, observacoes, condicao_pagamento_id, ativo)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
            $15, $16, $17, $18, $19, $20, $21, $22)
          RETURNING *`,          [
            createSupplierDto.cnpjCpf,
            createSupplierDto.tipo,
            createSupplierDto.isEstrangeiro || false,
            createSupplierDto.tipoDocumento,
            createSupplierDto.razaoSocial,
            createSupplierDto.nomeFantasia || null,
            createSupplierDto.inscricaoEstadual || null,
            createSupplierDto.inscricaoMunicipal || null,
            createSupplierDto.endereco || null,
            createSupplierDto.numero || null,
            createSupplierDto.complemento || null,
            createSupplierDto.bairro || null,
            createSupplierDto.cidadeId || null,
            createSupplierDto.cep || null,
            createSupplierDto.telefone || null,
            createSupplierDto.email || null,
            createSupplierDto.website || null,
            createSupplierDto.responsavel || null,
            createSupplierDto.celularResponsavel || null,
            createSupplierDto.observacoes || null,
            createSupplierDto.condicaoPagamentoId || null,
            true // ativo por padrão
          ]
        );

        // Buscar as informações adicionais do fornecedor (cidade, estado, país, condição de pagamento)
        const supplier = await this.enrichSupplierData(client, result.rows[0]);
        
        await client.query('COMMIT');
        return supplier;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      console.error('Erro ao criar fornecedor:', error);
      throw new InternalServerErrorException('Erro ao criar fornecedor');
    }
  }

  async findAll(): Promise<Supplier[]> {
    try {
      const client = await this.databaseService.getClient();
      try {
        const result = await client.query(`
          SELECT f.*, 
                 c.nome as cidade_nome, 
                 e.uf,
                 p.nome as pais_nome,
                 cp.nome as condicao_pagamento_nome
          FROM dbo.fornecedor f
          LEFT JOIN dbo.cidade c ON f.cidade_id = c.id
          LEFT JOIN dbo.estado e ON c.estado_id = e.id
          LEFT JOIN dbo.pais p ON e.pais_id = p.id
          LEFT JOIN dbo.condicao_pagamento cp ON f.condicao_pagamento_id = cp.id
          ORDER BY f.razao_social ASC
        `);
        
        return result.rows.map(row => this.mapRowToSupplier(row));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      throw new InternalServerErrorException('Erro ao buscar fornecedores');
    }
  }
  async findOne(id: number): Promise<Supplier> {
    try {
      const client = await this.databaseService.getClient();
      try {
        const result = await client.query(`
          SELECT f.*, 
                 c.nome as cidade_nome, 
                 e.uf,
                 p.nome as pais_nome,
                 cp.nome as condicao_pagamento_nome
          FROM dbo.fornecedor f
          LEFT JOIN dbo.cidade c ON f.cidade_id = c.id
          LEFT JOIN dbo.estado e ON c.estado_id = e.id
          LEFT JOIN dbo.pais p ON e.pais_id = p.id
          LEFT JOIN dbo.condicao_pagamento cp ON f.condicao_pagamento_id = cp.id
          WHERE f.id = $1
        `, [id]);
        
        if (result.rowCount === 0) {
          throw new NotFoundException(`Fornecedor com ID ${id} não encontrado`);
        }
        
        return this.mapRowToSupplier(result.rows[0]);
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.error(`Erro ao buscar fornecedor com ID ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar fornecedor com ID ${id}`);
    }
  }

  async findByDocument(cnpjCpf: string): Promise<Supplier> {
    try {
      const client = await this.databaseService.getClient();
      try {
        const result = await client.query(`
          SELECT f.*, 
                 c.nome as cidade_nome, 
                 e.uf,
                 p.nome as pais_nome,
                 cp.nome as condicao_pagamento_nome
          FROM dbo.fornecedor f
          LEFT JOIN dbo.cidade c ON f.cidade_id = c.id
          LEFT JOIN dbo.estado e ON c.estado_id = e.id
          LEFT JOIN dbo.pais p ON e.pais_id = p.id
          LEFT JOIN dbo.condicao_pagamento cp ON f.condicao_pagamento_id = cp.id
          WHERE f.cnpj_cpf = $1
        `, [cnpjCpf]);
        
        if (result.rowCount === 0) {
          throw new NotFoundException(`Fornecedor com documento ${cnpjCpf} não encontrado`);
        }
        
        return this.mapRowToSupplier(result.rows[0]);
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.error(`Erro ao buscar fornecedor com documento ${cnpjCpf}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar fornecedor com documento ${cnpjCpf}`);
    }
  }
  async update(id: number, updateSupplierDto: UpdateSupplierDto): Promise<Supplier> {
    try {
      const client = await this.databaseService.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Verificar se o fornecedor existe
        const existingSupplier = await client.query(
          'SELECT id FROM dbo.fornecedor WHERE id = $1',
          [id]
        );

        if (existingSupplier.rowCount === 0) {
          throw new NotFoundException(`Fornecedor com ID ${id} não encontrado`);
        }
        
        // Verificar se o CNPJ/CPF já está sendo usado por outro fornecedor
        if (updateSupplierDto.cnpjCpf) {
          const duplicateCheck = await client.query(
            'SELECT id FROM dbo.fornecedor WHERE cnpj_cpf = $1 AND id != $2',
            [updateSupplierDto.cnpjCpf, id]
          );
          
          if (duplicateCheck.rowCount > 0) {
            throw new ConflictException(`Outro fornecedor com CNPJ/CPF ${updateSupplierDto.cnpjCpf} já existe`);
          }
        }
        
        // Construir a consulta de atualização dinamicamente
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramCounter = 1;
        
        // Mapear campos do DTO para colunas SQL
        const fieldMappings = {
          cnpjCpf: 'cnpj_cpf',
          tipo: 'tipo',
          isEstrangeiro: 'is_estrangeiro',
          tipoDocumento: 'tipo_documento',
          razaoSocial: 'razao_social',
          nomeFantasia: 'nome_fantasia',
          inscricaoEstadual: 'inscricao_estadual',
          inscricaoMunicipal: 'inscricao_municipal',
          endereco: 'endereco',
          numero: 'numero',
          complemento: 'complemento',
          bairro: 'bairro',
          cidadeId: 'cidade_id',
          cep: 'cep',
          telefone: 'telefone',
          email: 'email',
          website: 'website',
          responsavel: 'responsavel',
          celularResponsavel: 'celular_responsavel',
          observacoes: 'observacoes',
          condicaoPagamentoId: 'condicao_pagamento_id',
          ativo: 'ativo'
        };
        
        // Adicionar campos a serem atualizados
        for (const [dtoField, dbField] of Object.entries(fieldMappings)) {
          if (dtoField in updateSupplierDto) {
            updateFields.push(`${dbField} = $${paramCounter}`);
            updateValues.push(updateSupplierDto[dtoField]);
            paramCounter++;
          }
        }
        
        // Sempre atualizar o campo updated_at
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        
        // Adicionar o ID como último parâmetro
        updateValues.push(id);
        
        // Executar a atualização
        const updateQuery = `
          UPDATE dbo.fornecedor
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCounter}
          RETURNING *
        `;
        
        const result = await client.query(updateQuery, updateValues);
        
        // Buscar as informações adicionais do fornecedor
        const updatedSupplier = await this.enrichSupplierData(client, result.rows[0]);
        
        await client.query('COMMIT');
        return updatedSupplier;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      
      console.error(`Erro ao atualizar fornecedor com ID ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao atualizar fornecedor com ID ${id}`);
    }
  }
  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Verificar se o fornecedor existe
        const existingSupplier = await client.query(
          'SELECT id FROM dbo.fornecedor WHERE id = $1',
          [id]
        );

        if (existingSupplier.rowCount === 0) {
          throw new NotFoundException(`Fornecedor com ID ${id} não encontrado`);
        }
        
        // Verificar se o fornecedor está sendo usado em pedidos ou outros registros
        // Note: Esta verificação pode precisar ser expandida conforme o sistema cresce
        
        // Remover o fornecedor
        await client.query('DELETE FROM dbo.fornecedor WHERE id = $1', [id]);
        
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.error(`Erro ao remover fornecedor com ID ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao remover fornecedor com ID ${id}`);
    }
  }

  // Método privado para enriquecer os dados do fornecedor com informações relacionadas
  private async enrichSupplierData(client: any, supplierData: any): Promise<Supplier> {
    // Se o fornecedor tem cidade, buscar informações da cidade, estado e país
    if (supplierData.cidade_id) {
      const locationResult = await client.query(`
        SELECT 
          c.nome as cidade_nome, 
          e.uf, 
          p.nome as pais_nome
        FROM dbo.cidade c
        LEFT JOIN dbo.estado e ON c.estado_id = e.id
        LEFT JOIN dbo.pais p ON e.pais_id = p.id
        WHERE c.id = $1
      `, [supplierData.cidade_id]);
      
      if (locationResult.rowCount > 0) {
        supplierData.cidade_nome = locationResult.rows[0].cidade_nome;
        supplierData.uf = locationResult.rows[0].uf;
        supplierData.pais_nome = locationResult.rows[0].pais_nome;
      }
    }
    
    // Se o fornecedor tem condição de pagamento, buscar informações da condição
    if (supplierData.condicao_pagamento_id) {
      const paymentResult = await client.query(`
        SELECT nome as condicao_pagamento_nome
        FROM dbo.condicao_pagamento
        WHERE id = $1
      `, [supplierData.condicao_pagamento_id]);
      
      if (paymentResult.rowCount > 0) {
        supplierData.condicao_pagamento_nome = paymentResult.rows[0].condicao_pagamento_nome;
      }
    }
    
    return this.mapRowToSupplier(supplierData);
  }
  
  // Método privado para mapear uma linha do banco para o objeto Supplier
  private mapRowToSupplier(row: any): Supplier {
    return {
      id: row.id,
      cnpjCpf: row.cnpj_cpf,
      tipo: row.tipo,
      isEstrangeiro: row.is_estrangeiro,
      tipoDocumento: row.tipo_documento,
      razaoSocial: row.razao_social,
      nomeFantasia: row.nome_fantasia,
      inscricaoEstadual: row.inscricao_estadual,
      inscricaoMunicipal: row.inscricao_municipal,
      paisId: row.pais_id,
      paisNome: row.pais_nome,
      estadoId: row.estado_id,
      endereco: row.endereco,
      numero: row.numero,
      complemento: row.complemento,
      bairro: row.bairro,
      cidadeId: row.cidade_id,
      cidadeNome: row.cidade_nome,
      uf: row.uf,
      cep: row.cep,
      telefone: row.telefone,
      email: row.email,
      ativo: row.ativo,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
      condicaoPagamentoId: row.condicao_pagamento_id,
      condicaoPagamentoNome: row.condicao_pagamento_nome,
      website: row.website,
      observacoes: row.observacoes,
      responsavel: row.responsavel,
      celularResponsavel: row.celular_responsavel
    };
  }
}
