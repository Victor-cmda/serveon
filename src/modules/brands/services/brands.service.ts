import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class BrandsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se marca já existe
        const existingBrand = await client.query(
          'SELECT id FROM dbo.marca WHERE LOWER(nome) = LOWER($1)',
          [createBrandDto.nome],
        );

        if (existingBrand.rowCount > 0) {
          throw new ConflictException(
            `Marca '${createBrandDto.nome}' já existe`,
          );
        }

        // Inserir a nova marca
        const result = await client.query(
          `INSERT INTO dbo.marca (nome, descricao, ativo)
          VALUES ($1, $2, $3)
          RETURNING *`,
          [
            createBrandDto.nome,
            createBrandDto.descricao || null,
            createBrandDto.ativo !== undefined ? createBrandDto.ativo : true,
          ],
        );

        await client.query('COMMIT');

        const createdBrand = result.rows[0];
        return this.mapDatabaseToEntity(createdBrand);
      } catch (error) {
        await client.query('ROLLBACK');

        if (error instanceof ConflictException) {
          throw error;
        }

        console.error('Erro ao criar marca:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao criar marca',
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

  async findAll(): Promise<Brand[]> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(`
          SELECT * FROM dbo.marca
          ORDER BY nome ASC
        `);

        return result.rows.map((row) => this.mapDatabaseToEntity(row));
      } catch (error) {
        console.error('Erro ao buscar marcas:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao buscar marcas',
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

  async findOne(id: number): Promise<Brand> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(
          `
          SELECT * FROM dbo.marca WHERE id = $1
        `,
          [id],
        );

        if (result.rowCount === 0) {
          throw new NotFoundException(`Marca com ID ${id} não encontrada`);
        }

        return this.mapDatabaseToEntity(result.rows[0]);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        console.error('Erro ao buscar marca:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao buscar marca',
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

  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a marca existe
        const existingBrand = await client.query(
          'SELECT id FROM dbo.marca WHERE id = $1',
          [id],
        );

        if (existingBrand.rowCount === 0) {
          throw new NotFoundException(`Marca com ID ${id} não encontrada`);
        }

        // Verificar se nome não conflita com outra marca (se fornecido)
        if (updateBrandDto.nome) {
          const nameConflict = await client.query(
            'SELECT id FROM dbo.marca WHERE LOWER(nome) = LOWER($1) AND id != $2',
            [updateBrandDto.nome, id],
          );

          if (nameConflict.rowCount > 0) {
            throw new ConflictException(
              `Nome '${updateBrandDto.nome}' já está sendo usado por outra marca`,
            );
          }
        }

        // Construir query de atualização dinamicamente
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramCounter = 1;

        if (updateBrandDto.nome !== undefined) {
          updateFields.push(`nome = $${paramCounter}`);
          updateValues.push(updateBrandDto.nome);
          paramCounter++;
        }

        if (updateBrandDto.descricao !== undefined) {
          updateFields.push(`descricao = $${paramCounter}`);
          updateValues.push(updateBrandDto.descricao);
          paramCounter++;
        }

        if (updateBrandDto.ativo !== undefined) {
          updateFields.push(`ativo = $${paramCounter}`);
          updateValues.push(updateBrandDto.ativo);
          paramCounter++;
        }

        if (updateFields.length === 0) {
          throw new BadRequestException(
            'Nenhum campo válido fornecido para atualização',
          );
        }

        updateValues.push(id); // Para o WHERE

        const updateQuery = `
          UPDATE dbo.marca 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCounter}
          RETURNING *
        `;

        const result = await client.query(updateQuery, updateValues);

        await client.query('COMMIT');

        const updatedBrand = result.rows[0];
        return this.mapDatabaseToEntity(updatedBrand);
      } catch (error) {
        await client.query('ROLLBACK');

        if (
          error instanceof NotFoundException ||
          error instanceof ConflictException ||
          error instanceof BadRequestException
        ) {
          throw error;
        }

        console.error('Erro ao atualizar marca:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao atualizar marca',
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

        // Verificar se a marca existe
        const existingBrand = await client.query(
          'SELECT id FROM dbo.marca WHERE id = $1',
          [id],
        );

        if (existingBrand.rowCount === 0) {
          throw new NotFoundException(`Marca com ID ${id} não encontrada`);
        }

        // Verificar se marca está sendo usada por produtos
        const productsUsingBrand = await client.query(
          'SELECT id FROM dbo.produto WHERE marca_id = $1 AND ativo = true',
          [id],
        );

        if (productsUsingBrand.rowCount > 0) {
          throw new ConflictException(
            'Não é possível remover marca que está sendo usada por produtos ativos',
          );
        }

        // Fazer soft delete (marcar como inativo)
        await client.query('UPDATE dbo.marca SET ativo = false WHERE id = $1', [
          id,
        ]);

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');

        if (
          error instanceof NotFoundException ||
          error instanceof ConflictException
        ) {
          throw error;
        }

        console.error('Erro ao remover marca:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao remover marca',
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

  private mapDatabaseToEntity(row: any): Brand {
    return {
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      ativo: row.ativo,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  }
}
