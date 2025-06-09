import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { DepartmentsService } from '../services/departments.service';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { UpdateDepartmentDto } from '../dto/update-department.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Department } from '../entities/department.entity';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo departamento' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Departamento criado com sucesso',
    type: Department
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados de entrada inválidos' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Departamento com mesmo nome já existe' 
  })
  create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os departamentos' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de departamentos retornada com sucesso',
    type: [Department]
  })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar departamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do departamento' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Departamento encontrado',
    type: Department
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Departamento não encontrado' 
  })
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(parseInt(id, 10));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar departamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do departamento' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Departamento atualizado com sucesso',
    type: Department
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados de entrada inválidos' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Departamento não encontrado' 
  })
  update(@Param('id') id: string, @Body() updateDepartmentDto: UpdateDepartmentDto) {
    return this.departmentsService.update(parseInt(id, 10), updateDepartmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover departamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do departamento' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Departamento removido com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Departamento não encontrado' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Departamento está sendo usado por funcionários' 
  })
  async remove(@Param('id') id: string) {
    await this.departmentsService.remove(parseInt(id, 10));
  }
}
