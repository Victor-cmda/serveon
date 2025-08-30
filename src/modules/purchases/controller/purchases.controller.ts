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
import { PurchasesService } from '../services/purchases.service';
import { CreatePurchaseDto } from '../dto/create-purchase.dto';
import { UpdatePurchaseDto } from '../dto/update-purchase.dto';

@ApiTags('purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova compra' })
  @ApiResponse({ status: 201, description: 'Compra criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesService.create(createPurchaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as compras' })
  @ApiResponse({ status: 200, description: 'Lista de compras retornada com sucesso.' })
  findAll() {
    return this.purchasesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar compra por ID' })
  @ApiResponse({ status: 200, description: 'Compra encontrada.' })
  @ApiResponse({ status: 404, description: 'Compra não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar compra' })
  @ApiResponse({ status: 200, description: 'Compra atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Compra não encontrada.' })
  update(@Param('id') id: string, @Body() updatePurchaseDto: UpdatePurchaseDto) {
    return this.purchasesService.update(+id, updatePurchaseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar compra' })
  @ApiResponse({ status: 200, description: 'Compra deletada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Compra não encontrada.' })
  remove(@Param('id') id: string) {
    return this.purchasesService.remove(+id);
  }
}
