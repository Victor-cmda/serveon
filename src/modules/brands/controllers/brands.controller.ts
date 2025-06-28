import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, ParseIntPipe } from '@nestjs/common';
import { BrandsService } from '../services/brands.service';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Brand } from '../entities/brand.entity';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova marca' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Marca criada com sucesso',
    type: Brand
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados de entrada inválidos' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Marca com mesmo nome já existe' 
  })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as marcas' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de marcas retornada com sucesso',
    type: [Brand]
  })
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter marca por ID' })
  @ApiParam({ name: 'id', description: 'ID da marca', type: 'number' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Marca encontrada',
    type: Brand
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Marca não encontrada' 
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar marca' })
  @ApiParam({ name: 'id', description: 'ID da marca', type: 'number' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Marca atualizada com sucesso',
    type: Brand
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Marca não encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados de entrada inválidos' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Nome já está sendo usado por outra marca' 
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover marca (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID da marca', type: 'number' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Marca removida com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Marca não encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Marca está sendo usada por produtos ativos' 
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.remove(id);
  }
}
