import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { EmployeesService } from '../services/employees.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { Employee } from '../entities/employee.entity';
import { DepartmentsService } from '../../departments/services/departments.service';
import { PositionsService } from '../../positions/services/positions.service';

@ApiTags('Funcionários')
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly departmentsService: DepartmentsService,
    private readonly positionsService: PositionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo funcionário' })
  @ApiResponse({ status: 201, description: 'Funcionário criado com sucesso.', type: Employee })
  @ApiResponse({ status: 409, description: 'CPF ou email já existem.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os funcionários' })
  @ApiResponse({ status: 200, description: 'Lista de funcionários retornada com sucesso.', type: [Employee] })
  findAll(): Promise<Employee[]> {
    return this.employeesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar funcionário por ID' })
  @ApiParam({ name: 'id', description: 'ID do funcionário' })
  @ApiResponse({ status: 200, description: 'Funcionário encontrado.', type: Employee })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado.' })
  findOne(@Param('id') id: string): Promise<Employee> {
    return this.employeesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar funcionário' })
  @ApiParam({ name: 'id', description: 'ID do funcionário' })
  @ApiResponse({ status: 200, description: 'Funcionário atualizado com sucesso.', type: Employee })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado.' })
  @ApiResponse({ status: 409, description: 'Email já existe.' })
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    return this.employeesService.update(+id, updateEmployeeDto);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover funcionário' })
  @ApiParam({ name: 'id', description: 'ID do funcionário' })
  @ApiResponse({ status: 204, description: 'Funcionário removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Funcionário não encontrado.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.employeesService.remove(+id);
  }

  @Get('departments/active')
  @ApiOperation({ summary: 'Listar departamentos ativos para seleção' })
  @ApiResponse({ status: 200, description: 'Lista de departamentos ativos.' })
  async getActiveDepartments() {
    const departments = await this.departmentsService.findAll();
    return departments.filter(dept => dept.ativo);
  }

  @Get('positions/active')
  @ApiOperation({ summary: 'Listar cargos ativos para seleção' })
  @ApiResponse({ status: 200, description: 'Lista de cargos ativos.' })
  async getActivePositions() {
    const positions = await this.positionsService.findAll();
    return positions.filter(pos => pos.ativo);
  }

  @Get('positions/by-department/:departmentId')
  @ApiOperation({ summary: 'Listar cargos ativos por departamento' })
  @ApiParam({ name: 'departmentId', description: 'ID do departamento' })
  @ApiResponse({ status: 200, description: 'Lista de cargos do departamento.' })
  getPositionsByDepartment(@Param('departmentId') departmentId: string) {
    return this.positionsService.findByDepartment(+departmentId);
  }
}
