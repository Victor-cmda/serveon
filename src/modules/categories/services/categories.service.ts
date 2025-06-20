import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const client = await this.databaseService.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Verificar se categoria já existe
        const existingCategory = await client.query(
          'SELECT id FROM dbo.categoria WHERE LOWER(nome) = LOWER($1)',
          [createCategoryDto.nome]
        );

        if (existingCategory.rowCount > 0) {
          throw new ConflictException(`Categoria '${createCategoryDto.nome}' já existe`);
        }

        // Inserir a nova categoria
        const result = await client.query(
          `INSERT INTO dbo.categoria (nome, descricao, ativo)
          VALUES ($1, $2, $3)
          RETURNING *`,
          [
            createCategoryDto.nome,
            createCategoryDto.descricao || null,
            createCategoryDto.ativo !== undefined ? createCategoryDto.ativo : true
          ]
        );

        await client.query('COMMIT');
        
        const createdCategory = result.rows[0];
        return this.mapDatabaseToEntity(createdCategory);
        
      } catch (error) {
        await client.query('ROLLBACK');
        
        if (error instanceof ConflictException) {
          throw error;
        }
        
        console.error('Erro ao criar categoria:', error);
        throw new InternalServerErrorException('Erro interno do servidor ao criar categoria');
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof ConflictException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException('Erro de conexão com banco de dados');
    }
  }

  async findAll(): Promise<Category[]> {
    try {
      const client = await this.databaseService.getClient();
      
      try {
        const result = await client.query(`
          SELECT * FROM dbo.categoria
          ORDER BY nome ASC
        `);
        
        return result.rows.map(row => this.mapDatabaseToEntity(row));
        
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        throw new InternalServerErrorException('Erro interno do servidor ao buscar categorias');
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException('Erro de conexão com banco de dados');
    }
  }

  async findOne(id: number): Promise<Category> {
    try {
      const client = await this.databaseService.getClient();
      
      try {
        const result = await client.query(`
          SELECT * FROM dbo.categoria WHERE id = $1
        `, [id]);
        
        if (result.rowCount === 0) {
          throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
        }
        
        return this.mapDatabaseToEntity(result.rows[0]);
        
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        
        console.error('Erro ao buscar categoria:', error);
        throw new InternalServerErrorException('Erro interno do servidor ao buscar categoria');
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException('Erro de conexão com banco de dados');
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    try {
      const client = await this.databaseService.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Verificar se a categoria existe
        const existingCategory = await client.query(
          'SELECT id FROM dbo.categoria WHERE id = $1',
          [id]
        );

        if (existingCategory.rowCount === 0) {
          throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
        }

        // Verificar se nome não conflita com outra categoria (se fornecido)
        if (updateCategoryDto.nome) {
          const nameConflict = await client.query(
            'SELECT id FROM dbo.categoria WHERE LOWER(nome) = LOWER($1) AND id != $2',
            [updateCategoryDto.nome, id]
          );

          if (nameConflict.rowCount > 0) {
            throw new ConflictException(`Nome '${updateCategoryDto.nome}' já está sendo usado por outra categoria`);
          }
        }

        // Construir query de atualização dinamicamente
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramCounter = 1;

        if (updateCategoryDto.nome !== undefined) {
          updateFields.push(`nome = $${paramCounter}`);
          updateValues.push(updateCategoryDto.nome);
          paramCounter++;
        }

        if (updateCategoryDto.descricao !== undefined) {
          updateFields.push(`descricao = $${paramCounter}`);
          updateValues.push(updateCategoryDto.descricao);
          paramCounter++;
        }

        if (updateCategoryDto.ativo !== undefined) {
          updateFields.push(`ativo = $${paramCounter}`);
          updateValues.push(updateCategoryDto.ativo);
          paramCounter++;
        }

        if (updateFields.length === 0) {
          throw new BadRequestException('Nenhum campo válido fornecido para atualização');
        }

        updateValues.push(id); // Para o WHERE
        
        const updateQuery = `
          UPDATE dbo.categoria 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCounter}
          RETURNING *
        `;

        const result = await client.query(updateQuery, updateValues);
        
        await client.query('COMMIT');
        
        const updatedCategory = result.rows[0];
        return this.mapDatabaseToEntity(updatedCategory);
        
      } catch (error) {
        await client.query('ROLLBACK');
        
        if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
          throw error;
        }
        
        console.error('Erro ao atualizar categoria:', error);
        throw new InternalServerErrorException('Erro interno do servidor ao atualizar categoria');
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || 
          error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException('Erro de conexão com banco de dados');
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Verificar se a categoria existe
        const existingCategory = await client.query(
          'SELECT id FROM dbo.categoria WHERE id = $1',
          [id]
        );

        if (existingCategory.rowCount === 0) {
          throw new NotFoundException(`Categoria com ID ${id} não encontrada`);
        }

        // Verificar se categoria está sendo usada por produtos
        const productsUsingCategory = await client.query(
          'SELECT id FROM dbo.produto WHERE categoria_id = $1 AND ativo = true',
          [id]
        );

        if (productsUsingCategory.rowCount > 0) {
          throw new ConflictException('Não é possível remover categoria que está sendo usada por produtos ativos');
        }

        // Fazer soft delete (marcar como inativo)
        await client.query(
          'UPDATE dbo.categoria SET ativo = false WHERE id = $1',
          [id]
        );
        
        await client.query('COMMIT');
        
      } catch (error) {
        await client.query('ROLLBACK');
        
        if (error instanceof NotFoundException || error instanceof ConflictException) {
          throw error;
        }
        
        console.error('Erro ao remover categoria:', error);
        throw new InternalServerErrorException('Erro interno do servidor ao remover categoria');
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || 
          error instanceof InternalServerErrorException) {
        throw error;
      }
      
      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException('Erro de conexão com banco de dados');
    }
  }

  private mapDatabaseToEntity(row: any): Category {
    return {
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      ativo: row.ativo,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString()
    };
  }
}
