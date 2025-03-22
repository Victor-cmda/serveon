import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { CitiesService } from '../../services/cities/cities.service';
import { CreateCityDto } from '../../dto/create-city.dto';
import { UpdateCityDto } from '../../dto/update-city.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { City } from '../../entities/city.entity/city.entity';

@ApiTags('Cities')
@Controller('cities')
export class CitiesController {
    constructor(private readonly citiesService: CitiesService) { }

    @Post()
    @ApiOperation({ summary: 'Criar nova cidade' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Cidade criada com sucesso',
        type: City
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Cidade com mesmo nome ou código IBGE já existe'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Estado não encontrado'
    })
    create(@Body() createCityDto: CreateCityDto) {
        return this.citiesService.create(createCityDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas as cidades' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Lista de cidades retornada com sucesso',
        type: [City]
    })
    findAll() {
        return this.citiesService.findAll();
    }

    @Get('estado/:estadoId')
    @ApiOperation({ summary: 'Listar cidades por estado' })
    @ApiParam({ name: 'estadoId', description: 'ID do estado' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Lista de cidades do estado retornada com sucesso',
        type: [City]
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Estado não encontrado'
    })
    findByEstado(@Param('estadoId') estadoId: string) {
        return this.citiesService.findByEstado(estadoId);
    }

    @Get('ibge/:codigoIbge')
    @ApiOperation({ summary: 'Obter cidade por código IBGE' })
    @ApiParam({ name: 'codigoIbge', description: 'Código IBGE da cidade' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Cidade encontrada',
        type: City
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Cidade não encontrada'
    })
    findByIbgeCode(@Param('codigoIbge') codigoIbge: string) {
        return this.citiesService.findByIbgeCode(codigoIbge);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obter cidade por ID' })
    @ApiParam({ name: 'id', description: 'ID da cidade' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Cidade encontrada',
        type: City
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Cidade não encontrada'
    })
    findOne(@Param('id') id: string) {
        return this.citiesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar cidade por ID' })
    @ApiParam({ name: 'id', description: 'ID da cidade' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Cidade atualizada com sucesso',
        type: City
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Cidade não encontrada'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Cidade com mesmo nome ou código IBGE já existe'
    })
    update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
        return this.citiesService.update(id, updateCityDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remover cidade por ID' })
    @ApiParam({ name: 'id', description: 'ID da cidade' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'Cidade removida com sucesso'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'Cidade não encontrada'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Não é possível excluir a cidade pois ela está sendo referenciada'
    })
    async remove(@Param('id') id: string) {
        await this.citiesService.remove(id);
    }
}