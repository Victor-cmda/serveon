import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Department } from '../entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    try {
      const client = await this.databaseService.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Verificar se departamento já existe
        const existingDepartment = await client.query(
          'SELECT id FROM dbo.departamento WHERE LOWER(nome) = LOWER($1)',
          [createDepartmentDto.nome]
        );

        if (existingDepartment.rowCount > 0) {
          throw new ConflictException(`Departamento com nome '${createDepartmentDto.nome}' já existe`);
        }
        
        // Inserir o novo departamento
        const result = await client.query(
          `INSERT INTO dbo.departamento (nome, descricao, ativo)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [
            createDepartmentDto.nome,
            createDepartmentDto.descricao || null,
            true
          ]
        );
        
        await client.query('COMMIT');
        return this.mapRowToDepartment(result.rows[0]);
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
      
      console.error('Erro ao criar departamento:', error);
      throw new InternalServerErrorException('Erro ao criar departamento');
    }
  }

  async findAll(): Promise<Department[]> {
    try {
      const client = await this.databaseService.getClient();
      try {
        const result = await client.query(`
          SELECT * FROM dbo.departamento
          ORDER BY nome ASC
        `);
        
        return result.rows.map(row => this.mapRowToDepartment(row));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao buscar departamentos:', error);
      throw new InternalServerErrorException('Erro ao buscar departamentos');
    }
  }

  async findOne(id: number): Promise<Department> {
    try {
      const client = await this.databaseService.getClient();
      try {
        const result = await client.query(
          'SELECT * FROM dbo.departamento WHERE id = $1',
          [id]
        );
        
        if (result.rowCount === 0) {
          throw new NotFoundException(`Departamento com ID ${id} não encontrado`);
        }
        
        return this.mapRowToDepartment(result.rows[0]);
      } finally {
        client.release();
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      console.error(`Erro ao buscar departamento com ID ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar departamento com ID ${id}`);
    }
  }

  async update(id: number, updateDepartmentDto: UpdateDepartmentDto): Promise<Department> {
    try {
      const client = await this.databaseService.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Verificar se o departamento existe
        const existingDepartment = await client.query(
          'SELECT id FROM dbo.departamento WHERE id = $1',
          [id]
        );

        if (existingDepartment.rowCount === 0) {
          throw new NotFoundException(`Departamento com ID ${id} não encontrado`);
        }
        
        // Verificar se o nome já está sendo usado por outro departamento
        if (updateDepartmentDto.nome) {
          const duplicateCheck = await client.query(
            'SELECT id FROM dbo.departamento WHERE LOWER(nome) = LOWER($1) AND id != $2',
            [updateDepartmentDto.nome, id]
          );
          
          if (duplicateCheck.rowCount > 0) {
            throw new ConflictException(`Outro departamento com nome '${updateDepartmentDto.nome}' já existe`);
          }
        }
        
        // Construir a consulta de atualização dinamicamente
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramCounter = 1;
        
        if (updateDepartmentDto.nome !== undefined) {
          updateFields.push(`nome = $${paramCounter++}`);
          updateValues.push(updateDepartmentDto.nome);
        }
        
        if (updateDepartmentDto.descricao !== undefined) {
          updateFields.push(`descricao = $${paramCounter++}`);
          updateValues.push(updateDepartmentDto.descricao);
        }
        
        if (updateDepartmentDto.ativo !== undefined) {
          updateFields.push(`ativo = $${paramCounter++}`);
          updateValues.push(updateDepartmentDto.ativo);
        }
        
        // Sempre atualizar o campo updated_at
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        
        // Adicionar o ID como último parâmetro
        updateValues.push(id);
        
        // Executar a atualização
        const updateQuery = `
          UPDATE dbo.departamento
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCounter}
          RETURNING *
        `;
        
        const result = await client.query(updateQuery, updateValues);
        
        await client.query('COMMIT');
        return this.mapRowToDepartment(result.rows[0]);
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
      
      console.error(`Erro ao atualizar departamento com ID ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao atualizar departamento com ID ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();
      
      try {
        await client.query('BEGIN');
        
        // Verificar se o departamento existe
        const existingDepartment = await client.query(
          'SELECT id FROM dbo.departamento WHERE id = $1',
          [id]
        );

        if (existingDepartment.rowCount === 0) {
          throw new NotFoundException(`Departamento com ID ${id} não encontrado`);
        }
        
        // Verificar se o departamento está sendo usado por funcionários
        const usageCheck = await client.query(
          'SELECT COUNT(*) as count FROM dbo.funcionario WHERE departamento_id = $1',
          [id]
        );
        
        if (parseInt(usageCheck.rows[0].count) > 0) {
          throw new ConflictException('Não é possível excluir o departamento pois existem funcionários vinculados a ele');
        }
        
        // Remover o departamento
        await client.query('DELETE FROM dbo.departamento WHERE id = $1', [id]);
        
        await client.query('COMMIT');
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
      
      console.error(`Erro ao remover departamento com ID ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao remover departamento com ID ${id}`);
    }
  }

  private mapRowToDepartment(row: any): Department {
    return {
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      ativo: row.ativo,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
