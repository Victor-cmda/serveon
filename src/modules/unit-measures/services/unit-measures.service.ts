import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateUnitMeasureDto } from '../dto/create-unit-measure.dto';
import { UpdateUnitMeasureDto } from '../dto/update-unit-measure.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { UnitMeasure } from '../entities/unit-measure.entity';

@Injectable()
export class UnitMeasuresService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(
    createUnitMeasureDto: CreateUnitMeasureDto,
  ): Promise<UnitMeasure> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se unidade de medida já existe
        const existingUnitMeasure = await client.query(
          'SELECT id FROM dbo.unidade_medida WHERE UPPER(sigla) = UPPER($1)',
          [createUnitMeasureDto.sigla],
        );

        if (existingUnitMeasure.rowCount > 0) {
          throw new ConflictException(
            `Unidade de medida '${createUnitMeasureDto.sigla}' já existe`,
          );
        }

        // Inserir a nova unidade de medida
        const result = await client.query(
          `INSERT INTO dbo.unidade_medida (sigla, descricao, ativo)
          VALUES ($1, $2, $3)
          RETURNING *`,
          [
            createUnitMeasureDto.sigla.toUpperCase(),
            createUnitMeasureDto.descricao || null,
            createUnitMeasureDto.ativo !== undefined
              ? createUnitMeasureDto.ativo
              : true,
          ],
        );

        await client.query('COMMIT');

        const createdUnitMeasure = result.rows[0];
        return this.mapDatabaseToEntity(createdUnitMeasure);
      } catch (error) {
        await client.query('ROLLBACK');

        if (error instanceof ConflictException) {
          throw error;
        }

        console.error('Erro ao criar unidade de medida:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao criar unidade de medida',
        );
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException(
        'Erro de conexão com banco de dados',
      );
    }
  }

  async findAll(): Promise<UnitMeasure[]> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(`
          SELECT * FROM dbo.unidade_medida
          ORDER BY sigla ASC
        `);

        return result.rows.map((row) => this.mapDatabaseToEntity(row));
      } catch (error) {
        console.error('Erro ao buscar unidades de medida:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao buscar unidades de medida',
        );
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException(
        'Erro de conexão com banco de dados',
      );
    }
  }

  async findOne(id: number): Promise<UnitMeasure> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(
          `
          SELECT * FROM dbo.unidade_medida WHERE id = $1
        `,
          [id],
        );

        if (result.rowCount === 0) {
          throw new NotFoundException(
            `Unidade de medida com ID ${id} não encontrada`,
          );
        }

        return this.mapDatabaseToEntity(result.rows[0]);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        console.error('Erro ao buscar unidade de medida:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao buscar unidade de medida',
        );
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException(
        'Erro de conexão com banco de dados',
      );
    }
  }

  async update(
    id: number,
    updateUnitMeasureDto: UpdateUnitMeasureDto,
  ): Promise<UnitMeasure> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a unidade de medida existe
        const existingUnitMeasure = await client.query(
          'SELECT id FROM dbo.unidade_medida WHERE id = $1',
          [id],
        );

        if (existingUnitMeasure.rowCount === 0) {
          throw new NotFoundException(
            `Unidade de medida com ID ${id} não encontrada`,
          );
        }

        // Verificar se sigla não conflita com outra unidade de medida (se fornecida)
        if (updateUnitMeasureDto.sigla) {
          const siglaConflict = await client.query(
            'SELECT id FROM dbo.unidade_medida WHERE UPPER(sigla) = UPPER($1) AND id != $2',
            [updateUnitMeasureDto.sigla, id],
          );

          if (siglaConflict.rowCount > 0) {
            throw new ConflictException(
              `Sigla '${updateUnitMeasureDto.sigla}' já está sendo usada por outra unidade de medida`,
            );
          }
        }

        // Construir query de atualização dinamicamente
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramCounter = 1;

        if (updateUnitMeasureDto.sigla !== undefined) {
          updateFields.push(`sigla = $${paramCounter}`);
          updateValues.push(updateUnitMeasureDto.sigla.toUpperCase());
          paramCounter++;
        }

        if (updateUnitMeasureDto.descricao !== undefined) {
          updateFields.push(`descricao = $${paramCounter}`);
          updateValues.push(updateUnitMeasureDto.descricao);
          paramCounter++;
        }

        if (updateUnitMeasureDto.ativo !== undefined) {
          updateFields.push(`ativo = $${paramCounter}`);
          updateValues.push(updateUnitMeasureDto.ativo);
          paramCounter++;
        }

        if (updateFields.length === 0) {
          throw new BadRequestException(
            'Nenhum campo válido fornecido para atualização',
          );
        }

        updateValues.push(id); // Para o WHERE

        const updateQuery = `
          UPDATE dbo.unidade_medida 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCounter}
          RETURNING *
        `;

        const result = await client.query(updateQuery, updateValues);

        await client.query('COMMIT');

        const updatedUnitMeasure = result.rows[0];
        return this.mapDatabaseToEntity(updatedUnitMeasure);
      } catch (error) {
        await client.query('ROLLBACK');

        if (
          error instanceof NotFoundException ||
          error instanceof ConflictException ||
          error instanceof BadRequestException
        ) {
          throw error;
        }

        console.error('Erro ao atualizar unidade de medida:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao atualizar unidade de medida',
        );
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException(
        'Erro de conexão com banco de dados',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a unidade de medida existe
        const existingUnitMeasure = await client.query(
          'SELECT id FROM dbo.unidade_medida WHERE id = $1',
          [id],
        );

        if (existingUnitMeasure.rowCount === 0) {
          throw new NotFoundException(
            `Unidade de medida com ID ${id} não encontrada`,
          );
        }

        // Verificar se unidade de medida está sendo usada por produtos
        const productsUsingUnitMeasure = await client.query(
          'SELECT id FROM dbo.produto WHERE unidade_medida_id = $1 AND ativo = true',
          [id],
        );

        if (productsUsingUnitMeasure.rowCount > 0) {
          throw new ConflictException(
            'Não é possível remover unidade de medida que está sendo usada por produtos ativos',
          );
        }

        // Fazer soft delete (marcar como inativo)
        await client.query(
          'UPDATE dbo.unidade_medida SET ativo = false WHERE id = $1',
          [id],
        );

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');

        if (
          error instanceof NotFoundException ||
          error instanceof ConflictException
        ) {
          throw error;
        }

        console.error('Erro ao remover unidade de medida:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao remover unidade de medida',
        );
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException(
        'Erro de conexão com banco de dados',
      );
    }
  }

  private mapDatabaseToEntity(row: any): UnitMeasure {
    return {
      id: row.id,
      sigla: row.sigla,
      descricao: row.descricao,
      ativo: row.ativo,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  }
}
