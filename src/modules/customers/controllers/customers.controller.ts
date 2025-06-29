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
import { CustomersService } from '../services/customers.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { Customer } from '../entities/customer.entity';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo cliente' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cliente criado com sucesso',
    type: Customer,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Cliente com mesmo CNPJ/CPF já existe',
  })
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os clientes' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de clientes retornada com sucesso',
    type: [Customer],
  })
  findAll() {
    return this.customersService.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Obter cliente por ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente (número)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cliente encontrado',
    type: Customer,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(parseInt(id, 10));
  }

  @Get('by-document/:cnpjCpf')
  @ApiOperation({ summary: 'Obter cliente por CNPJ/CPF' })
  @ApiParam({ name: 'cnpjCpf', description: 'CNPJ/CPF do cliente' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cliente encontrado',
    type: Customer,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente não encontrado',
  })
  findByDocument(@Param('cnpjCpf') cnpjCpf: string) {
    return this.customersService.findByDocument(cnpjCpf);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cliente por ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente (número)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cliente atualizado com sucesso',
    type: Customer,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente não encontrado',
  })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(parseInt(id, 10), updateCustomerDto);
  }
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover cliente por ID' })
  @ApiParam({ name: 'id', description: 'ID do cliente (número)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cliente removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cliente não encontrado',
  })
  async remove(@Param('id') id: string) {
    await this.customersService.remove(parseInt(id, 10));
  }
}
