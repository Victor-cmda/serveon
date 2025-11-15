import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAccountPayableDto } from '../dto/create-account-payable.dto';
import { UpdateAccountPayableDto } from '../dto/update-account-payable.dto';
import { PayAccountDto } from '../dto/pay-account.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { AccountPayable } from '../entities/account-payable.entity';

@Injectable()
export class AccountsPayableService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createAccountPayableDto: CreateAccountPayableDto): Promise<AccountPayable> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se o fornecedor existe
        const supplierCheck = await client.query(
          'SELECT id, razao_social, cnpj_cpf FROM dbo.fornecedor WHERE id = $1',
          [createAccountPayableDto.fornecedorId],
        );

        if (supplierCheck.rowCount === 0) {
          throw new BadRequestException(
            `Fornecedor com ID ${createAccountPayableDto.fornecedorId} não encontrado`,
          );
        }

        // Calcular valor do saldo
        const valorOriginal = createAccountPayableDto.valorOriginal;
        const valorDesconto = createAccountPayableDto.valorDesconto || 0;
        const valorJuros = createAccountPayableDto.valorJuros || 0;
        const valorMulta = createAccountPayableDto.valorMulta || 0;
        const valorSaldo = valorOriginal - valorDesconto + valorJuros + valorMulta;

        // Inserir a conta a pagar
        const result = await client.query(
          `INSERT INTO dbo.contas_pagar
            (compra_numero_pedido, compra_modelo, compra_serie, compra_fornecedor_id, parcela,
             fornecedor_id, numero_documento, tipo_documento, data_emissao, data_vencimento,
             valor_original, valor_desconto, valor_juros, valor_multa, valor_saldo,
             forma_pagamento_id, status, observacoes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *`,
          [
            createAccountPayableDto.compraNumeroPedido || null,
            createAccountPayableDto.compraModelo || null,
            createAccountPayableDto.compraSerie || null,
            createAccountPayableDto.compraFornecedorId || null,
            createAccountPayableDto.parcela || null,
            createAccountPayableDto.fornecedorId,
            createAccountPayableDto.numeroDocumento,
            createAccountPayableDto.tipoDocumento || 'FATURA',
            createAccountPayableDto.dataEmissao,
            createAccountPayableDto.dataVencimento,
            valorOriginal,
            valorDesconto,
            valorJuros,
            valorMulta,
            valorSaldo,
            createAccountPayableDto.formaPagamentoId || null,
            'ABERTO',
            createAccountPayableDto.observacoes || null,
          ],
        );

        const accountPayable = await this.enrichAccountData(client, result.rows[0]);

        await client.query('COMMIT');
        return accountPayable;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      console.error('Erro ao criar conta a pagar:', error);
      throw new InternalServerErrorException('Erro ao criar conta a pagar');
    }
  }

  async findAll(filters?: {
    fornecedorId?: number;
    status?: string;
    dataInicio?: Date;
    dataFim?: Date;
  }): Promise<AccountPayable[]> {
    try {
      const client = await this.databaseService.getClient();

      try {
        let query = `
          SELECT cp.*,
                 f.razao_social as fornecedor_nome,
                 f.cnpj_cpf as fornecedor_cnpj_cpf,
                 fp.nome as forma_pagamento_nome,
                 func.nome as pago_por_nome
          FROM dbo.contas_pagar cp
          LEFT JOIN dbo.fornecedor f ON cp.fornecedor_id = f.id
          LEFT JOIN dbo.forma_pagamento fp ON cp.forma_pagamento_id = fp.id
          LEFT JOIN dbo.funcionario func ON cp.pago_por = func.id
          WHERE cp.ativo = TRUE
        `;

        const params: any[] = [];
        let paramCounter = 1;

        if (filters?.fornecedorId) {
          query += ` AND cp.fornecedor_id = $${paramCounter}`;
          params.push(filters.fornecedorId);
          paramCounter++;
        }

        if (filters?.status) {
          query += ` AND cp.status = $${paramCounter}`;
          params.push(filters.status);
          paramCounter++;
        }

        if (filters?.dataInicio) {
          query += ` AND cp.data_vencimento >= $${paramCounter}`;
          params.push(filters.dataInicio);
          paramCounter++;
        }

        if (filters?.dataFim) {
          query += ` AND cp.data_vencimento <= $${paramCounter}`;
          params.push(filters.dataFim);
          paramCounter++;
        }

        query += ' ORDER BY cp.data_vencimento ASC, cp.id DESC';

        const result = await client.query(query, params);

        return result.rows.map((row) => this.mapRowToAccountPayable(row));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao buscar contas a pagar:', error);
      throw new InternalServerErrorException('Erro ao buscar contas a pagar');
    }
  }

  async findOne(id: number): Promise<AccountPayable> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(
          `SELECT cp.*,
                  f.razao_social as fornecedor_nome,
                  f.cnpj_cpf as fornecedor_cnpj_cpf,
                  fp.nome as forma_pagamento_nome,
                  func.nome as pago_por_nome
           FROM dbo.contas_pagar cp
           LEFT JOIN dbo.fornecedor f ON cp.fornecedor_id = f.id
           LEFT JOIN dbo.forma_pagamento fp ON cp.forma_pagamento_id = fp.id
           LEFT JOIN dbo.funcionario func ON cp.pago_por = func.id
           WHERE cp.id = $1 AND cp.ativo = TRUE`,
          [id],
        );

        if (result.rowCount === 0) {
          throw new NotFoundException(`Conta a pagar com ID ${id} não encontrada`);
        }

        return this.mapRowToAccountPayable(result.rows[0]);
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Erro ao buscar conta a pagar:', error);
      throw new InternalServerErrorException('Erro ao buscar conta a pagar');
    }
  }

  async findBySupplier(fornecedorId: number): Promise<AccountPayable[]> {
    return this.findAll({ fornecedorId });
  }

  async findOverdue(): Promise<AccountPayable[]> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(
          `SELECT cp.*,
                  f.razao_social as fornecedor_nome,
                  f.cnpj_cpf as fornecedor_cnpj_cpf,
                  fp.nome as forma_pagamento_nome,
                  func.nome as pago_por_nome
           FROM dbo.contas_pagar cp
           LEFT JOIN dbo.fornecedor f ON cp.fornecedor_id = f.id
           LEFT JOIN dbo.forma_pagamento fp ON cp.forma_pagamento_id = fp.id
           LEFT JOIN dbo.funcionario func ON cp.pago_por = func.id
           WHERE cp.ativo = TRUE
             AND cp.status = 'ABERTO'
             AND cp.data_vencimento < CURRENT_DATE
           ORDER BY cp.data_vencimento ASC`,
        );

        return result.rows.map((row) => this.mapRowToAccountPayable(row));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao buscar contas vencidas:', error);
      throw new InternalServerErrorException('Erro ao buscar contas vencidas');
    }
  }

  async findByPeriod(dataInicio: Date, dataFim: Date): Promise<AccountPayable[]> {
    return this.findAll({ dataInicio, dataFim });
  }

  async update(
    id: number,
    updateAccountPayableDto: UpdateAccountPayableDto,
  ): Promise<AccountPayable> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a conta existe
        const existingAccount = await client.query(
          'SELECT id, status FROM dbo.contas_pagar WHERE id = $1 AND ativo = TRUE',
          [id],
        );

        if (existingAccount.rowCount === 0) {
          throw new NotFoundException(`Conta a pagar com ID ${id} não encontrada`);
        }

        // Verificar se a conta já foi paga
        if (existingAccount.rows[0].status === 'PAGO') {
          throw new BadRequestException('Não é possível atualizar uma conta já paga');
        }

        // Construir a query de atualização dinamicamente
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramCounter = 1;

        const fieldMappings = {
          numeroDocumento: 'numero_documento',
          tipoDocumento: 'tipo_documento',
          dataEmissao: 'data_emissao',
          dataVencimento: 'data_vencimento',
          dataPagamento: 'data_pagamento',
          valorOriginal: 'valor_original',
          valorDesconto: 'valor_desconto',
          valorJuros: 'valor_juros',
          valorMulta: 'valor_multa',
          valorPago: 'valor_pago',
          formaPagamentoId: 'forma_pagamento_id',
          status: 'status',
          pagoPor: 'pago_por',
          observacoes: 'observacoes',
        };

        for (const [dtoField, dbField] of Object.entries(fieldMappings)) {
          if (updateAccountPayableDto[dtoField] !== undefined) {
            updateFields.push(`${dbField} = $${paramCounter}`);
            updateValues.push(updateAccountPayableDto[dtoField]);
            paramCounter++;
          }
        }

        // Recalcular o saldo se houver mudança nos valores
        if (
          updateAccountPayableDto.valorOriginal !== undefined ||
          updateAccountPayableDto.valorDesconto !== undefined ||
          updateAccountPayableDto.valorJuros !== undefined ||
          updateAccountPayableDto.valorMulta !== undefined ||
          updateAccountPayableDto.valorPago !== undefined
        ) {
          // Buscar valores atuais
          const currentValues = await client.query(
            'SELECT valor_original, valor_desconto, valor_juros, valor_multa, valor_pago FROM dbo.contas_pagar WHERE id = $1',
            [id],
          );

          const current = currentValues.rows[0];
          const valorOriginal = updateAccountPayableDto.valorOriginal ?? parseFloat(current.valor_original);
          const valorDesconto = updateAccountPayableDto.valorDesconto ?? parseFloat(current.valor_desconto);
          const valorJuros = updateAccountPayableDto.valorJuros ?? parseFloat(current.valor_juros);
          const valorMulta = updateAccountPayableDto.valorMulta ?? parseFloat(current.valor_multa);
          const valorPago = updateAccountPayableDto.valorPago ?? parseFloat(current.valor_pago);

          const valorSaldo = valorOriginal - valorDesconto + valorJuros + valorMulta - valorPago;

          updateFields.push(`valor_saldo = $${paramCounter}`);
          updateValues.push(valorSaldo);
          paramCounter++;
        }

        if (updateFields.length === 0) {
          throw new BadRequestException('Nenhum campo para atualizar');
        }

        // Sempre atualizar o campo updated_at
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

        // Adicionar o ID como último parâmetro
        updateValues.push(id);

        // Executar a atualização
        const updateQuery = `
          UPDATE dbo.contas_pagar
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCounter}
          RETURNING *
        `;

        const result = await client.query(updateQuery, updateValues);

        const updatedAccount = await this.enrichAccountData(client, result.rows[0]);

        await client.query('COMMIT');
        return updatedAccount;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      console.error('Erro ao atualizar conta a pagar:', error);
      throw new InternalServerErrorException('Erro ao atualizar conta a pagar');
    }
  }

  async pay(id: number, payAccountDto: PayAccountDto): Promise<AccountPayable> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Buscar a conta
        const accountResult = await client.query(
          'SELECT * FROM dbo.contas_pagar WHERE id = $1 AND ativo = TRUE',
          [id],
        );

        if (accountResult.rowCount === 0) {
          throw new NotFoundException(`Conta a pagar com ID ${id} não encontrada`);
        }

        const account = accountResult.rows[0];

        if (account.status === 'PAGO') {
          throw new BadRequestException('Esta conta já foi paga');
        }

        if (account.status === 'CANCELADO') {
          throw new BadRequestException('Não é possível pagar uma conta cancelada');
        }

        // Calcular valores
        const valorOriginal = parseFloat(account.valor_original);
        const valorDescontoAtual = parseFloat(account.valor_desconto);
        const valorJurosAtual = parseFloat(account.valor_juros);
        const valorMultaAtual = parseFloat(account.valor_multa);

        const valorDesconto = payAccountDto.valorDesconto ?? valorDescontoAtual;
        const valorJuros = payAccountDto.valorJuros ?? valorJurosAtual;
        const valorMulta = payAccountDto.valorMulta ?? valorMultaAtual;
        
        // Calcular o valor total a pagar
        const valorTotal = valorOriginal - valorDesconto + valorJuros + valorMulta;
        const valorPago = valorTotal;
        const valorSaldo = 0;

        // Sempre marca como PAGO quando realiza o pagamento
        const novoStatus = 'PAGO';

        // Validar se o valor pago informado corresponde ao valor total
        if (Math.abs(payAccountDto.valorPago - valorTotal) > 0.01) {
          throw new BadRequestException(
            `O valor pago deve ser igual ao valor total da conta (${valorTotal.toFixed(2)}). Pagamento parcial não é permitido.`
          );
        }

        // Atualizar a conta
        const result = await client.query(
          `UPDATE dbo.contas_pagar
           SET data_pagamento = $1,
               valor_desconto = $2,
               valor_juros = $3,
               valor_multa = $4,
               valor_pago = $5,
               valor_saldo = $6,
               forma_pagamento_id = $7,
               status = $8,
               pago_por = $9,
               observacoes = COALESCE($10, observacoes),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $11
           RETURNING *`,
          [
            payAccountDto.dataPagamento,
            valorDesconto,
            valorJuros,
            valorMulta,
            valorPago,
            valorSaldo,
            payAccountDto.formaPagamentoId,
            novoStatus,
            payAccountDto.pagoPor || null,
            payAccountDto.observacoes || null,
            id,
          ],
        );

        const paidAccount = await this.enrichAccountData(client, result.rows[0]);

        await client.query('COMMIT');
        return paidAccount;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      console.error('Erro ao pagar conta:', error);
      throw new InternalServerErrorException('Erro ao pagar conta');
    }
  }

  async cancel(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a conta existe
        const existingAccount = await client.query(
          'SELECT id, status FROM dbo.contas_pagar WHERE id = $1 AND ativo = TRUE',
          [id],
        );

        if (existingAccount.rowCount === 0) {
          throw new NotFoundException(`Conta a pagar com ID ${id} não encontrada`);
        }

        if (existingAccount.rows[0].status === 'PAGO') {
          throw new BadRequestException('Não é possível cancelar uma conta já paga');
        }

        // Atualizar o status para CANCELADO
        await client.query(
          `UPDATE dbo.contas_pagar 
           SET status = 'CANCELADO', updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1`,
          [id],
        );

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      console.error('Erro ao cancelar conta a pagar:', error);
      throw new InternalServerErrorException('Erro ao cancelar conta a pagar');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a conta existe
        const existingAccount = await client.query(
          'SELECT id, status FROM dbo.contas_pagar WHERE id = $1 AND ativo = TRUE',
          [id],
        );

        if (existingAccount.rowCount === 0) {
          throw new NotFoundException(`Conta a pagar com ID ${id} não encontrada`);
        }

        if (existingAccount.rows[0].status === 'PAGO') {
          throw new BadRequestException('Não é possível remover uma conta já paga');
        }

        // Soft delete - marcar como inativo
        await client.query(
          'UPDATE dbo.contas_pagar SET ativo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
          [id],
        );

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      console.error('Erro ao remover conta a pagar:', error);
      throw new InternalServerErrorException('Erro ao remover conta a pagar');
    }
  }

  async updateOverdueStatus(): Promise<number> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(
          `UPDATE dbo.contas_pagar
           SET status = 'VENCIDO', updated_at = CURRENT_TIMESTAMP
           WHERE status = 'ABERTO'
             AND data_vencimento < CURRENT_DATE
             AND ativo = TRUE
           RETURNING id`,
        );

        return result.rowCount || 0;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao atualizar status de contas vencidas:', error);
      throw new InternalServerErrorException('Erro ao atualizar status de contas vencidas');
    }
  }

  // Método privado para enriquecer os dados da conta com informações relacionadas
  private async enrichAccountData(client: any, accountData: any): Promise<AccountPayable> {
    // Buscar informações do fornecedor
    if (accountData.fornecedor_id) {
      const supplierResult = await client.query(
        'SELECT razao_social, cnpj_cpf FROM dbo.fornecedor WHERE id = $1',
        [accountData.fornecedor_id],
      );

      if (supplierResult.rowCount > 0) {
        accountData.fornecedor_nome = supplierResult.rows[0].razao_social;
        accountData.fornecedor_cnpj_cpf = supplierResult.rows[0].cnpj_cpf;
      }
    }

    // Buscar informações da forma de pagamento
    if (accountData.forma_pagamento_id) {
      const paymentMethodResult = await client.query(
        'SELECT nome FROM dbo.forma_pagamento WHERE id = $1',
        [accountData.forma_pagamento_id],
      );

      if (paymentMethodResult.rowCount > 0) {
        accountData.forma_pagamento_nome = paymentMethodResult.rows[0].nome;
      }
    }

    // Buscar informações do funcionário que pagou
    if (accountData.pago_por) {
      const employeeResult = await client.query(
        'SELECT nome FROM dbo.funcionario WHERE id = $1',
        [accountData.pago_por],
      );

      if (employeeResult.rowCount > 0) {
        accountData.pago_por_nome = employeeResult.rows[0].nome;
      }
    }

    return this.mapRowToAccountPayable(accountData);
  }

  // Método privado para mapear uma linha do banco para o objeto AccountPayable
  private mapRowToAccountPayable(row: any): AccountPayable {
    return {
      id: row.id,
      compraNumeroPedido: row.compra_numero_pedido,
      compraModelo: row.compra_modelo,
      compraSerie: row.compra_serie,
      compraFornecedorId: row.compra_fornecedor_id,
      parcela: row.parcela,
      fornecedorId: row.fornecedor_id,
      fornecedorNome: row.fornecedor_nome,
      fornecedorCnpjCpf: row.fornecedor_cnpj_cpf,
      numeroDocumento: row.numero_documento,
      tipoDocumento: row.tipo_documento,
      dataEmissao: row.data_emissao,
      dataVencimento: row.data_vencimento,
      dataPagamento: row.data_pagamento,
      valorOriginal: parseFloat(row.valor_original),
      valorDesconto: parseFloat(row.valor_desconto),
      valorJuros: parseFloat(row.valor_juros),
      valorMulta: parseFloat(row.valor_multa),
      valorPago: parseFloat(row.valor_pago),
      valorSaldo: parseFloat(row.valor_saldo),
      formaPagamentoId: row.forma_pagamento_id,
      formaPagamentoNome: row.forma_pagamento_nome,
      status: row.status,
      pagoPor: row.pago_por,
      pagoPorNome: row.pago_por_nome,
      observacoes: row.observacoes,
      ativo: row.ativo,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  }
}
