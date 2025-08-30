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
import { VehiclesService } from '../services/vehicles.service';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo veículo' })
  @ApiResponse({ status: 201, description: 'Veículo criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os veículos' })
  @ApiResponse({ status: 200, description: 'Lista de veículos retornada com sucesso.' })
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar veículo por ID' })
  @ApiResponse({ status: 200, description: 'Veículo encontrado.' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar veículo' })
  @ApiResponse({ status: 200, description: 'Veículo atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado.' })
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
    return this.vehiclesService.update(+id, updateVehicleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar veículo' })
  @ApiResponse({ status: 200, description: 'Veículo deletado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado.' })
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(+id);
  }
}
