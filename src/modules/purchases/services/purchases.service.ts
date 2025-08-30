import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePurchaseDto } from '../dto/create-purchase.dto';
import { UpdatePurchaseDto } from '../dto/update-purchase.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Purchase } from '../entities/purchase.entity';

@Injectable()
export class PurchasesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Gerar número sequencial único
        const sequenceResult = await client.query(`
          SELECT COALESCE(MAX(CAST(numero_pedido AS INTEGER)), 0) + 1 as next_number
          FROM dbo.compra 
          WHERE numero_pedido ~ '^[0-9]+$'
        `);
        const numeroSequencial = sequenceResult.rows[0].next_number;

        // Inserir nova compra
        const result = await client.query(
          `INSERT INTO dbo.compra
            (numero_pedido, fornecedor_id, condicao_pagamento_id, funcionario_id, 
            data_pedido, data_entrega_prevista, valor_total, valor_desconto, 
            valor_produtos, status, transportadora_id, observacoes, ativo)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *`,
          [
            numeroSequencial.toString(),
            createPurchaseDto.fornecedorId,
            createPurchaseDto.condicaoPagamentoId,
            createPurchaseDto.funcionarioId,
            createPurchaseDto.dataCompra,
            createPurchaseDto.dataVencimento,
            createPurchaseDto.valorTotal,
            createPurchaseDto.valorDesconto || 0,
            createPurchaseDto.valorTotal - (createPurchaseDto.valorDesconto || 0),
            createPurchaseDto.status || 'PENDENTE',
            createPurchaseDto.transportadoraId || null,
            createPurchaseDto.observacoes || null,
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
      console.error('Erro ao criar compra:', error);
      throw new InternalServerErrorException('Erro ao criar compra');
    }
  }

  async findAll(): Promise<Purchase[]> {
    try {
      const result = await this.databaseService.query(`
        SELECT c.*, f.razao_social as fornecedor_nome, 
               cp.nome as condicao_pagamento_nome,
               func.nome as funcionario_nome,
               t.razao_social as transportadora_nome
        FROM dbo.compra c
        LEFT JOIN dbo.fornecedor f ON c.fornecedor_id = f.id
        LEFT JOIN dbo.condicao_pagamento cp ON c.condicao_pagamento_id = cp.id
        LEFT JOIN dbo.funcionario func ON c.funcionario_id = func.id
        LEFT JOIN dbo.transportadora t ON c.transportadora_id = t.id
        WHERE c.ativo = true
        ORDER BY c.created_at DESC
      `);

      return result.rows.map(row => this.mapToEntity(row));
    } catch (error) {
      console.error('Erro ao buscar compras:', error);
      throw new InternalServerErrorException('Erro ao buscar compras');
    }
  }

  async findOne(id: number): Promise<Purchase> {
    try {
      const result = await this.databaseService.query(
        `SELECT c.*, f.razao_social as fornecedor_nome, 
               cp.nome as condicao_pagamento_nome,
               func.nome as funcionario_nome,
               t.razao_social as transportadora_nome
        FROM dbo.compra c
        LEFT JOIN dbo.fornecedor f ON c.fornecedor_id = f.id
        LEFT JOIN dbo.condicao_pagamento cp ON c.condicao_pagamento_id = cp.id
        LEFT JOIN dbo.funcionario func ON c.funcionario_id = func.id
        LEFT JOIN dbo.transportadora t ON c.transportadora_id = t.id
        WHERE c.id = $1 AND c.ativo = true`,
        [id],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`Compra com ID ${id} não encontrada`);
      }

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar compra ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar compra`);
    }
  }

  async update(id: number, updatePurchaseDto: UpdatePurchaseDto): Promise<Purchase> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a compra existe
        const existsResult = await client.query(
          'SELECT id FROM dbo.compra WHERE id = $1 AND ativo = true',
          [id],
        );

        if (existsResult.rowCount === 0) {
          throw new NotFoundException(`Compra com ID ${id} não encontrada`);
        }

        // Construir query de atualização
        const updates: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (updatePurchaseDto.fornecedorId !== undefined) {
          updates.push(`fornecedor_id = $${paramCounter++}`);
          values.push(updatePurchaseDto.fornecedorId);
        }

        if (updatePurchaseDto.condicaoPagamentoId !== undefined) {
          updates.push(`condicao_pagamento_id = $${paramCounter++}`);
          values.push(updatePurchaseDto.condicaoPagamentoId);
        }

        if (updatePurchaseDto.funcionarioId !== undefined) {
          updates.push(`funcionario_id = $${paramCounter++}`);
          values.push(updatePurchaseDto.funcionarioId);
        }

        if (updatePurchaseDto.dataCompra !== undefined) {
          updates.push(`data_pedido = $${paramCounter++}`);
          values.push(updatePurchaseDto.dataCompra);
        }

        if (updatePurchaseDto.dataVencimento !== undefined) {
          updates.push(`data_entrega_prevista = $${paramCounter++}`);
          values.push(updatePurchaseDto.dataVencimento);
        }

        if (updatePurchaseDto.valorTotal !== undefined) {
          updates.push(`valor_total = $${paramCounter++}`);
          values.push(updatePurchaseDto.valorTotal);
          // Recalcular valor_produtos com base no valorTotal e valorDesconto
          const valorDesconto = updatePurchaseDto.valorDesconto || 0;
          updates.push(`valor_produtos = $${paramCounter++}`);
          values.push(updatePurchaseDto.valorTotal - valorDesconto);
        }

        if (updatePurchaseDto.valorDesconto !== undefined) {
          updates.push(`valor_desconto = $${paramCounter++}`);
          values.push(updatePurchaseDto.valorDesconto);
        }

        if (updatePurchaseDto.status !== undefined) {
          updates.push(`status = $${paramCounter++}`);
          values.push(updatePurchaseDto.status);
        }

        if (updatePurchaseDto.transportadoraId !== undefined) {
          updates.push(`transportadora_id = $${paramCounter++}`);
          values.push(updatePurchaseDto.transportadoraId);
        }

        if (updatePurchaseDto.observacoes !== undefined) {
          updates.push(`observacoes = $${paramCounter++}`);
          values.push(updatePurchaseDto.observacoes);
        }

        if (updates.length > 0) {
          values.push(id);
          const updateQuery = `
            UPDATE dbo.compra
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao atualizar compra ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao atualizar compra`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se existe
        const existsResult = await client.query(
          'SELECT id FROM dbo.compra WHERE id = $1 AND ativo = true',
          [id],
        );

        if (existsResult.rowCount === 0) {
          throw new NotFoundException(`Compra com ID ${id} não encontrada`);
        }

        // Verificar se há dependências (itens de compra, etc.)
        const hasItems = await client.query(
          'SELECT id FROM dbo.item_compra WHERE compra_id = $1 LIMIT 1',
          [id],
        );

        if (hasItems.rowCount > 0) {
          // Se há dependências, apenas inativa
          await client.query(
            'UPDATE dbo.compra SET ativo = false WHERE id = $1',
            [id],
          );
        } else {
          // Se não há dependências, remove
          await client.query('DELETE FROM dbo.compra WHERE id = $1', [id]);
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
      console.error(`Erro ao remover compra ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao remover compra`);
    }
  }

  private mapToEntity(dbRecord: any): Purchase {
    return {
      id: dbRecord.id,
      numeroSequencial: parseInt(dbRecord.numero_pedido),
      fornecedorId: dbRecord.fornecedor_id,
      condicaoPagamentoId: dbRecord.condicao_pagamento_id,
      funcionarioId: dbRecord.funcionario_id,
      dataCompra: dbRecord.data_pedido,
      dataVencimento: dbRecord.data_entrega_prevista,
      valorTotal: parseFloat(dbRecord.valor_total),
      valorDesconto: parseFloat(dbRecord.valor_desconto || 0),
      valorLiquido: parseFloat(dbRecord.valor_produtos || dbRecord.valor_total),
      status: dbRecord.status,
      transportadoraId: dbRecord.transportadora_id,
      observacoes: dbRecord.observacoes,
      ativo: dbRecord.ativo,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }
}
