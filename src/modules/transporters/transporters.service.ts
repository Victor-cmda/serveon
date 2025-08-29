import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { CreateTransporterDto } from './dto/create-transporter.dto';
import { UpdateTransporterDto } from './dto/update-transporter.dto';
import { DatabaseService } from '../../common/database/database.service';
import { Transporter } from './entities/transporter.entity';

@Injectable()
export class TransportersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createTransporterDto: CreateTransporterDto): Promise<Transporter> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se CNPJ já existe
        const existingResult = await client.query(
          'SELECT id FROM dbo.transportadora WHERE cnpj = $1',
          [createTransporterDto.cnpj],
        );

        if (existingResult.rowCount > 0) {
          throw new ConflictException(
            `Transportadora com CNPJ ${createTransporterDto.cnpj} já existe`,
          );
        }

        // Inserir nova transportadora
        const result = await client.query(
          `INSERT INTO dbo.transportadora
            (razao_social, nome_fantasia, cnpj, email, telefone, endereco, numero, 
            complemento, bairro, cidade_id, cep, tipo, rg_ie, condicao_pagamento_id, 
            observacao, ativo)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          RETURNING *`,
          [
            createTransporterDto.nome,
            createTransporterDto.nomeFantasia || null,
            createTransporterDto.cnpj,
            null, // email - não está no DTO
            null, // telefone - não está no DTO
            createTransporterDto.endereco || null,
            createTransporterDto.numero || null,
            createTransporterDto.complemento || null,
            createTransporterDto.bairro || null,
            createTransporterDto.cidadeId || null,
            createTransporterDto.cep || null,
            'J', // tipo sempre jurídica para transportadoras
            null, // rg_ie
            null, // condicao_pagamento_id
            createTransporterDto.observacoes || null,
            true,
          ],
        );

        await client.query('COMMIT');
        return this.mapToEntity(result.rows[0]);
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
      console.error('Erro ao criar transportadora:', error);
      throw new InternalServerErrorException('Erro ao criar transportadora');
    }
  }

  async findAll(): Promise<Transporter[]> {
    try {
      const result = await this.databaseService.query(`
        SELECT t.*, c.nome as cidade_nome, e.nome as estado_nome, e.uf
        FROM dbo.transportadora t
        LEFT JOIN dbo.cidade c ON t.cidade_id = c.id
        LEFT JOIN dbo.estado e ON c.estado_id = e.id
        WHERE t.ativo = true
        ORDER BY t.razao_social
      `);

      return result.rows.map(row => this.mapToEntity(row));
    } catch (error) {
      console.error('Erro ao buscar transportadoras:', error);
      throw new InternalServerErrorException('Erro ao buscar transportadoras');
    }
  }

  async findOne(id: number): Promise<Transporter> {
    try {
      const result = await this.databaseService.query(
        `SELECT t.*, c.nome as cidade_nome, e.nome as estado_nome, e.uf
        FROM dbo.transportadora t
        LEFT JOIN dbo.cidade c ON t.cidade_id = c.id
        LEFT JOIN dbo.estado e ON c.estado_id = e.id
        WHERE t.id = $1 AND t.ativo = true`,
        [id],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`Transportadora com ID ${id} não encontrada`);
      }

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar transportadora ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar transportadora`);
    }
  }

  async update(id: number, updateTransporterDto: UpdateTransporterDto): Promise<Transporter> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a transportadora existe
        const existsResult = await client.query(
          'SELECT id FROM dbo.transportadora WHERE id = $1 AND ativo = true',
          [id],
        );

        if (existsResult.rowCount === 0) {
          throw new NotFoundException(`Transportadora com ID ${id} não encontrada`);
        }

        // Construir query de atualização
        const updates: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (updateTransporterDto.nome !== undefined) {
          updates.push(`razao_social = $${paramCounter++}`);
          values.push(updateTransporterDto.nome);
        }

        if (updateTransporterDto.nomeFantasia !== undefined) {
          updates.push(`nome_fantasia = $${paramCounter++}`);
          values.push(updateTransporterDto.nomeFantasia);
        }

        if (updateTransporterDto.cnpj !== undefined) {
          // Verificar se o novo CNPJ já existe em outra transportadora
          const cnpjExists = await client.query(
            'SELECT id FROM dbo.transportadora WHERE cnpj = $1 AND id != $2',
            [updateTransporterDto.cnpj, id],
          );
          
          if (cnpjExists.rowCount > 0) {
            throw new ConflictException(
              `CNPJ ${updateTransporterDto.cnpj} já está sendo usado por outra transportadora`,
            );
          }

          updates.push(`cnpj = $${paramCounter++}`);
          values.push(updateTransporterDto.cnpj);
        }

        if (updateTransporterDto.endereco !== undefined) {
          updates.push(`endereco = $${paramCounter++}`);
          values.push(updateTransporterDto.endereco);
        }

        if (updateTransporterDto.numero !== undefined) {
          updates.push(`numero = $${paramCounter++}`);
          values.push(updateTransporterDto.numero);
        }

        if (updateTransporterDto.complemento !== undefined) {
          updates.push(`complemento = $${paramCounter++}`);
          values.push(updateTransporterDto.complemento);
        }

        if (updateTransporterDto.bairro !== undefined) {
          updates.push(`bairro = $${paramCounter++}`);
          values.push(updateTransporterDto.bairro);
        }

        if (updateTransporterDto.cidadeId !== undefined) {
          updates.push(`cidade_id = $${paramCounter++}`);
          values.push(updateTransporterDto.cidadeId);
        }

        if (updateTransporterDto.cep !== undefined) {
          updates.push(`cep = $${paramCounter++}`);
          values.push(updateTransporterDto.cep);
        }

        if (updateTransporterDto.website !== undefined) {
          // Adicionar website se não existir na tabela
          updates.push(`observacao = $${paramCounter++}`);
          values.push(`Website: ${updateTransporterDto.website}`);
        }

        if (updateTransporterDto.observacoes !== undefined) {
          updates.push(`observacao = $${paramCounter++}`);
          values.push(updateTransporterDto.observacoes);
        }

        if (updates.length > 0) {
          values.push(id);
          const updateQuery = `
            UPDATE dbo.transportadora
            SET ${updates.join(', ')}
            WHERE id = $${paramCounter}
          `;
          await client.query(updateQuery, values);
        }

        await client.query('COMMIT');
        return this.findOne(id);
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
      console.error(`Erro ao atualizar transportadora ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao atualizar transportadora`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se existe
        const existsResult = await client.query(
          'SELECT id FROM dbo.transportadora WHERE id = $1 AND ativo = true',
          [id],
        );

        if (existsResult.rowCount === 0) {
          throw new NotFoundException(`Transportadora com ID ${id} não encontrada`);
        }

        // Verificar se há dependências (NFes, vendas, compras, etc.)
        const hasReferences = await client.query(
          `SELECT COUNT(*) as count FROM (
            SELECT id FROM dbo.nfe WHERE transportadora_id = $1
            UNION ALL
            SELECT id FROM dbo.venda WHERE transportadora_id = $1
            UNION ALL
            SELECT id FROM dbo.compra WHERE transportadora_id = $1
          ) refs`,
          [id],
        );

        if (parseInt(hasReferences.rows[0].count) > 0) {
          // Se há dependências, apenas inativa
          await client.query(
            'UPDATE dbo.transportadora SET ativo = false WHERE id = $1',
            [id],
          );
        } else {
          // Se não há dependências, remove
          await client.query('DELETE FROM dbo.transportadora WHERE id = $1', [id]);
        }

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
      console.error(`Erro ao remover transportadora ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao remover transportadora`);
    }
  }

  private mapToEntity(dbRecord: any): Transporter {
    return {
      id: dbRecord.id,
      cnpj: dbRecord.cnpj,
      nome: dbRecord.razao_social,
      nomeFantasia: dbRecord.nome_fantasia,
      paisId: undefined, // Não disponível na tabela atual
      estadoId: undefined, // Pode ser inferido através da cidade
      cidadeId: dbRecord.cidade_id,
      endereco: dbRecord.endereco,
      numero: dbRecord.numero,
      complemento: dbRecord.complemento,
      bairro: dbRecord.bairro,
      cep: dbRecord.cep,
      website: undefined, // Não disponível na estrutura atual
      observacoes: dbRecord.observacao,
      ativo: dbRecord.ativo,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }
}
