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
import { SuppliersService } from '../services/suppliers.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Supplier } from '../entities/supplier.entity';

@ApiTags('Suppliers')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo fornecedor' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Fornecedor criado com sucesso',
    type: Supplier,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Fornecedor com mesmo CNPJ/CPF já existe',
  })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os fornecedores' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de fornecedores retornada com sucesso',
    type: [Supplier],
  })
  findAll() {
    return this.suppliersService.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obter fornecedor por ID' })
  @ApiParam({ name: 'id', description: 'ID do fornecedor' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fornecedor encontrado',
    type: Supplier,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fornecedor não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.suppliersService.findOne(parseInt(id, 10));
  }

  @Get('by-document/:cnpjCpf')
  @ApiOperation({ summary: 'Obter fornecedor por CNPJ/CPF' })
  @ApiParam({ name: 'cnpjCpf', description: 'CNPJ/CPF do fornecedor' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fornecedor encontrado',
    type: Supplier,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fornecedor não encontrado',
  })
  findByDocument(@Param('cnpjCpf') cnpjCpf: string) {
    return this.suppliersService.findByDocument(cnpjCpf);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar fornecedor por ID' })
  @ApiParam({ name: 'id', description: 'ID do fornecedor' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fornecedor atualizado com sucesso',
    type: Supplier,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fornecedor não encontrado',
  })
  update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(parseInt(id, 10), updateSupplierDto);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover fornecedor por ID' })
  @ApiParam({ name: 'id', description: 'ID do fornecedor' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Fornecedor removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Fornecedor não encontrado',
  })
  async remove(@Param('id') id: string) {
    await this.suppliersService.remove(parseInt(id, 10));
  }
}
