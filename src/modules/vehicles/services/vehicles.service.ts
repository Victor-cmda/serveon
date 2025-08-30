import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Vehicle } from '../entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se placa já existe
        const existingResult = await client.query(
          'SELECT id FROM dbo.veiculo WHERE placa = $1',
          [createVehicleDto.placa],
        );

        if (existingResult.rowCount > 0) {
          throw new ConflictException(
            `Veículo com placa ${createVehicleDto.placa} já existe`,
          );
        }

        // Inserir novo veículo
        const result = await client.query(
          `INSERT INTO dbo.veiculo
            (placa, modelo, marca, ano, capacidade, ativo)
          VALUES
            ($1, $2, $3, $4, $5, $6)
          RETURNING *`,
          [
            createVehicleDto.placa,
            createVehicleDto.modelo,
            createVehicleDto.marca,
            createVehicleDto.ano,
            createVehicleDto.capacidadeCarga || null,
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
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Erro ao criar veículo:', error);
      throw new InternalServerErrorException('Erro ao criar veículo');
    }
  }

  async findAll(): Promise<Vehicle[]> {
    try {
      const result = await this.databaseService.query(`
        SELECT * FROM dbo.veiculo
        WHERE ativo = true
        ORDER BY placa
      `);

      return result.rows.map(row => this.mapToEntity(row));
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      throw new InternalServerErrorException('Erro ao buscar veículos');
    }
  }

  async findOne(id: number): Promise<Vehicle> {
    try {
      const result = await this.databaseService.query(
        'SELECT * FROM dbo.veiculo WHERE id = $1 AND ativo = true',
        [id],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
      }

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar veículo ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar veículo`);
    }
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se o veículo existe
        const existsResult = await client.query(
          'SELECT id FROM dbo.veiculo WHERE id = $1 AND ativo = true',
          [id],
        );

        if (existsResult.rowCount === 0) {
          throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
        }

        // Construir query de atualização
        const updates: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (updateVehicleDto.placa !== undefined) {
          // Verificar se a nova placa já existe em outro veículo
          const placaExists = await client.query(
            'SELECT id FROM dbo.veiculo WHERE placa = $1 AND id != $2',
            [updateVehicleDto.placa, id],
          );
          
          if (placaExists.rowCount > 0) {
            throw new ConflictException(
              `Placa ${updateVehicleDto.placa} já está sendo usada por outro veículo`,
            );
          }

          updates.push(`placa = $${paramCounter++}`);
          values.push(updateVehicleDto.placa);
        }

        if (updateVehicleDto.marca !== undefined) {
          updates.push(`marca = $${paramCounter++}`);
          values.push(updateVehicleDto.marca);
        }

        if (updateVehicleDto.modelo !== undefined) {
          updates.push(`modelo = $${paramCounter++}`);
          values.push(updateVehicleDto.modelo);
        }

        if (updateVehicleDto.ano !== undefined) {
          updates.push(`ano = $${paramCounter++}`);
          values.push(updateVehicleDto.ano);
        }

        if (updateVehicleDto.capacidadeCarga !== undefined) {
          updates.push(`capacidade = $${paramCounter++}`);
          values.push(updateVehicleDto.capacidadeCarga);
        }

        if (updates.length > 0) {
          values.push(id);
          const updateQuery = `
            UPDATE dbo.veiculo
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
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      console.error(`Erro ao atualizar veículo ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao atualizar veículo`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se existe
        const existsResult = await client.query(
          'SELECT id FROM dbo.veiculo WHERE id = $1 AND ativo = true',
          [id],
        );

        if (existsResult.rowCount === 0) {
          throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
        }

        // Verificar se há dependências (NFes, entregas, etc.)
        const hasReferences = await client.query(
          `SELECT COUNT(*) as count FROM (
            SELECT id FROM dbo.nfe WHERE veiculo_id = $1
            UNION ALL
            SELECT id FROM dbo.entrega_venda WHERE veiculo_id = $1
          ) refs`,
          [id],
        );

        if (parseInt(hasReferences.rows[0].count) > 0) {
          // Se há dependências, apenas inativa
          await client.query(
            'UPDATE dbo.veiculo SET ativo = false WHERE id = $1',
            [id],
          );
        } else {
          // Se não há dependências, remove
          await client.query('DELETE FROM dbo.veiculo WHERE id = $1', [id]);
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
      console.error(`Erro ao remover veículo ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao remover veículo`);
    }
  }

  private mapToEntity(dbRecord: any): Vehicle {
    return {
      id: dbRecord.id,
      placa: dbRecord.placa,
      marca: dbRecord.marca,
      modelo: dbRecord.modelo,
      ano: dbRecord.ano,
      cor: undefined, // Não disponível na tabela atual
      tipo: 'CAMINHAO', // Definindo um padrão já que não está na tabela
      capacidadeCarga: dbRecord.capacidade ? parseFloat(dbRecord.capacidade) : undefined,
      observacoes: undefined, // Não disponível na tabela atual
      ativo: dbRecord.ativo,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }
}
