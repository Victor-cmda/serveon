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
      // Validação: desconto não pode ser maior que o valor total
      if (createSaleDto.valorDesconto && createSaleDto.valorDesconto > createSaleDto.valorTotal) {
        throw new BadRequestException(
          'O desconto não pode ser maior que o valor total da venda',
        );
      }

      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Inserir nova venda
        const result = await client.query(
          `INSERT INTO dbo.venda
            (cliente_id, condicao_pagamento_id, vendedor_id, 
            data_pedido, data_entrega_prevista, valor_total, valor_desconto, 
            valor_produtos, status, transportadora_id, observacoes, ativo)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          RETURNING *`,
          [
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
      // Validação: se desconto for fornecido, verificar se não excede o valor total
      if (updateSaleDto.valorDesconto !== undefined && updateSaleDto.valorTotal !== undefined) {
        if (updateSaleDto.valorDesconto > updateSaleDto.valorTotal) {
          throw new BadRequestException(
            'O desconto não pode ser maior que o valor total da venda',
          );
        }
      }

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
      numeroPedido: dbRecord.numero_pedido,
      clienteId: dbRecord.cliente_id,
      vendedorId: dbRecord.vendedor_id,
      dataPedido: dbRecord.data_pedido,
      dataEntregaPrevista: dbRecord.data_entrega_prevista,
      dataEntregaRealizada: dbRecord.data_entrega_realizada,
      condicaoPagamentoId: dbRecord.condicao_pagamento_id,
      formaPagamentoId: dbRecord.forma_pagamento_id,
      status: dbRecord.status,
      tipoVenda: dbRecord.tipo_venda,
      tipoFrete: dbRecord.tipo_frete,
      transportadoraId: dbRecord.transportadora_id,
      enderecoEntrega: dbRecord.endereco_entrega,
      valorFrete: parseFloat(dbRecord.valor_frete || 0),
      valorSeguro: parseFloat(dbRecord.valor_seguro || 0),
      valorDesconto: parseFloat(dbRecord.valor_desconto || 0),
      percentualDesconto: parseFloat(dbRecord.percentual_desconto || 0),
      valorAcrescimo: parseFloat(dbRecord.valor_acrescimo || 0),
      valorProdutos: parseFloat(dbRecord.valor_produtos || 0),
      valorTotal: parseFloat(dbRecord.valor_total || 0),
      observacoes: dbRecord.observacoes,
      aprovadoPor: dbRecord.aprovado_por,
      dataAprovacao: dbRecord.data_aprovacao,
      nfeId: dbRecord.nfe_id,
      ativo: dbRecord.ativo,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }
}
