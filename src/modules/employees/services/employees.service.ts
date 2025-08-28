import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    try {
      const existingEmployee = await this.databaseService.query(
        'SELECT id FROM dbo.funcionario WHERE cpf = $1',
        [createEmployeeDto.cpf],
      );

      if (existingEmployee.rowCount > 0) {
        throw new ConflictException(
          `Funcionário com CPF ${createEmployeeDto.cpf} já existe`,
        );
      }

      const existingEmail = await this.databaseService.query(
        'SELECT id FROM dbo.funcionario WHERE email = $1',
        [createEmployeeDto.email],
      );

      if (existingEmail.rowCount > 0) {
        throw new ConflictException(
          `Email ${createEmployeeDto.email} já está em uso`,
        );
      }
      const result = await this.databaseService.query(
        `INSERT INTO dbo.funcionario
          (nome, cpf, email, telefone, rg, cidade_id, cargo_id, departamento_id, 
           data_admissao, funcao_funcionario_id, ativo)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          createEmployeeDto.nome,
          createEmployeeDto.cpf,
          createEmployeeDto.email,
          createEmployeeDto.telefone || null,
          createEmployeeDto.rg || null,
          createEmployeeDto.cidadeId || null,
          createEmployeeDto.cargoId || null,
          createEmployeeDto.departamentoId || null,
          createEmployeeDto.dataAdmissao,
          createEmployeeDto.funcaoFuncionarioId || null,
          createEmployeeDto.ativo,
        ],
      );

      return this.mapToEmployeeEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      console.error('Erro ao criar funcionário:', error);
      throw new InternalServerErrorException('Erro ao criar funcionário');
    }
  }
  async findAll(): Promise<Employee[]> {
    try {
      const result = await this.databaseService.query(`
        SELECT 
          f.*,
          c.nome as cargo_nome,
          d.nome as departamento_nome,
          cid.nome as cidade_nome,
          ff.funcao_funcionario as funcao_funcionario_nome
        FROM dbo.funcionario f
        LEFT JOIN dbo.cargo c ON f.cargo_id = c.id
        LEFT JOIN dbo.departamento d ON f.departamento_id = d.id
        LEFT JOIN dbo.cidade cid ON f.cidade_id = cid.id
        LEFT JOIN dbo.funcao_funcionario ff ON f.funcao_funcionario_id = ff.id
        ORDER BY f.nome
      `);

      return result.rows.map((row) => this.mapToEmployeeEntity(row));
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      throw new InternalServerErrorException('Erro ao buscar funcionários');
    }
  }
  async findOne(id: number): Promise<Employee> {
    try {
      const result = await this.databaseService.query(
        `
        SELECT 
          f.*,
          c.nome as cargo_nome,
          d.nome as departamento_nome,
          cid.nome as cidade_nome,
          ff.funcao_funcionario as funcao_funcionario_nome
        FROM dbo.funcionario f
        LEFT JOIN dbo.cargo c ON f.cargo_id = c.id
        LEFT JOIN dbo.departamento d ON f.departamento_id = d.id
        LEFT JOIN dbo.cidade cid ON f.cidade_id = cid.id
        LEFT JOIN dbo.funcao_funcionario ff ON f.funcao_funcionario_id = ff.id
        WHERE f.id = $1
      `,
        [id],
      );

      if (result.rowCount === 0) {
        throw new NotFoundException(`Funcionário com ID ${id} não encontrado`);
      }

      return this.mapToEmployeeEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao buscar funcionário ${id}:`, error);
      throw new InternalServerErrorException(
        `Erro ao buscar funcionário ${id}`,
      );
    }
  }

  async update(
    id: number,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<Employee> {
    try {
      const existingEmployee = await this.databaseService.query(
        'SELECT id FROM dbo.funcionario WHERE id = $1',
        [id],
      );

      if (existingEmployee.rowCount === 0) {
        throw new NotFoundException(`Funcionário com ID ${id} não encontrado`);
      }

      if (updateEmployeeDto.email) {
        const existingEmail = await this.databaseService.query(
          'SELECT id FROM dbo.funcionario WHERE email = $1 AND id != $2',
          [updateEmployeeDto.email, id],
        );

        if (existingEmail.rowCount > 0) {
          throw new ConflictException(
            `Email ${updateEmployeeDto.email} já está em uso`,
          );
        }
      }

      if (updateEmployeeDto.cpf) {
        const existingCpf = await this.databaseService.query(
          'SELECT id FROM dbo.funcionario WHERE cpf = $1 AND id != $2',
          [updateEmployeeDto.cpf, id],
        );

        if (existingCpf.rowCount > 0) {
          throw new ConflictException(
            `CPF ${updateEmployeeDto.cpf} já está cadastrado`,
          );
        }
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      if (updateEmployeeDto.nome !== undefined) {
        updates.push(`nome = $${paramCounter++}`);
        values.push(updateEmployeeDto.nome);
      }

      if (updateEmployeeDto.cpf !== undefined) {
        updates.push(`cpf = $${paramCounter++}`);
        values.push(updateEmployeeDto.cpf);
      }

      if (updateEmployeeDto.email !== undefined) {
        updates.push(`email = $${paramCounter++}`);
        values.push(updateEmployeeDto.email);
      }

      if (updateEmployeeDto.telefone !== undefined) {
        updates.push(`telefone = $${paramCounter++}`);
        values.push(updateEmployeeDto.telefone);
      }

      if (updateEmployeeDto.rg !== undefined) {
        updates.push(`rg = $${paramCounter++}`);
        values.push(updateEmployeeDto.rg);
      }

      if (updateEmployeeDto.cidadeId !== undefined) {
        updates.push(`cidade_id = $${paramCounter++}`);
        values.push(updateEmployeeDto.cidadeId);
      }

      if (updateEmployeeDto.cargoId !== undefined) {
        updates.push(`cargo_id = $${paramCounter++}`);
        values.push(updateEmployeeDto.cargoId);
      }

      if (updateEmployeeDto.departamentoId !== undefined) {
        updates.push(`departamento_id = $${paramCounter++}`);
        values.push(updateEmployeeDto.departamentoId);
      }

      if (updateEmployeeDto.funcaoFuncionarioId !== undefined) {
        updates.push(`funcao_funcionario_id = $${paramCounter++}`);
        values.push(updateEmployeeDto.funcaoFuncionarioId);
      }

      if (updateEmployeeDto.dataAdmissao !== undefined) {
        updates.push(`data_admissao = $${paramCounter++}`);
        values.push(updateEmployeeDto.dataAdmissao);
      }

      if (updateEmployeeDto.dataDemissao !== undefined) {
        updates.push(`data_demissao = $${paramCounter++}`);
        values.push(updateEmployeeDto.dataDemissao);
      }

      if (updateEmployeeDto.ativo !== undefined) {
        updates.push(`ativo = $${paramCounter++}`);
        values.push(updateEmployeeDto.ativo);
      }

      if (updates.length === 0) {
        return this.findOne(id);
      }

      values.push(id);

      const updateQuery = `
        UPDATE dbo.funcionario
        SET ${updates.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING *
      `;

      const result = await this.databaseService.query(updateQuery, values);
      return this.mapToEmployeeEntity(result.rows[0]);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error(`Erro ao atualizar funcionário ${id}:`, error);
      throw new InternalServerErrorException(
        `Erro ao atualizar funcionário ${id}`,
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const existingEmployee = await this.databaseService.query(
        'SELECT id FROM dbo.funcionario WHERE id = $1',
        [id],
      );

      if (existingEmployee.rowCount === 0) {
        throw new NotFoundException(`Funcionário com ID ${id} não encontrado`);
      }

      const hasReferences = false;

      if (hasReferences) {
        await this.databaseService.query(
          'UPDATE dbo.funcionario SET ativo = false, data_demissao = CURRENT_DATE WHERE id = $1',
          [id],
        );
      } else {
        await this.databaseService.query(
          'DELETE FROM dbo.funcionario WHERE id = $1',
          [id],
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao remover funcionário ${id}:`, error);
      throw new InternalServerErrorException(
        `Erro ao remover funcionário ${id}`,
      );
    }
  }

  private mapToEmployeeEntity(dbRecord: any): Employee {
    const employee: Employee = {
      id: dbRecord.id,
      nome: dbRecord.nome,
      cpf: dbRecord.cpf,
      email: dbRecord.email,
      telefone: dbRecord.telefone,
      rg: dbRecord.rg,
      cidadeId: dbRecord.cidade_id,
      cargoId: dbRecord.cargo_id,
      departamentoId: dbRecord.departamento_id,
      funcaoFuncionarioId: dbRecord.funcao_funcionario_id,
      dataAdmissao: dbRecord.data_admissao,
      dataDemissao: dbRecord.data_demissao,
      ativo: dbRecord.ativo,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at,
    };

    // Campos opcionais que podem não existir na entity base
    if (dbRecord.cidade_nome && (employee as any).cidadeNome !== undefined) (employee as any).cidadeNome = dbRecord.cidade_nome;
    if (dbRecord.cargo_nome && (employee as any).cargoNome !== undefined) (employee as any).cargoNome = dbRecord.cargo_nome;
    if (dbRecord.departamento_nome && (employee as any).departamentoNome !== undefined) (employee as any).departamentoNome = dbRecord.departamento_nome;
    if (dbRecord.funcao_funcionario_nome && (employee as any).funcaoFuncionarioNome !== undefined) (employee as any).funcaoFuncionarioNome = dbRecord.funcao_funcionario_nome;

    return employee;
  }
}
