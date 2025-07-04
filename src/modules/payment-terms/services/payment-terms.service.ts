import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePaymentTermDto } from '../dto/create-payment-term.dto';
import { UpdatePaymentTermDto } from '../dto/update-payment-term.dto';
import { PaymentTerm } from '../entities/payment-term.entity';
import { DatabaseService } from '../../../common/database/database.service';

@Injectable()
export class PaymentTermsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createPaymentTermDto: CreatePaymentTermDto,
  ): Promise<PaymentTerm> {
    // Validate installments percentages should sum to 100%
    this.validateInstallmentsPercentage(createPaymentTermDto.installments);

    try {
      // Create payment term
      const result = await this.databaseService.query(
        `INSERT INTO dbo.condicao_pagamento (nome, descricao, taxa_juros, taxa_multa, percentual_desconto, ativo, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          RETURNING id, nome as name, descricao as description, taxa_juros as "interestRate", 
                  taxa_multa as "fineRate", percentual_desconto as "discountPercentage", 
                  ativo, created_at as "createdAt", updated_at as "updatedAt"`,
        [
          createPaymentTermDto.name,
          createPaymentTermDto.description,
          Number(createPaymentTermDto.interestRate || 0),
          Number(createPaymentTermDto.fineRate || 0),
          Number(createPaymentTermDto.discountPercentage || 0),
          createPaymentTermDto.ativo,
        ],
      );

      const paymentTerm = result.rows[0];
      const paymentTermId = paymentTerm.id;

      // Create installments
      for (const installment of createPaymentTermDto.installments) {
        await this.databaseService.query(
          `INSERT INTO dbo.parcela_condicao_pagamento 
            (condicao_pagamento_id, numero_parcela, forma_pagamento_id, dias_para_pagamento, 
            percentual_valor, ativo, created_at) 
            VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [
            paymentTermId,
            Number(installment.installmentNumber),
            Number(installment.paymentMethodId),
            Number(installment.daysToPayment),
            Number(installment.percentageValue),
            Boolean(installment.ativo !== undefined ? installment.ativo : true),
          ],
        );
      }

      // Fetch installments to return with payment term
      const installmentsResult = await this.databaseService.query(
        `SELECT id, condicao_pagamento_id as "paymentTermId", numero_parcela as "installmentNumber", 
                forma_pagamento_id as "paymentMethodId", dias_para_pagamento as "daysToPayment", 
                percentual_valor as "percentageValue", 
                ativo, created_at as "createdAt", updated_at as "updatedAt"
          FROM dbo.parcela_condicao_pagamento
          WHERE condicao_pagamento_id = $1
          ORDER BY numero_parcela`,
        [paymentTermId],
      );

      paymentTerm.installments = installmentsResult.rows;
      return paymentTerm;
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique constraint violation
        throw new BadRequestException(
          'A payment term with this name already exists',
        );
      }
      if (error.code === '23503') {
        // PostgreSQL foreign key constraint violation
        throw new BadRequestException(
          'The referenced payment method does not exist',
        );
      }
      throw error;
    }
  }

  async findAll(): Promise<PaymentTerm[]> {
    const paymentTermsResult = await this.databaseService.query(
      `SELECT id, nome as name, descricao as description, taxa_juros as "interestRate", 
              taxa_multa as "fineRate", percentual_desconto as "discountPercentage", 
              ativo, created_at as "createdAt", updated_at as "updatedAt"
        FROM dbo.condicao_pagamento
        ORDER BY name`,
    );

    const paymentTerms = paymentTermsResult.rows;

    // Get installments for each payment term
    for (const paymentTerm of paymentTerms) {
      const installmentsResult = await this.databaseService.query(
        `SELECT id, condicao_pagamento_id as "paymentTermId", numero_parcela as "installmentNumber", 
                forma_pagamento_id as "paymentMethodId", dias_para_pagamento as "daysToPayment", 
                percentual_valor as "percentageValue", 
                ativo, created_at as "createdAt", updated_at as "updatedAt"
          FROM dbo.parcela_condicao_pagamento
          WHERE condicao_pagamento_id = $1
          ORDER BY numero_parcela`,
        [paymentTerm.id],
      );

      paymentTerm.installments = installmentsResult.rows;
    }

    return paymentTerms;
  }
  async findOne(id: number): Promise<PaymentTerm> {
    const result = await this.databaseService.query(
      `SELECT id, nome as name, descricao as description, taxa_juros as "interestRate", 
              taxa_multa as "fineRate", percentual_desconto as "discountPercentage", 
              ativo, created_at as "createdAt", updated_at as "updatedAt"
        FROM dbo.condicao_pagamento
        WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Payment term with ID ${id} not found`);
    }

    const paymentTerm = result.rows[0];

    // Get installments (including inactive ones for editing)
    const installmentsResult = await this.databaseService.query(
      `SELECT id, condicao_pagamento_id as "paymentTermId", numero_parcela as "installmentNumber", 
              forma_pagamento_id as "paymentMethodId", dias_para_pagamento as "daysToPayment", 
              percentual_valor as "percentageValue", 
              ativo, created_at as "createdAt", updated_at as "updatedAt"
        FROM dbo.parcela_condicao_pagamento
        WHERE condicao_pagamento_id = $1
        ORDER BY numero_parcela`,
      [id],
    );

    paymentTerm.installments = installmentsResult.rows;

    return paymentTerm;
  }
  async update(
    id: number,
    updatePaymentTermDto: UpdatePaymentTermDto,
  ): Promise<PaymentTerm> {
    // First check if the payment term exists
    await this.findOne(id);

    // If installments are provided, validate percentages
    if (updatePaymentTermDto.installments) {
      this.validateInstallmentsPercentage(updatePaymentTermDto.installments);
    }

    try {
      // Prepare columns and values to update
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updatePaymentTermDto.name !== undefined) {
        updates.push(`nome = $${paramCount}`);
        values.push(updatePaymentTermDto.name);
        paramCount++;
      }

      if (updatePaymentTermDto.description !== undefined) {
        updates.push(`descricao = $${paramCount}`);
        values.push(updatePaymentTermDto.description);
        paramCount++;
      }

      if (updatePaymentTermDto.interestRate !== undefined) {
        updates.push(`taxa_juros = $${paramCount}`);
        values.push(Number(updatePaymentTermDto.interestRate));
        paramCount++;
      }

      if (updatePaymentTermDto.fineRate !== undefined) {
        updates.push(`taxa_multa = $${paramCount}`);
        values.push(Number(updatePaymentTermDto.fineRate));
        paramCount++;
      }

      if (updatePaymentTermDto.discountPercentage !== undefined) {
        updates.push(`percentual_desconto = $${paramCount}`);
        values.push(Number(updatePaymentTermDto.discountPercentage));
        paramCount++;
      }

      if (updatePaymentTermDto.ativo !== undefined) { // Usar ativo
        updates.push(`ativo = $${paramCount}`);
        values.push(Boolean(updatePaymentTermDto.ativo)); // Usar ativo com conversão explícita
        paramCount++;
      }

      // Add updated_at field
      updates.push('updated_at = NOW()');

      // If no updates, return the current record
      if (updates.length === 0) {
        return this.findOne(id);
      }

      // Add id to values array
      values.push(id);

      const result = await this.databaseService.query(
        `UPDATE dbo.condicao_pagamento
          SET ${updates.join(', ')}
          WHERE id = $${paramCount}
          RETURNING id, nome as name, descricao as description, taxa_juros as "interestRate", 
                  taxa_multa as "fineRate", percentual_desconto as "discountPercentage", 
                  ativo, created_at as "createdAt", updated_at as "updatedAt"`,
        values,
      );

      const paymentTerm = result.rows[0];

      // Update installments if provided
      if (
        updatePaymentTermDto.installments &&
        updatePaymentTermDto.installments.length > 0
      ) {
        // DELETE existing installments instead of just marking them inactive
        // This resolves unique constraint conflicts with installment numbers
        await this.databaseService.query(
          `DELETE FROM dbo.parcela_condicao_pagamento 
            WHERE condicao_pagamento_id = $1`,
          [id],
        );

        // Create new installments
        for (const installment of updatePaymentTermDto.installments) {
          await this.databaseService.query(
            `INSERT INTO dbo.parcela_condicao_pagamento 
              (condicao_pagamento_id, numero_parcela, forma_pagamento_id, dias_para_pagamento, 
              percentual_valor, ativo, created_at) 
              VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [
              id,
              Number(installment.installmentNumber),
              Number(installment.paymentMethodId),
              Number(installment.daysToPayment),
              Number(installment.percentageValue),
              Boolean(installment.ativo !== undefined ? installment.ativo : true),
            ],
          );
        }
      }

      // Fetch updated installments
      const installmentsResult = await this.databaseService.query(
        `SELECT id, condicao_pagamento_id as "paymentTermId", numero_parcela as "installmentNumber", 
                forma_pagamento_id as "paymentMethodId", dias_para_pagamento as "daysToPayment", 
                percentual_valor as "percentageValue", 
                ativo, created_at as "createdAt", updated_at as "updatedAt"
          FROM dbo.parcela_condicao_pagamento
          WHERE condicao_pagamento_id = $1
          ORDER BY numero_parcela`,
        [id],
      );

      paymentTerm.installments = installmentsResult.rows;
      return paymentTerm;
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique constraint violation
        throw new BadRequestException(
          'A payment term with this name already exists',
        );
      }
      if (error.code === '23503') {
        // PostgreSQL foreign key constraint violation
        throw new BadRequestException(
          'The referenced payment method does not exist',
        );
      }
      throw error;
    }
  }
  async remove(id: number): Promise<void> {
    // First check if the payment term exists
    await this.findOne(id);

    // Check if the payment term is in use
    const usageCheck = await this.databaseService.query(
      `SELECT 1 FROM dbo.pedido WHERE condicao_pagamento_id = $1 LIMIT 1`,
      [id],
    );

    if (usageCheck.rowCount > 0) {
      // If it's in use, mark as inactive instead of deleting
      await this.databaseService.query(
        `UPDATE dbo.condicao_pagamento SET ativo = false, updated_at = NOW() WHERE id = $1`,
        [id],
      );

      // Also deactivate associated installments
      await this.databaseService.query(
        `UPDATE dbo.parcela_condicao_pagamento SET ativo = false, updated_at = NOW() 
          WHERE condicao_pagamento_id = $1`,
        [id],
      );
    } else {
      // If not in use, delete the installments first (foreign key constraint)
      await this.databaseService.query(
        `DELETE FROM dbo.parcela_condicao_pagamento WHERE condicao_pagamento_id = $1`,
        [id],
      );

      // Then delete the payment term
      await this.databaseService.query(
        `DELETE FROM dbo.condicao_pagamento WHERE id = $1`,
        [id],
      );
    }
  }

  private validateInstallmentsPercentage(installments: any[]): void {
    const totalPercentage = installments.reduce((sum, installment) => {
      return sum + Number(installment.percentageValue);
    }, 0);

    // Check that percentages add up to 100% (allowing a small floating point error)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new BadRequestException(
        'The sum of installment percentages must equal 100%',
      );
    }
  }
}
