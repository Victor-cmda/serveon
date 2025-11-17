import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAccountReceivableDto } from '../dto/create-account-receivable.dto';
import { UpdateAccountReceivableDto } from '../dto/update-account-receivable.dto';
import { ReceiveAccountDto } from '../dto/receive-account.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { AccountReceivable } from '../entities/account-receivable.entity';

@Injectable()
export class AccountsReceivableService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createAccountReceivableDto: CreateAccountReceivableDto): Promise<AccountReceivable> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se o cliente existe
        const customerCheck = await client.query(
          'SELECT id, razao_social, cnpj_cpf FROM dbo.cliente WHERE id = $1',
          [createAccountReceivableDto.clienteId],
        );

        if (customerCheck.rowCount === 0) {
          throw new BadRequestException(
            `Cliente com ID ${createAccountReceivableDto.clienteId} não encontrado`,
          );
        }

        // Calcular valor do saldo
        const valorOriginal = createAccountReceivableDto.valorOriginal;
        const valorDesconto = createAccountReceivableDto.valorDesconto || 0;
        const valorJuros = createAccountReceivableDto.valorJuros || 0;
        const valorMulta = createAccountReceivableDto.valorMulta || 0;
        const valorSaldo = valorOriginal - valorDesconto + valorJuros + valorMulta;

        // Inserir a conta a receber
        const result = await client.query(
          `INSERT INTO dbo.contas_receber
            (venda_numero_pedido, venda_modelo, venda_serie, venda_cliente_id, parcela,
             cliente_id, numero_documento, tipo_documento, data_emissao, data_vencimento,
             valor_original, valor_desconto, valor_juros, valor_multa, valor_saldo,
             forma_pagamento_id, status, observacoes)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          RETURNING *`,
          [
            createAccountReceivableDto.vendaNumeroPedido || null,
            createAccountReceivableDto.vendaModelo || null,
            createAccountReceivableDto.vendaSerie || null,
            createAccountReceivableDto.vendaClienteId || null,
            createAccountReceivableDto.parcela || null,
            createAccountReceivableDto.clienteId,
            createAccountReceivableDto.numeroDocumento,
            createAccountReceivableDto.tipoDocumento || 'FATURA',
            createAccountReceivableDto.dataEmissao,
            createAccountReceivableDto.dataVencimento,
            valorOriginal,
            valorDesconto,
            valorJuros,
            valorMulta,
            valorSaldo,
            createAccountReceivableDto.formaPagamentoId || null,
            'ABERTO',
            createAccountReceivableDto.observacoes || null,
          ],
        );

        const accountReceivable = await this.enrichAccountData(client, result.rows[0]);

        await client.query('COMMIT');
        return accountReceivable;
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

      console.error('Erro ao criar conta a receber:', error);
      throw new InternalServerErrorException('Erro ao criar conta a receber');
    }
  }

  async findAll(filters?: {
    clienteId?: number;
    status?: string;
    dataInicio?: Date;
    dataFim?: Date;
  }): Promise<AccountReceivable[]> {
    try {
      const client = await this.databaseService.getClient();

      try {
        let query = `
          SELECT cr.*,
                 c.razao_social as cliente_nome,
                 c.cnpj_cpf as cliente_cnpj_cpf,
                 fp.nome as forma_pagamento_nome,
                 func.nome as recebido_por_nome
          FROM dbo.contas_receber cr
          LEFT JOIN dbo.cliente c ON cr.cliente_id = c.id
          LEFT JOIN dbo.forma_pagamento fp ON cr.forma_pagamento_id = fp.id
          LEFT JOIN dbo.funcionario func ON cr.recebido_por = func.id
          WHERE cr.ativo = TRUE
        `;

        const params: any[] = [];
        let paramCounter = 1;

        if (filters?.clienteId) {
          query += ` AND cr.cliente_id = $${paramCounter}`;
          params.push(filters.clienteId);
          paramCounter++;
        }

        if (filters?.status) {
          query += ` AND cr.status = $${paramCounter}`;
          params.push(filters.status);
          paramCounter++;
        }

        if (filters?.dataInicio) {
          query += ` AND cr.data_vencimento >= $${paramCounter}`;
          params.push(filters.dataInicio);
          paramCounter++;
        }

        if (filters?.dataFim) {
          query += ` AND cr.data_vencimento <= $${paramCounter}`;
          params.push(filters.dataFim);
          paramCounter++;
        }

        query += ' ORDER BY cr.data_vencimento ASC, cr.id DESC';

        const result = await client.query(query, params);

        return result.rows.map((row) => this.mapRowToAccountReceivable(row));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao buscar contas a receber:', error);
      throw new InternalServerErrorException('Erro ao buscar contas a receber');
    }
  }

  async findOne(id: number): Promise<AccountReceivable> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(
          `SELECT cr.*,
                  c.razao_social as cliente_nome,
                  c.cnpj_cpf as cliente_cnpj_cpf,
                  fp.nome as forma_pagamento_nome,
                  func.nome as recebido_por_nome
           FROM dbo.contas_receber cr
           LEFT JOIN dbo.cliente c ON cr.cliente_id = c.id
           LEFT JOIN dbo.forma_pagamento fp ON cr.forma_pagamento_id = fp.id
           LEFT JOIN dbo.funcionario func ON cr.recebido_por = func.id
           WHERE cr.id = $1 AND cr.ativo = TRUE`,
          [id],
        );

        if (result.rowCount === 0) {
          throw new NotFoundException(`Conta a receber com ID ${id} não encontrada`);
        }

        return this.mapRowToAccountReceivable(result.rows[0]);
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Erro ao buscar conta a receber:', error);
      throw new InternalServerErrorException('Erro ao buscar conta a receber');
    }
  }

  async findByCustomer(clienteId: number): Promise<AccountReceivable[]> {
    return this.findAll({ clienteId });
  }

  async findOverdue(): Promise<AccountReceivable[]> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(
          `SELECT cr.*,
                  c.razao_social as cliente_nome,
                  c.cnpj_cpf as cliente_cnpj_cpf,
                  fp.nome as forma_pagamento_nome,
                  func.nome as recebido_por_nome
           FROM dbo.contas_receber cr
           LEFT JOIN dbo.cliente c ON cr.cliente_id = c.id
           LEFT JOIN dbo.forma_pagamento fp ON cr.forma_pagamento_id = fp.id
           LEFT JOIN dbo.funcionario func ON cr.recebido_por = func.id
           WHERE cr.ativo = TRUE
             AND cr.status = 'ABERTO'
             AND cr.data_vencimento < CURRENT_DATE
           ORDER BY cr.data_vencimento ASC`,
        );

        return result.rows.map((row) => this.mapRowToAccountReceivable(row));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao buscar contas vencidas:', error);
      throw new InternalServerErrorException('Erro ao buscar contas vencidas');
    }
  }

  async findByPeriod(dataInicio: Date, dataFim: Date): Promise<AccountReceivable[]> {
    return this.findAll({ dataInicio, dataFim });
  }

  async update(
    id: number,
    updateAccountReceivableDto: UpdateAccountReceivableDto,
  ): Promise<AccountReceivable> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a conta existe
        const existingAccount = await client.query(
          'SELECT id, status FROM dbo.contas_receber WHERE id = $1 AND ativo = TRUE',
          [id],
        );

        if (existingAccount.rowCount === 0) {
          throw new NotFoundException(`Conta a receber com ID ${id} não encontrada`);
        }

        // Verificar se a conta já foi recebida
        if (existingAccount.rows[0].status === 'RECEBIDO') {
          throw new BadRequestException('Não é possível atualizar uma conta já recebida');
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
          dataRecebimento: 'data_recebimento',
          valorOriginal: 'valor_original',
          valorDesconto: 'valor_desconto',
          valorJuros: 'valor_juros',
          valorMulta: 'valor_multa',
          valorRecebido: 'valor_recebido',
          formaPagamentoId: 'forma_pagamento_id',
          status: 'status',
          recebidoPor: 'recebido_por',
          observacoes: 'observacoes',
        };

        for (const [dtoField, dbField] of Object.entries(fieldMappings)) {
          if (updateAccountReceivableDto[dtoField] !== undefined) {
            updateFields.push(`${dbField} = $${paramCounter}`);
            updateValues.push(updateAccountReceivableDto[dtoField]);
            paramCounter++;
          }
        }

        // Recalcular o saldo se houver mudança nos valores
        if (
          updateAccountReceivableDto.valorOriginal !== undefined ||
          updateAccountReceivableDto.valorDesconto !== undefined ||
          updateAccountReceivableDto.valorJuros !== undefined ||
          updateAccountReceivableDto.valorMulta !== undefined ||
          updateAccountReceivableDto.valorRecebido !== undefined
        ) {
          // Buscar valores atuais
          const currentValues = await client.query(
            'SELECT valor_original, valor_desconto, valor_juros, valor_multa, valor_recebido FROM dbo.contas_receber WHERE id = $1',
            [id],
          );

          const current = currentValues.rows[0];
          const valorOriginal = updateAccountReceivableDto.valorOriginal ?? parseFloat(current.valor_original);
          const valorDesconto = updateAccountReceivableDto.valorDesconto ?? parseFloat(current.valor_desconto);
          const valorJuros = updateAccountReceivableDto.valorJuros ?? parseFloat(current.valor_juros);
          const valorMulta = updateAccountReceivableDto.valorMulta ?? parseFloat(current.valor_multa);
          const valorRecebido = updateAccountReceivableDto.valorRecebido ?? parseFloat(current.valor_recebido);

          const valorSaldo = valorOriginal - valorDesconto + valorJuros + valorMulta - valorRecebido;

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
          UPDATE dbo.contas_receber
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

      console.error('Erro ao atualizar conta a receber:', error);
      throw new InternalServerErrorException('Erro ao atualizar conta a receber');
    }
  }

  async receive(id: number, receiveAccountDto: ReceiveAccountDto): Promise<AccountReceivable> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Buscar a conta
        const accountResult = await client.query(
          'SELECT * FROM dbo.contas_receber WHERE id = $1 AND ativo = TRUE',
          [id],
        );

        if (accountResult.rowCount === 0) {
          throw new NotFoundException(`Conta a receber com ID ${id} não encontrada`);
        }

        const account = accountResult.rows[0];

        if (account.status === 'RECEBIDO') {
          throw new BadRequestException('Esta conta já foi recebida');
        }

        if (account.status === 'CANCELADO') {
          throw new BadRequestException('Não é possível receber uma conta cancelada');
        }

        // Calcular valores
        const valorOriginal = parseFloat(account.valor_original);
        const valorDescontoAtual = parseFloat(account.valor_desconto);
        const valorJurosAtual = parseFloat(account.valor_juros);
        const valorMultaAtual = parseFloat(account.valor_multa);

        const valorDesconto = receiveAccountDto.valorDesconto ?? valorDescontoAtual;
        const valorJuros = receiveAccountDto.valorJuros ?? valorJurosAtual;
        const valorMulta = receiveAccountDto.valorMulta ?? valorMultaAtual;
        
        // Calcular o valor total a receber
        const valorTotal = valorOriginal - valorDesconto + valorJuros + valorMulta;
        const valorRecebido = valorTotal;
        const valorSaldo = 0;

        // Sempre marca como RECEBIDO quando realiza o recebimento
        const novoStatus = 'RECEBIDO';

        // Validar se o valor recebido informado corresponde ao valor total
        if (Math.abs(receiveAccountDto.valorRecebido - valorTotal) > 0.01) {
          throw new BadRequestException(
            `O valor recebido deve ser igual ao valor total da conta (${valorTotal.toFixed(2)}). Recebimento parcial não é permitido.`
          );
        }

        // Atualizar a conta
        const result = await client.query(
          `UPDATE dbo.contas_receber
           SET data_recebimento = $1,
               valor_desconto = $2,
               valor_juros = $3,
               valor_multa = $4,
               valor_recebido = $5,
               valor_saldo = $6,
               forma_pagamento_id = $7,
               status = $8,
               recebido_por = $9,
               observacoes = COALESCE($10, observacoes),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $11
           RETURNING *`,
          [
            receiveAccountDto.dataRecebimento,
            valorDesconto,
            valorJuros,
            valorMulta,
            valorRecebido,
            valorSaldo,
            receiveAccountDto.formaPagamentoId,
            novoStatus,
            receiveAccountDto.recebidoPor || null,
            receiveAccountDto.observacoes || null,
            id,
          ],
        );

        const receivedAccount = await this.enrichAccountData(client, result.rows[0]);

        await client.query('COMMIT');
        return receivedAccount;
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

      console.error('Erro ao receber conta:', error);
      throw new InternalServerErrorException('Erro ao receber conta');
    }
  }

  async cancel(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a conta existe
        const existingAccount = await client.query(
          'SELECT id, status FROM dbo.contas_receber WHERE id = $1 AND ativo = TRUE',
          [id],
        );

        if (existingAccount.rowCount === 0) {
          throw new NotFoundException(`Conta a receber com ID ${id} não encontrada`);
        }

        if (existingAccount.rows[0].status === 'RECEBIDO') {
          throw new BadRequestException('Não é possível cancelar uma conta já recebida');
        }

        // Atualizar o status para CANCELADO
        await client.query(
          `UPDATE dbo.contas_receber 
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

      console.error('Erro ao cancelar conta a receber:', error);
      throw new InternalServerErrorException('Erro ao cancelar conta a receber');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a conta existe
        const existingAccount = await client.query(
          'SELECT id, status FROM dbo.contas_receber WHERE id = $1 AND ativo = TRUE',
          [id],
        );

        if (existingAccount.rowCount === 0) {
          throw new NotFoundException(`Conta a receber com ID ${id} não encontrada`);
        }

        if (existingAccount.rows[0].status === 'RECEBIDO') {
          throw new BadRequestException('Não é possível remover uma conta já recebida');
        }

        // Soft delete - marcar como inativo
        await client.query(
          'UPDATE dbo.contas_receber SET ativo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
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

      console.error('Erro ao remover conta a receber:', error);
      throw new InternalServerErrorException('Erro ao remover conta a receber');
    }
  }

  async updateOverdueStatus(): Promise<number> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(
          `UPDATE dbo.contas_receber
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
  private async enrichAccountData(client: any, accountData: any): Promise<AccountReceivable> {
    // Buscar informações do cliente
    if (accountData.cliente_id) {
      const customerResult = await client.query(
        'SELECT razao_social, cnpj_cpf FROM dbo.cliente WHERE id = $1',
        [accountData.cliente_id],
      );

      if (customerResult.rowCount > 0) {
        accountData.cliente_nome = customerResult.rows[0].razao_social;
        accountData.cliente_cnpj_cpf = customerResult.rows[0].cnpj_cpf;
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

    // Buscar informações do funcionário que recebeu
    if (accountData.recebido_por) {
      const employeeResult = await client.query(
        'SELECT nome FROM dbo.funcionario WHERE id = $1',
        [accountData.recebido_por],
      );

      if (employeeResult.rowCount > 0) {
        accountData.recebido_por_nome = employeeResult.rows[0].nome;
      }
    }

    return this.mapRowToAccountReceivable(accountData);
  }

  // Método privado para mapear uma linha do banco para o objeto AccountReceivable
  private mapRowToAccountReceivable(row: any): AccountReceivable {
    return {
      id: row.id,
      vendaNumeroPedido: row.venda_numero_pedido,
      vendaModelo: row.venda_modelo,
      vendaSerie: row.venda_serie,
      vendaClienteId: row.venda_cliente_id,
      parcela: row.parcela,
      clienteId: row.cliente_id,
      clienteNome: row.cliente_nome,
      clienteCnpjCpf: row.cliente_cnpj_cpf,
      numeroDocumento: row.numero_documento,
      tipoDocumento: row.tipo_documento,
      dataEmissao: row.data_emissao,
      dataVencimento: row.data_vencimento,
      dataRecebimento: row.data_recebimento,
      valorOriginal: parseFloat(row.valor_original),
      valorDesconto: parseFloat(row.valor_desconto),
      valorJuros: parseFloat(row.valor_juros),
      valorMulta: parseFloat(row.valor_multa),
      valorRecebido: parseFloat(row.valor_recebido),
      valorSaldo: parseFloat(row.valor_saldo),
      formaPagamentoId: row.forma_pagamento_id,
      formaPagamentoNome: row.forma_pagamento_nome,
      status: row.status,
      recebidoPor: row.recebido_por,
      recebidoPorNome: row.recebido_por_nome,
      observacoes: row.observacoes,
      ativo: row.ativo,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  }
}
