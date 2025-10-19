import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { CreateEmployeeFunctionDto } from '../dto/create-employee-function.dto';
import { UpdateEmployeeFunctionDto } from '../dto/update-employee-function.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { EmployeeFunction } from '../entities/employee-function.entity';

@Injectable()
export class EmployeeFunctionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createEmployeeFunctionDto: CreateEmployeeFunctionDto): Promise<EmployeeFunction> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se função já existe
        const existingResult = await client.query(
          'SELECT id FROM dbo.funcao_funcionario WHERE funcao_funcionario = $1',
          [createEmployeeFunctionDto.nome],
        );

        if (existingResult.rowCount > 0) {
          throw new ConflictException(
            `Função de funcionário '${createEmployeeFunctionDto.nome}' já existe`,
          );
        }

        // Inserir nova função
        const result = await client.query(
          `INSERT INTO dbo.funcao_funcionario
            (funcao_funcionario, descricao, salario_base, carga_horaria, requer_cnh, ativo)
          VALUES
            ($1, $2, $3, $4, $5, $6)
          RETURNING *`,
          [
            createEmployeeFunctionDto.nome,
            createEmployeeFunctionDto.descricao || null,
            2000.00, // Salário base padrão
            44.00, // Carga horária padrão (44h semanais)
            false, // Requer CNH padrão
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
      console.error('Erro ao criar função de funcionário:', error);
      throw new InternalServerErrorException('Erro ao criar função de funcionário');
    }
  }

  async findAll(): Promise<EmployeeFunction[]> {
    try {
      const result = await this.databaseService.query(`
        SELECT 
          id,
          funcao_funcionario,
          descricao,
          salario_base,
          carga_horaria,
          requer_cnh,
          observacao,
          ativo,
          created_at,
          updated_at
        FROM dbo.funcao_funcionario
        WHERE ativo = true
        ORDER BY funcao_funcionario
      `);

      return result.rows.map(row => this.mapToEntity(row));
    } catch (error) {
      console.error('Erro ao buscar funções de funcionário:', error);
      throw new InternalServerErrorException('Erro ao buscar funções de funcionário');
    }
  }

  async findOne(id: number): Promise<EmployeeFunction> {
    try {
      const result = await this.databaseService.query(
        `SELECT 
          id,
          funcao_funcionario,
          descricao,
          salario_base,
          carga_horaria,
          requer_cnh,
          observacao,
          ativo,
          created_at,
          updated_at
        FROM dbo.funcao_funcionario 
        WHERE id = $1 AND ativo = true`,
        [id],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`Função de funcionário com ID ${id} não encontrada`);
      }

      return this.mapToEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar função de funcionário ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao buscar função de funcionário`);
    }
  }

  async update(id: number, updateEmployeeFunctionDto: UpdateEmployeeFunctionDto): Promise<EmployeeFunction> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se a função existe
        const existsResult = await client.query(
          'SELECT id FROM dbo.funcao_funcionario WHERE id = $1 AND ativo = true',
          [id],
        );

        if (existsResult.rowCount === 0) {
          throw new NotFoundException(`Função de funcionário com ID ${id} não encontrada`);
        }

        // Construir query de atualização
        const updates: string[] = [];
        const values: any[] = [];
        let paramCounter = 1;

        if (updateEmployeeFunctionDto.nome !== undefined) {
          // Verificar se o novo nome já existe em outra função
          const nameExists = await client.query(
            'SELECT id FROM dbo.funcao_funcionario WHERE funcao_funcionario = $1 AND id != $2',
            [updateEmployeeFunctionDto.nome, id],
          );
          
          if (nameExists.rowCount > 0) {
            throw new ConflictException(
              `Função '${updateEmployeeFunctionDto.nome}' já existe`,
            );
          }

          updates.push(`funcao_funcionario = $${paramCounter++}`);
          values.push(updateEmployeeFunctionDto.nome);
        }

        if (updateEmployeeFunctionDto.descricao !== undefined) {
          updates.push(`descricao = $${paramCounter++}`);
          values.push(updateEmployeeFunctionDto.descricao);
        }

        if (updates.length > 0) {
          values.push(id);
          const updateQuery = `
            UPDATE dbo.funcao_funcionario
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
      console.error(`Erro ao atualizar função de funcionário ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao atualizar função de funcionário`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se existe
        const existsResult = await client.query(
          'SELECT id FROM dbo.funcao_funcionario WHERE id = $1 AND ativo = true',
          [id],
        );

        if (existsResult.rowCount === 0) {
          throw new NotFoundException(`Função de funcionário com ID ${id} não encontrada`);
        }

        // Verificar se há funcionários usando esta função
        const hasEmployees = await client.query(
          'SELECT id FROM dbo.funcionario WHERE funcao_funcionario_id = $1 AND ativo = true LIMIT 1',
          [id],
        );

        if (hasEmployees.rowCount > 0) {
          // Se há funcionários usando, apenas inativa
          await client.query(
            'UPDATE dbo.funcao_funcionario SET ativo = false WHERE id = $1',
            [id],
          );
        } else {
          // Se não há funcionários, remove
          await client.query('DELETE FROM dbo.funcao_funcionario WHERE id = $1', [id]);
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
      console.error(`Erro ao remover função de funcionário ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao remover função de funcionário`);
    }
  }

  private mapToEntity(dbRecord: any): EmployeeFunction {
    return {
      id: dbRecord.id,
      funcaoFuncionario: dbRecord.funcao_funcionario,
      descricao: dbRecord.descricao,
      salarioBase: dbRecord.salario_base ? parseFloat(dbRecord.salario_base) : 0,
      requerCnh: dbRecord.requer_cnh || false,
      cargaHoraria: dbRecord.carga_horaria ? parseFloat(dbRecord.carga_horaria) : 0,
      observacao: dbRecord.observacao,
      ativo: dbRecord.ativo,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };
  }
}
