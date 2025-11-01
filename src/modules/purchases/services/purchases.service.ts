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
      console.log('[DEBUG] Dados recebidos do frontend:', {
        numeroItens: createPurchaseDto.itens?.length || 0,
        primeiroItem: createPurchaseDto.itens?.[0],
        valorFrete: createPurchaseDto.valorFrete,
        outrasDespesas: createPurchaseDto.outrasDespesas,
      });

      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Se funcionarioId não foi fornecido, buscar o primeiro funcionário ativo
        let funcionarioId = createPurchaseDto.funcionarioId;
        if (!funcionarioId) {
          const funcionarioResult = await client.query(
            `SELECT id FROM dbo.funcionario WHERE ativo = true ORDER BY id LIMIT 1`
          );
          
          if (funcionarioResult.rows.length === 0) {
            throw new BadRequestException('Nenhum funcionário ativo encontrado no sistema');
          }
          
          funcionarioId = funcionarioResult.rows[0].id;
          console.log(`[CRIAÇÃO COMPRA] Usando funcionário padrão ID: ${funcionarioId}`);
        }

        // Usar o número do pedido informado pelo usuário ou gerar um sequencial
        let numeroPedido: string;
        
        if (createPurchaseDto.numeroPedido && createPurchaseDto.numeroPedido.trim() !== '') {
          // Usar o número informado pelo usuário
          numeroPedido = createPurchaseDto.numeroPedido.trim();
          console.log('[DEBUG] Usando número do pedido informado pelo usuário:', numeroPedido);
        } else {
          // Gerar número sequencial único apenas se não for informado
          const sequenceResult = await client.query(`
            SELECT COALESCE(MAX(CAST(numero_pedido AS INTEGER)), 0) + 1 as next_number
            FROM dbo.compra 
            WHERE numero_pedido ~ '^[0-9]+$'
          `);
          numeroPedido = sequenceResult.rows[0].next_number.toString();
          console.log('[DEBUG] Número do pedido gerado automaticamente:', numeroPedido);
        }

        // Calcular totais
        const totalProdutos =
          createPurchaseDto.itens?.reduce((total, item) => {
            return total + (item.total || 0);
          }, 0) || 0;

        const valorFrete = createPurchaseDto.valorFrete || 0;
        const valorSeguro = createPurchaseDto.valorSeguro || 0;
        const outrasDespesas = createPurchaseDto.outrasDespesas || 0;
        const valorDesconto = createPurchaseDto.valorDesconto || 0;

        console.log('[DEBUG] Cálculo de totais:', {
          totalProdutos,
          valorFrete,
          valorSeguro,
          outrasDespesas,
          valorDesconto,
          numeroItens: createPurchaseDto.itens?.length || 0,
        });

        const totalAPagar =
          totalProdutos +
          valorFrete +
          valorSeguro +
          outrasDespesas -
          valorDesconto;

        console.log('[DEBUG] Total a pagar calculado:', totalAPagar);

        // Inserir nova compra
        const result = await client.query(
          `INSERT INTO dbo.compra
            (numero_pedido, modelo, serie, codigo, fornecedor_id, 
            data_emissao, data_chegada, data_entrega_realizada,
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
            createPurchaseDto.modelo,
            createPurchaseDto.serie,
            createPurchaseDto.numeroNota || null,
            createPurchaseDto.fornecedorId,
            createPurchaseDto.dataEmissao,
            createPurchaseDto.dataChegada || null,
            createPurchaseDto.dataEntregaRealizada || null,
            createPurchaseDto.condicaoPagamentoId,
            createPurchaseDto.formaPagamentoId || null,
            funcionarioId,
            createPurchaseDto.tipoFrete || 'CIF',
            valorFrete,
            valorSeguro,
            outrasDespesas,
            valorDesconto,
            createPurchaseDto.valorAcrescimo || 0,
            totalProdutos,
            totalAPagar,
            totalProdutos, // valor_produtos (compatibilidade)
            totalAPagar,   // valor_total (compatibilidade)
            createPurchaseDto.status || 'PENDENTE',
            createPurchaseDto.transportadoraId || null,
            createPurchaseDto.observacoes || null,
            createPurchaseDto.aprovadoPor || null,
            createPurchaseDto.dataAprovacao || null,
            true,
          ],
        );

        const compraId = result.rows[0].id;

        // Inserir itens da compra
        if (createPurchaseDto.itens && createPurchaseDto.itens.length > 0) {
          console.log(`[DEBUG] Inserindo ${createPurchaseDto.itens.length} itens da compra`);
          
          for (const item of createPurchaseDto.itens) {
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
            const quantidadeRecebida = item.quantidadeRecebida || 0;

            console.log(`[DEBUG] Inserindo item com dados:`, {
              numeroPedido: numeroPedido,
              modelo: createPurchaseDto.modelo,
              serie: createPurchaseDto.serie,
              fornecedorId: createPurchaseDto.fornecedorId,
              codigo: produto.codigo || item.produtoId.toString(),
              produtoId: item.produtoId,
              produto: produto.produto,
              unidade: produto.unidade || 'UN',
              quantidade: item.quantidade,
            });

            await client.query(
              `INSERT INTO dbo.item_compra 
                (compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id, 
                codigo, produto_id, produto, unidade, quantidade, preco_un, desc_un, 
                liquido_un, total, rateio, custo_final_un, custo_final,
                valor_unitario, valor_desconto, valor_total, quantidade_recebida, 
                data_entrega_item, observacoes)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
              [
                numeroPedido,
                createPurchaseDto.modelo,
                createPurchaseDto.serie,
                createPurchaseDto.fornecedorId,
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
                quantidadeRecebida,
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

        // Inserir parcelas da compra
        if (
          createPurchaseDto.parcelas &&
          createPurchaseDto.parcelas.length > 0
        ) {
          for (const parcela of createPurchaseDto.parcelas) {
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
              `INSERT INTO dbo.parcela_compra 
                (compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id, 
                parcela, codigo_forma_pagto, forma_pagamento_id, forma_pagamento, 
                data_vencimento, valor_parcela)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
              [
                numeroPedido,
                createPurchaseDto.modelo,
                createPurchaseDto.serie,
                createPurchaseDto.fornecedorId,
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

      // Para cada compra, buscar os itens e parcelas
      const comprasComDetalhes = await Promise.all(
        result.rows.map(async (row) => {
          const compra = this.mapToEntity(row);

          // Buscar itens da compra
          const itensResult = await this.databaseService.query(
            `SELECT * FROM dbo.item_compra 
             WHERE compra_numero_pedido = $1 
               AND compra_modelo = $2 
               AND compra_serie = $3 
               AND compra_fornecedor_id = $4
             ORDER BY id`,
            [row.numero_pedido, row.modelo, row.serie, row.fornecedor_id],
          );

          // Buscar parcelas da compra
          const parcelasResult = await this.databaseService.query(
            `SELECT * FROM dbo.parcela_compra 
             WHERE compra_numero_pedido = $1 
               AND compra_modelo = $2 
               AND compra_serie = $3 
               AND compra_fornecedor_id = $4
             ORDER BY parcela`,
            [row.numero_pedido, row.modelo, row.serie, row.fornecedor_id],
          );

          // Adicionar itens e parcelas à compra
          return {
            ...compra,
            itens: itensResult.rows,
            parcelas: parcelasResult.rows,
          };
        })
      );

      return comprasComDetalhes;
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
        WHERE c.numero_sequencial = $1 AND c.ativo = true`,
        [id],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`Compra com ID ${id} não encontrada`);
      }

      console.log('[DEBUG] Compra encontrada:', {
        transportadoraId: result.rows[0].transportadora_id,
        transportadoraNome: result.rows[0].transportadora_nome,
      });

      const compra = this.mapToEntity(result.rows[0]);

      // Buscar itens da compra
      const itensResult = await this.databaseService.query(
        `SELECT * FROM dbo.item_compra 
         WHERE compra_numero_pedido = $1 
           AND compra_modelo = $2 
           AND compra_serie = $3 
           AND compra_fornecedor_id = $4
         ORDER BY id`,
        [result.rows[0].numero_pedido, result.rows[0].modelo, result.rows[0].serie, result.rows[0].fornecedor_id],
      );

      // Buscar parcelas da compra
      const parcelasResult = await this.databaseService.query(
        `SELECT * FROM dbo.parcela_compra 
         WHERE compra_numero_pedido = $1 
           AND compra_modelo = $2 
           AND compra_serie = $3 
           AND compra_fornecedor_id = $4
         ORDER BY parcela`,
        [result.rows[0].numero_pedido, result.rows[0].modelo, result.rows[0].serie, result.rows[0].fornecedor_id],
      );

      // Adicionar itens e parcelas à compra (se necessário no retorno)
      // compra.itens = itensResult.rows;
      // compra.parcelas = parcelasResult.rows;

      return compra;
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
            const valorItem = (item.precoUn - (item.descUn || 0)) * item.quantidade;
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

  async checkCompositeKeyExists(
    numeroPedido: string,
    modelo: string,
    serie: string,
    fornecedorId: string,
  ): Promise<boolean> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(
          `SELECT 1 FROM dbo.compra 
           WHERE numero_pedido = $1 
           AND modelo = $2 
           AND serie = $3 
           AND fornecedor_id = $4 
           AND ativo = true
           LIMIT 1`,
          [numeroPedido, modelo, serie, parseInt(fornecedorId)],
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

  async approve(id: number, aprovadoPor?: number): Promise<Purchase> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a compra existe
        const checkResult = await client.query(
          'SELECT numero_sequencial FROM dbo.compra WHERE numero_sequencial = $1',
          [id],
        );

        if (checkResult.rows.length === 0) {
          throw new NotFoundException(`Compra com ID ${id} não encontrada`);
        }

        // Se não foi fornecido um funcionário, buscar o primeiro funcionário ativo disponível
        let funcionarioId = aprovadoPor;
        
        if (!funcionarioId) {
          const defaultEmployee = await client.query(
            'SELECT id FROM dbo.funcionario WHERE ativo = true ORDER BY id LIMIT 1',
          );

          if (defaultEmployee.rows.length > 0) {
            funcionarioId = defaultEmployee.rows[0].id;
            console.log(`[APROVAÇÃO COMPRA] Usando funcionário padrão ID: ${funcionarioId}`);
          } else {
            throw new NotFoundException('Nenhum funcionário ativo encontrado para aprovar a compra');
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
          `UPDATE dbo.compra 
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
      console.error('Erro ao aprovar compra:', error);
      throw new InternalServerErrorException('Erro ao aprovar compra');
    }
  }

  async deny(id: number, motivo?: string): Promise<Purchase> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a compra existe
        const checkResult = await client.query(
          'SELECT numero_sequencial FROM dbo.compra WHERE numero_sequencial = $1',
          [id],
        );

        if (checkResult.rows.length === 0) {
          throw new NotFoundException(`Compra com ID ${id} não encontrada`);
        }

        // Atualizar status para CANCELADO (negar = cancelar)
        const observacoesUpdate = motivo 
          ? `Negado: ${motivo}` 
          : 'Compra negada';

        const updateResult = await client.query(
          `UPDATE dbo.compra 
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
      console.error('Erro ao negar compra:', error);
      throw new InternalServerErrorException('Erro ao negar compra');
    }
  }

  private mapToEntity(dbRecord: any): Purchase {
    return {
      id: dbRecord.numero_sequencial || dbRecord.id, // usar numero_sequencial como id
      numeroPedido: dbRecord.numero_pedido,
      numeroSequencial: dbRecord.numero_sequencial || null,
      modelo: dbRecord.modelo,
      serie: dbRecord.serie,
      numeroNota: dbRecord.codigo,
      fornecedorId: dbRecord.fornecedor_id,
      fornecedorNome: dbRecord.fornecedor_nome,
      dataEmissao: dbRecord.data_emissao,
      dataChegada: dbRecord.data_chegada,
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
