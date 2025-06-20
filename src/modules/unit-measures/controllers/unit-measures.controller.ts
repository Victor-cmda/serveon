import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, ParseIntPipe } from '@nestjs/common';
import { UnitMeasuresService } from '../services/unit-measures.service';
import { CreateUnitMeasureDto } from '../dto/create-unit-measure.dto';
import { UpdateUnitMeasureDto } from '../dto/update-unit-measure.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { UnitMeasure } from '../entities/unit-measure.entity';

@ApiTags('Unit Measures')
@Controller('unit-measures')
export class UnitMeasuresController {
  constructor(private readonly unitMeasuresService: UnitMeasuresService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova unidade de medida' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Unidade de medida criada com sucesso',
    type: UnitMeasure
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados de entrada inválidos' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Unidade de medida com mesma sigla já existe' 
  })
  create(@Body() createUnitMeasureDto: CreateUnitMeasureDto) {
    return this.unitMeasuresService.create(createUnitMeasureDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as unidades de medida' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de unidades de medida retornada com sucesso',
    type: [UnitMeasure]
  })
  findAll() {
    return this.unitMeasuresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter unidade de medida por ID' })
  @ApiParam({ name: 'id', description: 'ID da unidade de medida', type: 'number' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Unidade de medida encontrada',
    type: UnitMeasure
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Unidade de medida não encontrada' 
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.unitMeasuresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar unidade de medida' })
  @ApiParam({ name: 'id', description: 'ID da unidade de medida', type: 'number' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Unidade de medida atualizada com sucesso',
    type: UnitMeasure
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Unidade de medida não encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados de entrada inválidos' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Sigla já está sendo usada por outra unidade de medida' 
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUnitMeasureDto: UpdateUnitMeasureDto) {
    return this.unitMeasuresService.update(id, updateUnitMeasureDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover unidade de medida (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID da unidade de medida', type: 'number' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Unidade de medida removida com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Unidade de medida não encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Unidade de medida está sendo usada por produtos ativos' 
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.unitMeasuresService.remove(id);
  }
}
