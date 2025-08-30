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
import { TransportersService } from '../services/transporters.service';
import { CreateTransporterDto } from '../dto/create-transporter.dto';
import { UpdateTransporterDto } from '../dto/update-transporter.dto';

@ApiTags('transporters')
@Controller('transporters')
export class TransportersController {
  constructor(private readonly transportersService: TransportersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova transportadora' })
  @ApiResponse({ status: 201, description: 'Transportadora criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  create(@Body() createTransporterDto: CreateTransporterDto) {
    return this.transportersService.create(createTransporterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as transportadoras' })
  @ApiResponse({ status: 200, description: 'Lista de transportadoras retornada com sucesso.' })
  findAll() {
    return this.transportersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar transportadora por ID' })
  @ApiResponse({ status: 200, description: 'Transportadora encontrada.' })
  @ApiResponse({ status: 404, description: 'Transportadora não encontrada.' })
  findOne(@Param('id') id: string) {
    return this.transportersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar transportadora' })
  @ApiResponse({ status: 200, description: 'Transportadora atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Transportadora não encontrada.' })
  update(@Param('id') id: string, @Body() updateTransporterDto: UpdateTransporterDto) {
    return this.transportersService.update(+id, updateTransporterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar transportadora' })
  @ApiResponse({ status: 200, description: 'Transportadora deletada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Transportadora não encontrada.' })
  remove(@Param('id') id: string) {
    return this.transportersService.remove(+id);
  }
}
