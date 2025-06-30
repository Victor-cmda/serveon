import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Country } from '../entities/country.entity';

@Injectable()
export class CountriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCountryDto: CreateCountryDto): Promise<Country> {
    try {
      const existingCodeCountry = await this.databaseService.query(
        'SELECT id FROM dbo.pais WHERE codigo = $1',
        [createCountryDto.codigo],
      );

      if (existingCodeCountry.rowCount > 0) {
        throw new ConflictException(
          `País com código ${createCountryDto.codigo} já existe`,
        );
      }

      const existingSiglaCountry = await this.databaseService.query(
        'SELECT id FROM dbo.pais WHERE sigla = $1',
        [createCountryDto.sigla],
      );

      if (existingSiglaCountry.rowCount > 0) {
        throw new ConflictException(
          `País com sigla ${createCountryDto.sigla} já existe`,
        );
      }

      const result = await this.databaseService.query(
        `INSERT INTO dbo.pais
                    (nome, codigo, sigla, ativo)
                VALUES
                    ($1, $2, $3, $4)
                RETURNING *`,
        [
          createCountryDto.nome,
          createCountryDto.codigo,
          createCountryDto.sigla,
          createCountryDto.ativo ?? true,
        ],
      );

      return this.mapToCountryEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Erro ao criar país:', error);
      throw new InternalServerErrorException('Erro ao criar país');
    }
  }

  async findAll(): Promise<Country[]> {
    try {
      const result = await this.databaseService.query(`
        SELECT * FROM dbo.pais
        ORDER BY nome
      `);

      return result.rows.map((row) => this.mapToCountryEntity(row));
    } catch (error) {
      console.error('Erro ao buscar países:', error);
      throw new InternalServerErrorException('Erro ao buscar países');
    }
  }
  async findOne(id: number): Promise<Country> {
    try {
      const result = await this.databaseService.query(
        'SELECT * FROM dbo.pais WHERE id = $1',
        [id],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`País com ID ${id} não encontrado`);
      }

      return this.mapToCountryEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar país ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar país ${id}`);
    }
  }

  async findByCode(code: string): Promise<Country> {
    try {
      const result = await this.databaseService.query(
        'SELECT * FROM dbo.pais WHERE codigo = $1',
        [code],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`País com código ${code} não encontrado`);
      }

      return this.mapToCountryEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar país com código ${code}:`, error);
      throw new InternalServerErrorException(
        `Erro ao buscar país com código ${code}`,
      );
    }
  }

  async findBySigla(sigla: string): Promise<Country> {
    try {
      const result = await this.databaseService.query(
        'SELECT * FROM dbo.pais WHERE sigla = $1',
        [sigla],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`País com sigla ${sigla} não encontrado`);
      }

      return this.mapToCountryEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar país com sigla ${sigla}:`, error);
      throw new InternalServerErrorException(
        `Erro ao buscar país com sigla ${sigla}`,
      );
    }
  }

  async update(
    id: number,
    updateCountryDto: UpdateCountryDto,
  ): Promise<Country> {
    try {
      const existingCountry = await this.databaseService.query(
        'SELECT id FROM dbo.pais WHERE id = $1',
        [id],
      );

      if (existingCountry.rowCount === 0) {
        throw new NotFoundException(`País com ID ${id} não encontrado`);
      }

      if (updateCountryDto.codigo) {
        const existingCode = await this.databaseService.query(
          'SELECT id FROM dbo.pais WHERE codigo = $1 AND id != $2',
          [updateCountryDto.codigo, id],
        );

        if (existingCode.rowCount > 0) {
          throw new ConflictException(
            `País com código ${updateCountryDto.codigo} já existe`,
          );
        }
      }

      if (updateCountryDto.sigla) {
        const existingSigla = await this.databaseService.query(
          'SELECT id FROM dbo.pais WHERE sigla = $1 AND id != $2',
          [updateCountryDto.sigla, id],
        );

        if (existingSigla.rowCount > 0) {
          throw new ConflictException(
            `País com sigla ${updateCountryDto.sigla} já existe`,
          );
        }
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      if (updateCountryDto.nome !== undefined) {
        updates.push(`nome = $${paramCounter++}`);
        values.push(updateCountryDto.nome);
      }

      if (updateCountryDto.codigo !== undefined) {
        updates.push(`codigo = $${paramCounter++}`);
        values.push(updateCountryDto.codigo);
      }

      if (updateCountryDto.sigla !== undefined) {
        updates.push(`sigla = $${paramCounter++}`);
        values.push(updateCountryDto.sigla);
      }

      if (updateCountryDto.ativo !== undefined) {
        updates.push(`ativo = $${paramCounter++}`);
        values.push(updateCountryDto.ativo);
      }

      if (updates.length === 0) {
        return this.findOne(id);
      }

      values.push(id);

      const updateQuery = `
        UPDATE dbo.pais
        SET ${updates.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING *
      `;

      const result = await this.databaseService.query(updateQuery, values);
      return this.mapToCountryEntity(result.rows[0]);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error(`Erro ao atualizar país ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao atualizar país ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const existingCountry = await this.databaseService.query(
        'SELECT id FROM dbo.pais WHERE id = $1',
        [id],
      );

      if (existingCountry.rowCount === 0) {
        throw new NotFoundException(`País com ID ${id} não encontrado`);
      }

      const hasEstados = await this.databaseService.query(
        'SELECT id FROM dbo.estado WHERE pais_id = $1 LIMIT 1',
        [id],
      );

      if (hasEstados.rowCount > 0) {
        throw new ConflictException(
          `Não é possível excluir o país pois ele possui estados vinculados`,
        );
      }

      await this.databaseService.query('DELETE FROM dbo.pais WHERE id = $1', [
        id,
      ]);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error(`Erro ao remover país ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao remover país ${id}`);
    }
  }

  private mapToCountryEntity(dbRecord: any): Country {
    return {
      id: dbRecord.id,
      nome: dbRecord.nome,
      codigo: dbRecord.codigo,
      sigla: dbRecord.sigla,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
      ativo: dbRecord.ativo
    };
  }
}
