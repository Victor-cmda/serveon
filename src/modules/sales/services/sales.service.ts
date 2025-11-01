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
import { SaleItem } from '../entities/sale-item.entity';
import { SaleInstallment } from '../entities/sale-installment.entity';

@Injectable()
export class SalesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createSaleDto: CreateSaleDto): Promise<Sale> {
    try {
      console.log('[DEBUG] Dados recebidos do frontend:', {
        numeroItens: createSaleDto.itens?.length || 0,
        primeiroItem: createSaleDto.itens?.[0],
        valorFrete: createSaleDto.valorFrete,
        outrasDespesas: createSaleDto.outrasDespesas,
      });

      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Se funcionarioId não foi fornecido, buscar o primeiro funcionário ativo
        let funcionarioId = createSaleDto.funcionarioId;
        if (!funcionarioId) {
          const funcionarioResult = await client.query(
            `SELECT id FROM dbo.funcionario WHERE ativo = true ORDER BY id LIMIT 1`
          );
          
          if (funcionarioResult.rows.length === 0) {
            throw new BadRequestException('Nenhum funcionário ativo encontrado no sistema');
          }
          
          funcionarioId = funcionarioResult.rows[0].id;
          console.log(`[CRIAÇÃO VENDA] Usando funcionário padrão ID: ${funcionarioId}`);
        }

        // Usar o número do pedido informado pelo usuário ou gerar um sequencial
        let numeroPedido: string;
        
        if (createSaleDto.numeroPedido && createSaleDto.numeroPedido.trim() !== '') {
          numeroPedido = createSaleDto.numeroPedido.trim();
          console.log('[DEBUG] Usando número do pedido informado pelo usuário:', numeroPedido);
        } else {
          const sequenceResult = await client.query(`
            SELECT COALESCE(MAX(CAST(numero_pedido AS INTEGER)), 0) + 1 as next_number
            FROM dbo.venda 
            WHERE numero_pedido ~ '^[0-9]+$'
          `);
          numeroPedido = sequenceResult.rows[0].next_number.toString();
          console.log('[DEBUG] Número do pedido gerado automaticamente:', numeroPedido);
        }

        // Calcular totais
        const totalProdutos =
          createSaleDto.itens?.reduce((total, item) => {
            return total + (item.total || 0);
          }, 0) || 0;

        const valorFrete = createSaleDto.valorFrete || 0;
        const valorSeguro = createSaleDto.valorSeguro || 0;
        const outrasDespesas = createSaleDto.outrasDespesas || 0;
        const valorDesconto = createSaleDto.valorDesconto || 0;

        console.log('[DEBUG] Cálculo de totais:', {
          totalProdutos,
          valorFrete,
          valorSeguro,
          outrasDespesas,
          valorDesconto,
          numeroItens: createSaleDto.itens?.length || 0,
        });

        const totalAPagar =
          totalProdutos +
          valorFrete +
          valorSeguro +
          outrasDespesas -
          valorDesconto;

        console.log('[DEBUG] Total a pagar calculado:', totalAPagar);

        // Inserir nova venda
        const result = await client.query(
          `INSERT INTO dbo.venda
            (numero_pedido, modelo, serie, codigo, cliente_id, 
            data_emissao, data_entrega, data_entrega_realizada,
            condicao_pagamento_id, forma_pagamento_id, funcionario_id, 
            tipo_frete, valor_frete, valor_seguro, outras_despesas, 
            valor_desconto, valor_acrescimo, total_produtos, total_a_pagar, 
            valor_produtos, valor_total, status, 
            transportadora_id, observacoes, aprovado_por, data_aprovacao, ativo)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
          RETURNING *`,
          [
            numeroPedido,
            createSaleDto.modelo,
            createSaleDto.serie,
            createSaleDto.numeroNota || null,
            createSaleDto.clienteId,
            createSaleDto.dataEmissao,
            createSaleDto.dataEntrega || null,
            createSaleDto.dataEntregaRealizada || null,
            createSaleDto.condicaoPagamentoId,
            createSaleDto.formaPagamentoId || null,
            funcionarioId,
            createSaleDto.tipoFrete || 'CIF',
            valorFrete,
            valorSeguro,
            outrasDespesas,
            valorDesconto,
            createSaleDto.valorAcrescimo || 0,
            totalProdutos,
            totalAPagar,
            totalProdutos, // valor_produtos (compatibilidade)
            totalAPagar,   // valor_total (compatibilidade)
            createSaleDto.status || 'PENDENTE',
            createSaleDto.transportadoraId || null,
            createSaleDto.observacoes || null,
            createSaleDto.aprovadoPor || null,
            createSaleDto.dataAprovacao || null,
            true,
          ],
        );

        const vendaId = result.rows[0].id;

        // Inserir itens da venda
        if (createSaleDto.itens && createSaleDto.itens.length > 0) {
          console.log(`[DEBUG] Inserindo ${createSaleDto.itens.length} itens da venda`);
          
          for (const item of createSaleDto.itens) {
            console.log(`[DEBUG] Processando item produtoId: ${item.produtoId}`);
            
            // Validação: desconto não pode ser maior que o valor total do item
            const valorTotalItem = item.precoUn * item.quantidade;
            const descontoTotal = (item.descUn || 0) * item.quantidade;
            
            if (descontoTotal > valorTotalItem) {
              throw new BadRequestException(
                `Desconto do item não pode ser maior que o valor total do item`,
              );
            }

            // Buscar informações do produto
            const produtoResult = await client.query(
              'SELECT codigo, produto, unidade FROM dbo.produto WHERE id = $1',
              [item.produtoId]
            );

            if (produtoResult.rowCount === 0) {
              throw new BadRequestException(
                `Produto com ID ${item.produtoId} não encontrado`,
              );
            }

            const produto = produtoResult.rows[0];

            const liquidoUn = item.liquidoUn || (item.precoUn - (item.descUn || 0));
            const total = item.total || (liquidoUn * item.quantidade);
            const rateio = item.rateio || 0;
            const custoFinalUn = item.custoFinalUn || (liquidoUn + rateio / item.quantidade);
            const custoFinal = item.custoFinal || (custoFinalUn * item.quantidade);
            
            // Campos de compatibilidade com NFe
            const valorUnitario = item.precoUn;
            const valorDesconto = (item.descUn || 0) * item.quantidade;
            const valorTotal = total;
            const quantidadeEntregue = item.quantidadeEntregue || 0;

            console.log(`[DEBUG] Inserindo item com dados:`, {
              numeroPedido: numeroPedido,
              modelo: createSaleDto.modelo,
              serie: createSaleDto.serie,
              clienteId: createSaleDto.clienteId,
              codigo: produto.codigo || item.produtoId.toString(),
              produtoId: item.produtoId,
              produto: produto.produto,
              unidade: produto.unidade || 'UN',
              quantidade: item.quantidade,
            });

            await client.query(
              `INSERT INTO dbo.item_venda 
                (venda_numero_pedido, venda_modelo, venda_serie, venda_cliente_id, 
                codigo, produto_id, produto, unidade, quantidade, preco_un, desc_un, 
                liquido_un, total, rateio, custo_final_un, custo_final,
                valor_unitario, valor_desconto, valor_total, quantidade_entregue, 
                data_entrega_item, observacoes)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
              [
                numeroPedido,
                createSaleDto.modelo,
                createSaleDto.serie,
                createSaleDto.clienteId,
                produto.codigo || item.produtoId.toString(),
                item.produtoId,
                produto.produto,
                produto.unidade || 'UN',
                item.quantidade,
                item.precoUn,
                item.descUn || 0,
                liquidoUn,
                total,
                rateio,
                custoFinalUn,
                custoFinal,
                valorUnitario,
                valorDesconto,
                valorTotal,
                quantidadeEntregue,
                item.dataEntregaItem || null,
                item.observacoes || null,
              ],
            );
            
            console.log(`[DEBUG] Item inserido com sucesso!`);
          }
          
          console.log(`[DEBUG] Todos os itens foram inseridos!`);
        } else {
          console.log(`[DEBUG] Nenhum item para inserir`);
        }

        // Inserir parcelas da venda
        if (
          createSaleDto.parcelas &&
          createSaleDto.parcelas.length > 0
        ) {
          for (const parcela of createSaleDto.parcelas) {
            // Buscar informações da forma de pagamento
            const formaPagtoResult = await client.query(
              'SELECT nome FROM dbo.forma_pagamento WHERE id = $1',
              [parcela.formaPagamentoId]
            );

            if (formaPagtoResult.rowCount === 0) {
              throw new BadRequestException(
                `Forma de pagamento com ID ${parcela.formaPagamentoId} não encontrada`,
              );
            }

            const formaPagto = formaPagtoResult.rows[0];

            await client.query(
              `INSERT INTO dbo.parcela_venda 
                (venda_numero_pedido, venda_modelo, venda_serie, venda_cliente_id, 
                parcela, codigo_forma_pagto, forma_pagamento_id, forma_pagamento, 
                data_vencimento, valor_parcela)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
              [
                numeroPedido,
                createSaleDto.modelo,
                createSaleDto.serie,
                createSaleDto.clienteId,
                parcela.parcela,
                parcela.codigoFormaPagto || parcela.formaPagamentoId.toString(),
                parcela.formaPagamentoId,
                formaPagto.nome,
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
        LEFT JOIN dbo.funcionario func ON v.funcionario_id = func.id
        LEFT JOIN dbo.transportadora t ON v.transportadora_id = t.id
        WHERE v.ativo = true
        ORDER BY v.created_at DESC
      `);

      // Para cada venda, buscar os itens e parcelas
      const vendasComDetalhes = await Promise.all(
        result.rows.map(async (row) => {
          const venda = this.mapToEntity(row);

          // Buscar itens da venda
          const itensResult = await this.databaseService.query(
            `SELECT * FROM dbo.item_venda 
             WHERE venda_numero_pedido = $1 
               AND venda_modelo = $2 
               AND venda_serie = $3 
               AND venda_cliente_id = $4
             ORDER BY id`,
            [row.numero_pedido, row.modelo, row.serie, row.cliente_id],
          );

          // Buscar parcelas da venda
          const parcelasResult = await this.databaseService.query(
            `SELECT * FROM dbo.parcela_venda 
             WHERE venda_numero_pedido = $1 
               AND venda_modelo = $2 
               AND venda_serie = $3 
               AND venda_cliente_id = $4
             ORDER BY parcela`,
            [row.numero_pedido, row.modelo, row.serie, row.cliente_id],
          );

          // Adicionar itens e parcelas à venda
          return {
            ...venda,
            itens: itensResult.rows,
            parcelas: parcelasResult.rows,
          };
        })
      );

      return vendasComDetalhes;
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
        LEFT JOIN dbo.funcionario func ON v.funcionario_id = func.id
        LEFT JOIN dbo.transportadora t ON v.transportadora_id = t.id
        WHERE v.numero_sequencial = $1 AND v.ativo = true`,
        [id],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`Venda com ID ${id} não encontrada`);
      }

      console.log('[DEBUG] Venda encontrada:', {
        transportadoraId: result.rows[0].transportadora_id,
        transportadoraNome: result.rows[0].transportadora_nome,
      });

      const venda = this.mapToEntity(result.rows[0]);

      // Buscar itens da venda
      const itensResult = await this.databaseService.query(
        `SELECT * FROM dbo.item_venda 
         WHERE venda_numero_pedido = $1 
           AND venda_modelo = $2 
           AND venda_serie = $3 
           AND venda_cliente_id = $4
         ORDER BY id`,
        [result.rows[0].numero_pedido, result.rows[0].modelo, result.rows[0].serie, result.rows[0].cliente_id],
      );

      // Buscar parcelas da venda
      const parcelasResult = await this.databaseService.query(
        `SELECT * FROM dbo.parcela_venda 
         WHERE venda_numero_pedido = $1 
           AND venda_modelo = $2 
           AND venda_serie = $3 
           AND venda_cliente_id = $4
         ORDER BY parcela`,
        [result.rows[0].numero_pedido, result.rows[0].modelo, result.rows[0].serie, result.rows[0].cliente_id],
      );

      return venda;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar venda ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar venda`);
    }
  }

  async update(
    id: number,
    updateSaleDto: UpdateSaleDto,
  ): Promise<Sale> {
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
          updates.push(`funcionario_id = $${paramCounter++}`);
          values.push(updateSaleDto.funcionarioId);
        }

        if (updateSaleDto.modelo !== undefined) {
          updates.push(`modelo = $${paramCounter++}`);
          values.push(updateSaleDto.modelo);
        }

        if (updateSaleDto.serie !== undefined) {
          updates.push(`serie = $${paramCounter++}`);
          values.push(updateSaleDto.serie);
        }

        if (updateSaleDto.dataEmissao !== undefined) {
          updates.push(`data_emissao = $${paramCounter++}`);
          values.push(updateSaleDto.dataEmissao);
        }

        if (updateSaleDto.dataEntrega !== undefined) {
          updates.push(`data_entrega = $${paramCounter++}`);
          values.push(updateSaleDto.dataEntrega);
        }

        if (updateSaleDto.tipoFrete !== undefined) {
          updates.push(`tipo_frete = $${paramCounter++}`);
          values.push(updateSaleDto.tipoFrete);
        }

        if (updateSaleDto.valorFrete !== undefined) {
          updates.push(`valor_frete = $${paramCounter++}`);
          values.push(updateSaleDto.valorFrete);
        }

        if (updateSaleDto.valorSeguro !== undefined) {
          updates.push(`valor_seguro = $${paramCounter++}`);
          values.push(updateSaleDto.valorSeguro);
        }

        if (updateSaleDto.outrasDespesas !== undefined) {
          updates.push(`outras_despesas = $${paramCounter++}`);
          values.push(updateSaleDto.outrasDespesas);
        }

        if (updateSaleDto.valorDesconto !== undefined) {
          updates.push(`valor_desconto = $${paramCounter++}`);
          values.push(updateSaleDto.valorDesconto);
        }

        // Recalcular totais se necessário
        if (updateSaleDto.itens) {
          const totalProdutos = updateSaleDto.itens.reduce((total, item) => {
            const valorItem = (item.precoUn - (item.descUn || 0)) * item.quantidade;
            return total + valorItem;
          }, 0);
          
          const valorFrete = updateSaleDto.valorFrete || 0;
          const valorSeguro = updateSaleDto.valorSeguro || 0;
          const outrasDespesas = updateSaleDto.outrasDespesas || 0;
          const valorDesconto = updateSaleDto.valorDesconto || 0;
          const totalAPagar = totalProdutos + valorFrete + valorSeguro + outrasDespesas - valorDesconto;
          
          updates.push(`total_produtos = $${paramCounter++}`);
          values.push(totalProdutos);
          updates.push(`total_a_pagar = $${paramCounter++}`);
          values.push(totalAPagar);
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

  async checkCompositeKeyExists(
    numeroPedido: string,
    modelo: string,
    serie: string,
    clienteId: string,
  ): Promise<boolean> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(
          `SELECT 1 FROM dbo.venda 
           WHERE numero_pedido = $1 
           AND modelo = $2 
           AND serie = $3 
           AND cliente_id = $4 
           AND ativo = true
           LIMIT 1`,
          [numeroPedido, modelo, serie, parseInt(clienteId)],
        );

        return result.rowCount > 0;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao verificar chave composta:', error);
      throw new InternalServerErrorException('Erro ao verificar chave composta');
    }
  }

  async approve(id: number, aprovadoPor?: number): Promise<Sale> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a venda existe
        const checkResult = await client.query(
          'SELECT numero_sequencial FROM dbo.venda WHERE numero_sequencial = $1',
          [id],
        );

        if (checkResult.rows.length === 0) {
          throw new NotFoundException(`Venda com ID ${id} não encontrada`);
        }

        // Se não foi fornecido um funcionário, buscar o primeiro funcionário ativo disponível
        let funcionarioId = aprovadoPor;
        
        if (!funcionarioId) {
          const defaultEmployee = await client.query(
            'SELECT id FROM dbo.funcionario WHERE ativo = true ORDER BY id LIMIT 1',
          );

          if (defaultEmployee.rows.length > 0) {
            funcionarioId = defaultEmployee.rows[0].id;
            console.log(`[APROVAÇÃO] Usando funcionário padrão ID: ${funcionarioId}`);
          } else {
            throw new NotFoundException('Nenhum funcionário ativo encontrado para aprovar a venda');
          }
        } else {
          // Validar se o funcionário fornecido existe
          const employeeCheck = await client.query(
            'SELECT id FROM dbo.funcionario WHERE id = $1 AND ativo = true',
            [funcionarioId],
          );

          if (employeeCheck.rows.length === 0) {
            throw new NotFoundException(`Funcionário com ID ${funcionarioId} não encontrado ou inativo`);
          }
        }

        // Atualizar status para APROVADO
        const updateResult = await client.query(
          `UPDATE dbo.venda 
           SET status = $1, 
               aprovado_por = $2, 
               data_aprovacao = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE numero_sequencial = $3
           RETURNING *`,
          ['APROVADO', funcionarioId, id],
        );

        await client.query('COMMIT');

        return this.mapToEntity(updateResult.rows[0]);
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
      console.error('Erro ao aprovar venda:', error);
      throw new InternalServerErrorException('Erro ao aprovar venda');
    }
  }

  async deny(id: number, motivo?: string): Promise<Sale> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a venda existe
        const checkResult = await client.query(
          'SELECT numero_sequencial FROM dbo.venda WHERE numero_sequencial = $1',
          [id],
        );

        if (checkResult.rows.length === 0) {
          throw new NotFoundException(`Venda com ID ${id} não encontrada`);
        }

        // Atualizar status para CANCELADO (negar = cancelar)
        const observacoesUpdate = motivo 
          ? `Negado: ${motivo}` 
          : 'Venda negada';

        const updateResult = await client.query(
          `UPDATE dbo.venda 
           SET status = $1, 
               observacoes = COALESCE(observacoes || ' | ', '') || $2,
               updated_at = CURRENT_TIMESTAMP
           WHERE numero_sequencial = $3
           RETURNING *`,
          ['CANCELADO', observacoesUpdate, id],
        );

        await client.query('COMMIT');

        return this.mapToEntity(updateResult.rows[0]);
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
      console.error('Erro ao negar venda:', error);
      throw new InternalServerErrorException('Erro ao negar venda');
    }
  }

  private mapToEntity(dbRecord: any): Sale {
    return {
      id: dbRecord.numero_sequencial || dbRecord.id, // usar numero_sequencial como id
      numeroPedido: dbRecord.numero_pedido,
      numeroSequencial: dbRecord.numero_sequencial || null,
      modelo: dbRecord.modelo,
      serie: dbRecord.serie,
      numeroNota: dbRecord.codigo,
      clienteId: dbRecord.cliente_id,
      clienteNome: dbRecord.cliente_nome,
      dataEmissao: dbRecord.data_emissao,
      dataEntrega: dbRecord.data_entrega,
      condicaoPagamentoId: dbRecord.condicao_pagamento_id,
      condicaoPagamentoNome: dbRecord.condicao_pagamento_nome,
      formaPagamentoId: dbRecord.forma_pagamento_id,
      funcionarioId: dbRecord.funcionario_id,
      funcionarioNome: dbRecord.funcionario_nome,
      tipoFrete: dbRecord.tipo_frete,
      valorFrete: parseFloat(dbRecord.valor_frete || 0),
      valorSeguro: parseFloat(dbRecord.valor_seguro || 0),
      outrasDespesas: parseFloat(dbRecord.outras_despesas || 0),
      totalProdutos: parseFloat(dbRecord.total_produtos || 0),
      valorDesconto: parseFloat(dbRecord.valor_desconto || 0),
      valorAcrescimo: parseFloat(dbRecord.valor_acrescimo || 0),
      totalAPagar: parseFloat(dbRecord.total_a_pagar || 0),
      valorProdutos: parseFloat(dbRecord.valor_produtos || 0),
      valorTotal: parseFloat(dbRecord.valor_total || 0),
      status: dbRecord.status,
      transportadoraId: dbRecord.transportadora_id,
      transportadoraNome: dbRecord.transportadora_nome,
      observacoes: dbRecord.observacoes,
      aprovadoPor: dbRecord.aprovado_por,
      dataAprovacao: dbRecord.data_aprovacao,
      dataEntregaRealizada: dbRecord.data_entrega_realizada,
      ativo: dbRecord.ativo,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }
}
