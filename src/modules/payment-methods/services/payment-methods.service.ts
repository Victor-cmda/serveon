import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';
import { DatabaseService } from 'src/common/database/database.service';
import { PaymentMethod } from '../entities/payment-method.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createPaymentMethodDto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    const { description, code, type, active = true } = createPaymentMethodDto;

    const result = await this.databaseService.query(
      `INSERT INTO dbo.formapagamento (descricao, codigo, tipo, ativo)
        VALUES ($1, $2, $3, $4)
        RETURNING id, descricao as description, codigo as code, tipo as type, 
                ativo as active, created_at as "createdAt", updated_at as "updatedAt"`,
      [description, code, type, active],
    );

    return result.rows[0];
  }

  async findAll(): Promise<PaymentMethod[]> {
    const result = await this.databaseService.query(
      `SELECT id, descricao as description, codigo as code, tipo as type,
              ativo as active, created_at as "createdAt", updated_at as "updatedAt"
      FROM dbo.formapagamento
      ORDER BY description`,
    );

    return result.rows;
  }

  async findOne(id: string): Promise<PaymentMethod> {
    const result = await this.databaseService.query(
      `SELECT id, descricao as description, codigo as code, tipo as type,
              ativo as active, created_at as "createdAt", updated_at as "updatedAt"
      FROM dbo.formapagamento
      WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`Payment method with ID ${id} not found`);
    }

    return result.rows[0];
  }

  async update(
    id: string,
    updatePaymentMethodDto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    // First check if payment method exists
    await this.findOne(id);

    // Prepare columns and values to update
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updatePaymentMethodDto.description !== undefined) {
      updates.push(`descricao = $${paramCount}`);
      values.push(updatePaymentMethodDto.description);
      paramCount++;
    }

    if (updatePaymentMethodDto.code !== undefined) {
      updates.push(`codigo = $${paramCount}`);
      values.push(updatePaymentMethodDto.code);
      paramCount++;
    }

    if (updatePaymentMethodDto.type !== undefined) {
      updates.push(`tipo = $${paramCount}`);
      values.push(updatePaymentMethodDto.type);
      paramCount++;
    }

    if (updatePaymentMethodDto.active !== undefined) {
      updates.push(`ativo = $${paramCount}`);
      values.push(updatePaymentMethodDto.active);
      paramCount++;
    }

    // If no updates, return the current record
    if (updates.length === 0) {
      return this.findOne(id);
    }

    // Add id to values array
    values.push(id);

    const result = await this.databaseService.query(
      `UPDATE dbo.formapagamento
        SET ${updates.join(', ')}
        WHERE id = $${paramCount}
        RETURNING id, descricao as description, codigo as code, tipo as type,
                ativo as active, created_at as "createdAt", updated_at as "updatedAt"`,
      values,
    );

    return result.rows[0];
  }

  async remove(id: string): Promise<void> {
    // First check if payment method exists
    await this.findOne(id);

    // Check if the payment method is in use by any parcela records
    const usageCheck = await this.databaseService.query(
      `SELECT 1 FROM dbo.parcela WHERE forma_pagamento_id = $1 LIMIT 1`,
      [id],
    );

    if (usageCheck.rowCount > 0) {
      // If it's in use, mark as inactive instead of deleting
      await this.databaseService.query(
        `UPDATE dbo.formapagamento SET ativo = false WHERE id = $1`,
        [id],
      );
    } else {
      // If not in use, delete the record
      await this.databaseService.query(
        `DELETE FROM dbo.formapagamento WHERE id = $1`,
        [id],
      );
    }
  }
}
