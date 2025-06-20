import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, ParseIntPipe } from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Category } from '../entities/category.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Categoria criada com sucesso',
    type: Category
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados de entrada inválidos' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Categoria com mesmo nome já existe' 
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Lista de categorias retornada com sucesso',
    type: [Category]
  })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter categoria por ID' })
  @ApiParam({ name: 'id', description: 'ID da categoria', type: 'number' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Categoria encontrada',
    type: Category
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Categoria não encontrada' 
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiParam({ name: 'id', description: 'ID da categoria', type: 'number' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Categoria atualizada com sucesso',
    type: Category
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Categoria não encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Dados de entrada inválidos' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Nome já está sendo usado por outra categoria' 
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover categoria (soft delete)' })
  @ApiParam({ name: 'id', description: 'ID da categoria', type: 'number' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'Categoria removida com sucesso' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Categoria não encontrada' 
  })
  @ApiResponse({ 
    status: HttpStatus.CONFLICT, 
    description: 'Categoria está sendo usada por produtos ativos' 
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}
