import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    try {
      // Verificar se já existe um funcionário com o mesmo CPF
      const existingEmployee = await this.databaseService.query(
        'SELECT id FROM dbo.funcionario WHERE cpf = $1',
        [createEmployeeDto.cpf]
      );

      if (existingEmployee.rowCount > 0) {
        throw new ConflictException(`Funcionário com CPF ${createEmployeeDto.cpf} já existe`);
      }

      // Verificar se já existe um funcionário com o mesmo email
      const existingEmail = await this.databaseService.query(
        'SELECT id FROM dbo.funcionario WHERE email = $1',
        [createEmployeeDto.email]
      );

      if (existingEmail.rowCount > 0) {
        throw new ConflictException(`Email ${createEmployeeDto.email} já está em uso`);
      }

      // Inserir o novo funcionário
      const result = await this.databaseService.query(
        `INSERT INTO dbo.funcionario
          (nome, cpf, email, telefone, cargo, departamento, data_admissao, ativo)
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          createEmployeeDto.nome,
          createEmployeeDto.cpf,
          createEmployeeDto.email,
          createEmployeeDto.telefone || null,
          createEmployeeDto.cargo,
          createEmployeeDto.departamento,
          createEmployeeDto.dataAdmissao,
          createEmployeeDto.ativo
        ]
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
        SELECT * FROM dbo.funcionario
        ORDER BY nome
      `);

      return result.rows.map(row => this.mapToEmployeeEntity(row));
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      throw new InternalServerErrorException('Erro ao buscar funcionários');
    }
  }

  async findOne(id: number): Promise<Employee> {
    try {
      const result = await this.databaseService.query(
        'SELECT * FROM dbo.funcionario WHERE id = $1',
        [id]
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
      throw new InternalServerErrorException(`Erro ao buscar funcionário ${id}`);
    }
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    try {
      // Verificar se o funcionário existe
      const existingEmployee = await this.databaseService.query(
        'SELECT id FROM dbo.funcionario WHERE id = $1',
        [id]
      );

      if (existingEmployee.rowCount === 0) {
        throw new NotFoundException(`Funcionário com ID ${id} não encontrado`);
      }

      // Se estiver atualizando o email, verificar se já existe
      if (updateEmployeeDto.email) {
        const existingEmail = await this.databaseService.query(
          'SELECT id FROM dbo.funcionario WHERE email = $1 AND id != $2',
          [updateEmployeeDto.email, id]
        );

        if (existingEmail.rowCount > 0) {
          throw new ConflictException(`Email ${updateEmployeeDto.email} já está em uso`);
        }
      }

      // Se estiver atualizando o CPF, verificar se já existe
      if (updateEmployeeDto.cpf) {
        const existingCpf = await this.databaseService.query(
          'SELECT id FROM dbo.funcionario WHERE cpf = $1 AND id != $2',
          [updateEmployeeDto.cpf, id]
        );

        if (existingCpf.rowCount > 0) {
          throw new ConflictException(`CPF ${updateEmployeeDto.cpf} já está cadastrado`);
        }
      }

      // Construir a consulta de atualização dinamicamente
      const updates: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      // Adicionar cada campo do DTO à consulta, se estiver definido
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

      if (updateEmployeeDto.cargo !== undefined) {
        updates.push(`cargo = $${paramCounter++}`);
        values.push(updateEmployeeDto.cargo);
      }

      if (updateEmployeeDto.departamento !== undefined) {
        updates.push(`departamento = $${paramCounter++}`);
        values.push(updateEmployeeDto.departamento);
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

      // Se não houver campos para atualizar, retornar o funcionário atual
      if (updates.length === 0) {
        return this.findOne(id);
      }

      // Adicionar o id aos valores
      values.push(id);

      // Executar a consulta de atualização
      const updateQuery = `
        UPDATE dbo.funcionario
        SET ${updates.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING *
      `;

      const result = await this.databaseService.query(updateQuery, values);
      return this.mapToEmployeeEntity(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      console.error(`Erro ao atualizar funcionário ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao atualizar funcionário ${id}`);
    }
  }

  async remove(id: number): Promise<void> {
    try {
      // Verificar se o funcionário existe
      const existingEmployee = await this.databaseService.query(
        'SELECT id FROM dbo.funcionario WHERE id = $1',
        [id]
      );

      if (existingEmployee.rowCount === 0) {
        throw new NotFoundException(`Funcionário com ID ${id} não encontrado`);
      }

      // Verificar se o funcionário está sendo referenciado em alguma tabela
      // Se tiver referências, apenas desativar em vez de excluir
      const hasReferences = false; // Implementar lógica para verificar referências se necessário

      if (hasReferences) {
        // Desativar o funcionário
        await this.databaseService.query(
          'UPDATE dbo.funcionario SET ativo = false, data_demissao = CURRENT_DATE WHERE id = $1',
          [id]
        );
      } else {
        // Se não há referências, podemos excluir
        await this.databaseService.query(
          'DELETE FROM dbo.funcionario WHERE id = $1',
          [id]
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Erro ao remover funcionário ${id}:`, error);
      throw new InternalServerErrorException(`Erro ao remover funcionário ${id}`);
    }
  }

  /**
   * Mapeia um registro do banco de dados para a entidade Employee
   */
  private mapToEmployeeEntity(dbRecord: any): Employee {
    return {
      id: dbRecord.id,
      nome: dbRecord.nome,
      cpf: dbRecord.cpf,
      email: dbRecord.email,
      telefone: dbRecord.telefone,
      cargo: dbRecord.cargo,
      departamento: dbRecord.departamento,
      dataAdmissao: dbRecord.data_admissao,
      dataDemissao: dbRecord.data_demissao,
      ativo: dbRecord.ativo,
      createdAt: dbRecord.created_at,
      updatedAt: dbRecord.updated_at
    };
  }
}