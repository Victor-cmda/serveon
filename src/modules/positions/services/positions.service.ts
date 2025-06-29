import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Position } from '../entities/position.entity';

@Injectable()
export class PositionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createPositionDto: CreatePositionDto): Promise<Position> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se cargo já existe
        const existingPosition = await client.query(
          'SELECT id FROM dbo.cargo WHERE LOWER(nome) = LOWER($1)',
          [createPositionDto.nome],
        );

        if (existingPosition.rowCount > 0) {
          throw new ConflictException(
            `Cargo com nome '${createPositionDto.nome}' já existe`,
          );
        }

        // Verificar se o departamento existe (se fornecido)
        if (createPositionDto.departamentoId) {
          const departmentExists = await client.query(
            'SELECT id FROM dbo.departamento WHERE id = $1',
            [createPositionDto.departamentoId],
          );

          if (departmentExists.rowCount === 0) {
            throw new NotFoundException(
              `Departamento com ID ${createPositionDto.departamentoId} não encontrado`,
            );
          }
        }

        // Inserir o novo cargo
        const result = await client.query(
          `INSERT INTO dbo.cargo (nome, descricao, departamento_id, ativo)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [
            createPositionDto.nome,
            createPositionDto.descricao || null,
            createPositionDto.departamentoId || null,
            true,
          ],
        );

        await client.query('COMMIT');

        // Buscar as informações adicionais do cargo
        return this.enrichPositionData(client, result.rows[0]);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('Erro ao criar cargo:', error);
      throw new InternalServerErrorException('Erro ao criar cargo');
    }
  }

  async findAll(): Promise<Position[]> {
    try {
      const client = await this.databaseService.getClient();
      try {
        const result = await client.query(`
          SELECT c.*, d.nome as departamento_nome
          FROM dbo.cargo c
          LEFT JOIN dbo.departamento d ON c.departamento_id = d.id
          ORDER BY c.nome ASC
        `);

        return result.rows.map((row) => this.mapRowToPosition(row));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao buscar cargos:', error);
      throw new InternalServerErrorException('Erro ao buscar cargos');
    }
  }

  async findOne(id: number): Promise<Position> {
    try {
      const client = await this.databaseService.getClient();
      try {
        const result = await client.query(
          `
          SELECT c.*, d.nome as departamento_nome
          FROM dbo.cargo c
          LEFT JOIN dbo.departamento d ON c.departamento_id = d.id
          WHERE c.id = $1
        `,
          [id],
        );

        if (result.rowCount === 0) {
          throw new NotFoundException(`Cargo com ID ${id} não encontrado`);
        }

        return this.mapRowToPosition(result.rows[0]);
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error(`Erro ao buscar cargo com ID ${id}:`, error);
      throw new InternalServerErrorException(
        `Erro ao buscar cargo com ID ${id}`,
      );
    }
  }

  async findByDepartment(departamentoId: number): Promise<Position[]> {
    try {
      const client = await this.databaseService.getClient();
      try {
        const result = await client.query(
          `
          SELECT c.*, d.nome as departamento_nome
          FROM dbo.cargo c
          LEFT JOIN dbo.departamento d ON c.departamento_id = d.id
          WHERE c.departamento_id = $1 AND c.ativo = true
          ORDER BY c.nome ASC
        `,
          [departamentoId],
        );

        return result.rows.map((row) => this.mapRowToPosition(row));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(
        `Erro ao buscar cargos do departamento ${departamentoId}:`,
        error,
      );
      throw new InternalServerErrorException(
        `Erro ao buscar cargos do departamento ${departamentoId}`,
      );
    }
  }

  async update(
    id: number,
    updatePositionDto: UpdatePositionDto,
  ): Promise<Position> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se o cargo existe
        const existingPosition = await client.query(
          'SELECT id FROM dbo.cargo WHERE id = $1',
          [id],
        );

        if (existingPosition.rowCount === 0) {
          throw new NotFoundException(`Cargo com ID ${id} não encontrado`);
        }

        // Verificar se o nome já está sendo usado por outro cargo
        if (updatePositionDto.nome) {
          const duplicateCheck = await client.query(
            'SELECT id FROM dbo.cargo WHERE LOWER(nome) = LOWER($1) AND id != $2',
            [updatePositionDto.nome, id],
          );

          if (duplicateCheck.rowCount > 0) {
            throw new ConflictException(
              `Outro cargo com nome '${updatePositionDto.nome}' já existe`,
            );
          }
        }

        // Verificar se o departamento existe (se fornecido)
        if (updatePositionDto.departamentoId) {
          const departmentExists = await client.query(
            'SELECT id FROM dbo.departamento WHERE id = $1',
            [updatePositionDto.departamentoId],
          );

          if (departmentExists.rowCount === 0) {
            throw new NotFoundException(
              `Departamento com ID ${updatePositionDto.departamentoId} não encontrado`,
            );
          }
        }

        // Construir a consulta de atualização dinamicamente
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramCounter = 1;

        if (updatePositionDto.nome !== undefined) {
          updateFields.push(`nome = $${paramCounter++}`);
          updateValues.push(updatePositionDto.nome);
        }

        if (updatePositionDto.descricao !== undefined) {
          updateFields.push(`descricao = $${paramCounter++}`);
          updateValues.push(updatePositionDto.descricao);
        }

        if (updatePositionDto.departamentoId !== undefined) {
          updateFields.push(`departamento_id = $${paramCounter++}`);
          updateValues.push(updatePositionDto.departamentoId);
        }

        if (updatePositionDto.ativo !== undefined) {
          updateFields.push(`ativo = $${paramCounter++}`);
          updateValues.push(updatePositionDto.ativo);
        }

        // Sempre atualizar o campo updated_at
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

        // Adicionar o ID como último parâmetro
        updateValues.push(id);

        // Executar a atualização
        const updateQuery = `
          UPDATE dbo.cargo
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCounter}
          RETURNING *
        `;

        const result = await client.query(updateQuery, updateValues);

        await client.query('COMMIT');

        // Buscar as informações adicionais do cargo
        return this.enrichPositionData(client, result.rows[0]);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error(`Erro ao atualizar cargo com ID ${id}:`, error);
      throw new InternalServerErrorException(
        `Erro ao atualizar cargo com ID ${id}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se o cargo existe
        const existingPosition = await client.query(
          'SELECT id FROM dbo.cargo WHERE id = $1',
          [id],
        );

        if (existingPosition.rowCount === 0) {
          throw new NotFoundException(`Cargo com ID ${id} não encontrado`);
        }

        // Verificar se o cargo está sendo usado por funcionários
        const usageCheck = await client.query(
          'SELECT COUNT(*) as count FROM dbo.funcionario WHERE cargo_id = $1',
          [id],
        );

        if (parseInt(usageCheck.rows[0].count) > 0) {
          throw new ConflictException(
            'Não é possível excluir o cargo pois existem funcionários vinculados a ele',
          );
        }

        // Remover o cargo
        await client.query('DELETE FROM dbo.cargo WHERE id = $1', [id]);

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      console.error(`Erro ao remover cargo com ID ${id}:`, error);
      throw new InternalServerErrorException(
        `Erro ao remover cargo com ID ${id}`,
      );
    }
  }

  private async enrichPositionData(
    client: any,
    positionData: any,
  ): Promise<Position> {
    // Se o cargo tem departamento, buscar informações do departamento
    if (positionData.departamento_id) {
      const departmentResult = await client.query(
        'SELECT nome FROM dbo.departamento WHERE id = $1',
        [positionData.departamento_id],
      );

      if (departmentResult.rowCount > 0) {
        positionData.departamento_nome = departmentResult.rows[0].nome;
      }
    }

    return this.mapRowToPosition(positionData);
  }

  private mapRowToPosition(row: any): Position {
    return {
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      departamentoId: row.departamento_id,
      departamentoNome: row.departamento_nome,
      ativo: row.ativo,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
