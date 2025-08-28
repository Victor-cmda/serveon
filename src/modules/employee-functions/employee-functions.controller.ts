import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmployeeFunctionsService } from './employee-functions.service';
import { CreateEmployeeFunctionDto } from './dto/create-employee-function.dto';
import { UpdateEmployeeFunctionDto } from './dto/update-employee-function.dto';

@ApiTags('employee-functions')
@Controller('employee-functions')
export class EmployeeFunctionsController {
  constructor(private readonly employeeFunctionsService: EmployeeFunctionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova função de funcionário' })
  @ApiResponse({ status: 201, description: 'Função criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createEmployeeFunctionDto: CreateEmployeeFunctionDto) {
    return this.employeeFunctionsService.create(createEmployeeFunctionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as funções de funcionários' })
  @ApiResponse({ status: 200, description: 'Lista de funções retornada com sucesso.' })
  findAll() {
    return this.employeeFunctionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar função por ID' })
  @ApiResponse({ status: 200, description: 'Função encontrada.' })
  @ApiResponse({ status: 404, description: 'Função não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.employeeFunctionsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar função' })
  @ApiResponse({ status: 200, description: 'Função atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Função não encontrada.' })
  update(@Param('id') id: string, @Body() updateEmployeeFunctionDto: UpdateEmployeeFunctionDto) {
    return this.employeeFunctionsService.update(+id, updateEmployeeFunctionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar função' })
  @ApiResponse({ status: 200, description: 'Função deletada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Função não encontrada.' })
  remove(@Param('id') id: string) {
    return this.employeeFunctionsService.remove(+id);
  }
}
