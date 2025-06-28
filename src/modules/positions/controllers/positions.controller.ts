import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PositionsService } from '../services/positions.service';
import { CreatePositionDto } from '../dto/create-position.dto';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Position } from '../entities/position.entity';

@ApiTags('Positions')
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo cargo' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cargo criado com sucesso',
    type: Position,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cargo com mesmo nome já existe',
  })
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os cargos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de cargos retornada com sucesso',
    type: [Position],
  })
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cargo por ID' })
  @ApiParam({ name: 'id', description: 'ID do cargo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cargo encontrado',
    type: Position,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cargo não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.positionsService.findOne(parseInt(id, 10));
  }

  @Get('department/:departmentId')
  @ApiOperation({ summary: 'Buscar cargos por departamento' })
  @ApiParam({ name: 'departmentId', description: 'ID do departamento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cargos do departamento encontrados',
    type: [Position],
  })
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.positionsService.findByDepartment(parseInt(departmentId, 10));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cargo por ID' })
  @ApiParam({ name: 'id', description: 'ID do cargo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cargo atualizado com sucesso',
    type: Position,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cargo não encontrado',
  })
  update(
    @Param('id') id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(parseInt(id, 10), updatePositionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover cargo por ID' })
  @ApiParam({ name: 'id', description: 'ID do cargo' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cargo removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cargo não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cargo está sendo usado por funcionários',
  })
  async remove(@Param('id') id: string) {
    await this.positionsService.remove(parseInt(id, 10));
  }
}
