import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  Query 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SalesService } from '../services/sales.service';
import { CreateSaleDto } from '../dto/create-sale.dto';
import { UpdateSaleDto } from '../dto/update-sale.dto';

@ApiTags('sales')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova venda' })
  @ApiResponse({ status: 201, description: 'Venda criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get('check-exists')
  @ApiOperation({ summary: 'Verificar se uma venda já existe pela chave composta' })
  @ApiResponse({ status: 200, description: 'Retorna se a venda existe ou não.' })
  @ApiQuery({ name: 'numeroPedido', required: true, description: 'Número do pedido/nota fiscal' })
  @ApiQuery({ name: 'modelo', required: true, description: 'Modelo da nota fiscal' })
  @ApiQuery({ name: 'serie', required: true, description: 'Série da nota fiscal' })
  @ApiQuery({ name: 'clienteId', required: true, description: 'ID do cliente' })
  async checkExists(
    @Query('numeroPedido') numeroPedido: string,
    @Query('modelo') modelo: string,
    @Query('serie') serie: string,
    @Query('clienteId') clienteId: string,
  ) {
    const exists = await this.salesService.checkCompositeKeyExists(
      numeroPedido,
      modelo,
      serie,
      clienteId,
    );
    return { exists };
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as vendas' })
  @ApiResponse({ status: 200, description: 'Lista de vendas retornada com sucesso.' })
  findAll() {
    return this.salesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar venda por ID' })
  @ApiResponse({ status: 200, description: 'Venda encontrada.' })
  @ApiResponse({ status: 404, description: 'Venda não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar venda' })
  @ApiResponse({ status: 200, description: 'Venda atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Venda não encontrada.' })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto) {
    return this.salesService.update(+id, updateSaleDto);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Aprovar venda' })
  @ApiResponse({ status: 200, description: 'Venda aprovada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Venda não encontrada.' })
  approve(@Param('id') id: string) {
    // TODO: Obter ID do usuário logado do contexto de autenticação
    const aprovadoPor = 4; // Temporário - deve vir do contexto
    return this.salesService.approve(+id, aprovadoPor);
  }

  @Patch(':id/deny')
  @ApiOperation({ summary: 'Negar venda' })
  @ApiResponse({ status: 200, description: 'Venda negada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Venda não encontrada.' })
  deny(@Param('id') id: string, @Body() body?: { motivo?: string }) {
    return this.salesService.deny(+id, body?.motivo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar venda' })
  @ApiResponse({ status: 200, description: 'Venda deletada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Venda não encontrada.' })
  remove(@Param('id') id: string) {
    return this.salesService.remove(+id);
  }
}
