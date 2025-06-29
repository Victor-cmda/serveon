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
  Query,
} from '@nestjs/common';
import { StatesService } from '../services/states.service';
import { CreateStateDto } from '../dto/create-state.dto';
import { UpdateStateDto } from '../dto/update-state.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { State } from '../entities/state.entity';

@ApiTags('States')
@Controller('states')
export class StatesController {
  constructor(private readonly statesService: StatesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo estado' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Estado criado com sucesso',
    type: State,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Estado com mesma UF já existe para o país informado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'País não encontrado',
  })
  create(@Body() createStateDto: CreateStateDto) {
    return this.statesService.create(createStateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os estados' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de estados retornada com sucesso',
    type: [State],
  })
  @ApiQuery({
    name: 'paisId',
    required: false,
    description: 'Filtrar estados por país',
  })
  findAll(@Query('paisId') paisId?: string) {
    if (paisId) {
      return this.statesService.findAllByCountry(parseInt(paisId, 10));
    }
    return this.statesService.findAll();
  }

  @Get('uf/:uf/pais/:paisId')
  @ApiOperation({ summary: 'Obter estado por UF e país' })
  @ApiParam({ name: 'uf', description: 'UF do estado' })
  @ApiParam({ name: 'paisId', description: 'ID do país' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado encontrado',
    type: State,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Estado não encontrado',
  })
  findByUf(@Param('uf') uf: string, @Param('paisId') paisId: string) {
    return this.statesService.findByUf(uf, parseInt(paisId, 10));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter estado por ID' })
  @ApiParam({ name: 'id', description: 'ID do estado' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado encontrado',
    type: State,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Estado não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.statesService.findOne(parseInt(id, 10));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar estado por ID' })
  @ApiParam({ name: 'id', description: 'ID do estado' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estado atualizado com sucesso',
    type: State,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Estado não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Estado com mesma UF já existe para o país informado',
  })
  update(@Param('id') id: string, @Body() updateStateDto: UpdateStateDto) {
    return this.statesService.update(parseInt(id, 10), updateStateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover estado por ID' })
  @ApiParam({ name: 'id', description: 'ID do estado' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Estado removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Estado não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Não é possível excluir o estado pois ele possui cidades vinculadas',
  })
  async remove(@Param('id') id: string) {
    await this.statesService.remove(parseInt(id, 10));
  }
}
