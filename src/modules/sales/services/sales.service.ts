import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { UpdateSaleDto } from '../dto/update-sale.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Sale } from '../entities/sale.entity';

@Injectable()
export class SalesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Gerar número sequencial único
        const sequenceResult = await client.query(`
          SELECT COALESCE(MAX(CAST(numero_pedido AS INTEGER)), 0) + 1 as next_number
          FROM dbo.venda 
          WHERE numero_pedido ~ '^[0-9]+$'
        `);
        const numeroSequencial = sequenceResult.rows[0].next_number;

        // Inserir nova venda
        const result = await client.query(
          `INSERT INTO dbo.venda
            (numero_pedido, cliente_id, condicao_pagamento_id, vendedor_id, 
            data_pedido, data_entrega_prevista, valor_total, valor_desconto, 
            valor_produtos, status, transportadora_id, observacoes, ativo)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *`,
          [
            numeroSequencial.toString(),
            createSaleDto.clienteId,
            createSaleDto.condicaoPagamentoId,
            createSaleDto.funcionarioId,
            createSaleDto.dataVenda,
            createSaleDto.dataVencimento,
            createSaleDto.valorTotal,
            createSaleDto.valorDesconto || 0,
            createSaleDto.valorTotal - (createSaleDto.valorDesconto || 0),
            createSaleDto.status || 'ORCAMENTO',
            createSaleDto.transportadoraId || null,
            createSaleDto.observacoes || null,
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
      console.error('Erro ao criar venda:', error);
      throw new InternalServerErrorException('Erro ao criar venda');
    }
  }

  async findAll(): Promise<Sale[]> {
    try {
      const result = await this.databaseService.query(`
        SELECT v.*, c.razao_social as cliente_nome, 
               cp.nome as condicao_pagamento_nome,
               func.nome as funcionario_nome,
               t.razao_social as transportadora_nome
        FROM dbo.venda v
        LEFT JOIN dbo.cliente c ON v.cliente_id = c.id
        LEFT JOIN dbo.condicao_pagamento cp ON v.condicao_pagamento_id = cp.id
        LEFT JOIN dbo.funcionario func ON v.vendedor_id = func.id
        LEFT JOIN dbo.transportadora t ON v.transportadora_id = t.id
        WHERE v.ativo = true
        ORDER BY v.created_at DESC
      `);

      return result.rows.map(row => this.mapToEntity(row));
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw new InternalServerErrorException('Erro ao buscar vendas');
    }
  }

  async findOne(id: number): Promise<Sale> {
    try {
      const result = await this.databaseService.query(
        `SELECT v.*, c.razao_social as cliente_nome, 
               cp.nome as condicao_pagamento_nome,
               func.nome as funcionario_nome,
               t.razao_social as transportadora_nome
        FROM dbo.venda v
        LEFT JOIN dbo.cliente c ON v.cliente_id = c.id
        LEFT JOIN dbo.condicao_pagamento cp ON v.condicao_pagamento_id = cp.id
        LEFT JOIN dbo.funcionario func ON v.vendedor_id = func.id
        LEFT JOIN dbo.transportadora t ON v.transportadora_id = t.id
        WHERE v.id = $1 AND v.ativo = true`,
        [id],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`Venda com ID ${id} não encontrada`);
      }

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar venda ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar venda`);
    }
  }

  async update(id: number, updateSaleDto: UpdateSaleDto): Promise<Sale> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a venda existe
        const existsResult = await client.query(
          'SELECT id FROM dbo.venda WHERE id = $1 AND ativo = true',
          [id],
        );

        if (existsResult.rowCount === 0) {
          throw new NotFoundException(`Venda com ID ${id} não encontrada`);
        }

        // Construir query de atualização
        const updates: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (updateSaleDto.clienteId !== undefined) {
          updates.push(`cliente_id = $${paramCounter++}`);
          values.push(updateSaleDto.clienteId);
        }

        if (updateSaleDto.condicaoPagamentoId !== undefined) {
          updates.push(`condicao_pagamento_id = $${paramCounter++}`);
          values.push(updateSaleDto.condicaoPagamentoId);
        }

        if (updateSaleDto.funcionarioId !== undefined) {
          updates.push(`vendedor_id = $${paramCounter++}`);
          values.push(updateSaleDto.funcionarioId);
        }

        if (updateSaleDto.dataVenda !== undefined) {
          updates.push(`data_pedido = $${paramCounter++}`);
          values.push(updateSaleDto.dataVenda);
        }

        if (updateSaleDto.dataVencimento !== undefined) {
          updates.push(`data_entrega_prevista = $${paramCounter++}`);
          values.push(updateSaleDto.dataVencimento);
        }

        if (updateSaleDto.valorTotal !== undefined) {
          updates.push(`valor_total = $${paramCounter++}`);
          values.push(updateSaleDto.valorTotal);
          // Recalcular valor_produtos com base no valorTotal e valorDesconto
          const valorDesconto = updateSaleDto.valorDesconto || 0;
          updates.push(`valor_produtos = $${paramCounter++}`);
          values.push(updateSaleDto.valorTotal - valorDesconto);
        }

        if (updateSaleDto.valorDesconto !== undefined) {
          updates.push(`valor_desconto = $${paramCounter++}`);
          values.push(updateSaleDto.valorDesconto);
        }

        if (updateSaleDto.status !== undefined) {
          updates.push(`status = $${paramCounter++}`);
          values.push(updateSaleDto.status);
        }

        if (updateSaleDto.transportadoraId !== undefined) {
          updates.push(`transportadora_id = $${paramCounter++}`);
          values.push(updateSaleDto.transportadoraId);
        }

        if (updateSaleDto.observacoes !== undefined) {
          updates.push(`observacoes = $${paramCounter++}`);
          values.push(updateSaleDto.observacoes);
        }

        if (updates.length > 0) {
          values.push(id);
          const updateQuery = `
            UPDATE dbo.venda
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
      console.error(`Erro ao atualizar venda ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao atualizar venda`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se existe
        const existsResult = await client.query(
          'SELECT id FROM dbo.venda WHERE id = $1 AND ativo = true',
          [id],
        );

        if (existsResult.rowCount === 0) {
          throw new NotFoundException(`Venda com ID ${id} não encontrada`);
        }

        // Verificar se há dependências (itens de venda, etc.)
        const hasItems = await client.query(
          'SELECT id FROM dbo.item_venda WHERE venda_id = $1 LIMIT 1',
          [id],
        );

        if (hasItems.rowCount > 0) {
          // Se há dependências, apenas inativa
          await client.query(
            'UPDATE dbo.venda SET ativo = false WHERE id = $1',
            [id],
          );
        } else {
          // Se não há dependências, remove
          await client.query('DELETE FROM dbo.venda WHERE id = $1', [id]);
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
      console.error(`Erro ao remover venda ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao remover venda`);
    }
  }

  private mapToEntity(dbRecord: any): Sale {
    return {
      id: dbRecord.id,
      numeroSequencial: parseInt(dbRecord.numero_pedido),
      clienteId: dbRecord.cliente_id,
      condicaoPagamentoId: dbRecord.condicao_pagamento_id,
      funcionarioId: dbRecord.vendedor_id,
      dataVenda: dbRecord.data_pedido,
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
