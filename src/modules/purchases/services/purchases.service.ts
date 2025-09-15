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
import { PurchaseItem } from '../entities/purchase-item.entity';
import { PurchaseInstallment } from '../entities/purchase-installment.entity';

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

        // Calcular totais
        const totalProdutos =
          createPurchaseDto.itens?.reduce((total, item) => {
            const valorItem =
              (item.precoUN - (item.descUN || 0)) * item.quantidade;
            return total + valorItem;
          }, 0) || 0;

        const valorFrete = createPurchaseDto.valorFrete || 0;
        const valorSeguro = createPurchaseDto.valorSeguro || 0;
        const outrasDespesas = createPurchaseDto.outrasDespesas || 0;
        const valorDesconto = createPurchaseDto.valorDesconto || 0;

        const totalAPagar =
          totalProdutos +
          valorFrete +
          valorSeguro +
          outrasDespesas -
          valorDesconto;

        // Inserir nova compra
        const result = await client.query(
          `INSERT INTO dbo.compra
            (numero_pedido, modelo, serie, codigo_fornecedor, fornecedor_id, 
            data_emissao, data_chegada, condicao_pagamento_id, funcionario_id, 
            tipo_frete, valor_frete, valor_seguro, outras_despesas, 
            total_produtos, valor_desconto, total_a_pagar, status, 
            transportadora_id, observacoes, ativo)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
          RETURNING *`,
          [
            numeroSequencial.toString(),
            createPurchaseDto.modelo || null,
            createPurchaseDto.serie || null,
            createPurchaseDto.codigoFornecedor || null,
            createPurchaseDto.fornecedorId,
            createPurchaseDto.dataEmissao,
            createPurchaseDto.dataChegada,
            createPurchaseDto.condicaoPagamentoId,
            createPurchaseDto.funcionarioId,
            createPurchaseDto.tipoFrete || 'CIF',
            valorFrete,
            valorSeguro,
            outrasDespesas,
            totalProdutos,
            valorDesconto,
            totalAPagar,
            createPurchaseDto.status || 'PENDENTE',
            createPurchaseDto.transportadoraId || null,
            createPurchaseDto.observacoes || null,
            true,
          ],
        );

        const compraId = result.rows[0].id;

        // Inserir itens da compra
        if (createPurchaseDto.itens && createPurchaseDto.itens.length > 0) {
          for (const item of createPurchaseDto.itens) {
            const liquidoUN = item.precoUN - (item.descUN || 0);
            const total = liquidoUN * item.quantidade;
            const rateio = item.rateio || 0;
            const custoFinalUN = liquidoUN + rateio / item.quantidade;
            const custoFinal = custoFinalUN * item.quantidade;

            await client.query(
              `INSERT INTO dbo.item_compra 
                (compra_id, codigo, produto_id, produto, unidade, quantidade, 
                preco_un, desc_un, liquido_un, total, rateio, custo_final_un, custo_final)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
              [
                compraId,
                item.codigo,
                item.produtoId,
                item.produto,
                item.unidade,
                item.quantidade,
                item.precoUN,
                item.descUN || 0,
                liquidoUN,
                total,
                rateio,
                custoFinalUN,
                custoFinal,
              ],
            );
          }
        }

        // Inserir parcelas da compra
        if (
          createPurchaseDto.parcelas &&
          createPurchaseDto.parcelas.length > 0
        ) {
          for (const parcela of createPurchaseDto.parcelas) {
            await client.query(
              `INSERT INTO dbo.parcela_compra 
                (compra_id, parcela, codigo_forma_pagto, forma_pagamento_id, 
                forma_pagamento, data_vencimento, valor_parcela)
              VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                compraId,
                parcela.parcela,
                parcela.codigoFormaPagto,
                parcela.formaPagamentoId,
                parcela.formaPagamento,
                parcela.dataVencimento,
                parcela.valorParcela,
              ],
            );
          }
        }

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

      return result.rows.map((row) => this.mapToEntity(row));
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

  async update(
    id: number,
    updatePurchaseDto: UpdatePurchaseDto,
  ): Promise<Purchase> {
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

        if (updatePurchaseDto.modelo !== undefined) {
          updates.push(`modelo = $${paramCounter++}`);
          values.push(updatePurchaseDto.modelo);
        }

        if (updatePurchaseDto.serie !== undefined) {
          updates.push(`serie = $${paramCounter++}`);
          values.push(updatePurchaseDto.serie);
        }

        if (updatePurchaseDto.codigoFornecedor !== undefined) {
          updates.push(`codigo_fornecedor = $${paramCounter++}`);
          values.push(updatePurchaseDto.codigoFornecedor);
        }

        if (updatePurchaseDto.dataEmissao !== undefined) {
          updates.push(`data_emissao = $${paramCounter++}`);
          values.push(updatePurchaseDto.dataEmissao);
        }

        if (updatePurchaseDto.dataChegada !== undefined) {
          updates.push(`data_chegada = $${paramCounter++}`);
          values.push(updatePurchaseDto.dataChegada);
        }

        if (updatePurchaseDto.tipoFrete !== undefined) {
          updates.push(`tipo_frete = $${paramCounter++}`);
          values.push(updatePurchaseDto.tipoFrete);
        }

        if (updatePurchaseDto.valorFrete !== undefined) {
          updates.push(`valor_frete = $${paramCounter++}`);
          values.push(updatePurchaseDto.valorFrete);
        }

        if (updatePurchaseDto.valorSeguro !== undefined) {
          updates.push(`valor_seguro = $${paramCounter++}`);
          values.push(updatePurchaseDto.valorSeguro);
        }

        if (updatePurchaseDto.outrasDespesas !== undefined) {
          updates.push(`outras_despesas = $${paramCounter++}`);
          values.push(updatePurchaseDto.outrasDespesas);
        }

        if (updatePurchaseDto.valorDesconto !== undefined) {
          updates.push(`valor_desconto = $${paramCounter++}`);
          values.push(updatePurchaseDto.valorDesconto);
        }

        // Recalcular totais se necessário
        if (updatePurchaseDto.itens) {
          const totalProdutos = updatePurchaseDto.itens.reduce((total, item) => {
            const valorItem = (item.precoUN - (item.descUN || 0)) * item.quantidade;
            return total + valorItem;
          }, 0);
          
          const valorFrete = updatePurchaseDto.valorFrete || 0;
          const valorSeguro = updatePurchaseDto.valorSeguro || 0;
          const outrasDespesas = updatePurchaseDto.outrasDespesas || 0;
          const valorDesconto = updatePurchaseDto.valorDesconto || 0;
          const totalAPagar = totalProdutos + valorFrete + valorSeguro + outrasDespesas - valorDesconto;
          
          updates.push(`total_produtos = $${paramCounter++}`);
          values.push(totalProdutos);
          updates.push(`total_a_pagar = $${paramCounter++}`);
          values.push(totalAPagar);
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
      numeroSequencial: dbRecord.numero_pedido ? parseInt(dbRecord.numero_pedido) : null,
      modelo: dbRecord.modelo,
      serie: dbRecord.serie,
      codigoFornecedor: dbRecord.codigo_fornecedor,
      fornecedorId: dbRecord.fornecedor_id,
      dataEmissao: dbRecord.data_emissao,
      dataChegada: dbRecord.data_chegada,
      condicaoPagamentoId: dbRecord.condicao_pagamento_id,
      funcionarioId: dbRecord.funcionario_id,
      tipoFrete: dbRecord.tipo_frete,
      valorFrete: parseFloat(dbRecord.valor_frete || 0),
      valorSeguro: parseFloat(dbRecord.valor_seguro || 0),
      outrasDespesas: parseFloat(dbRecord.outras_despesas || 0),
      totalProdutos: parseFloat(dbRecord.total_produtos || 0),
      valorDesconto: parseFloat(dbRecord.valor_desconto || 0),
      totalAPagar: parseFloat(dbRecord.total_a_pagar || 0),
      status: dbRecord.status,
      transportadoraId: dbRecord.transportadora_id,
      observacoes: dbRecord.observacoes,
      ativo: dbRecord.ativo,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }
}
