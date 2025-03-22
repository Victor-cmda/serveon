import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { CountriesService } from '../services/countries.service';
import { CreateCountryDto } from '../dto/create-country.dto';
import { UpdateCountryDto } from '../dto/update-country.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Country } from '../entities/country.entity';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
    constructor(private readonly countriesService: CountriesService) { }

    @Post()
    @ApiOperation({ summary: 'Criar novo país' })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'País criado com sucesso',
        type: Country
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'País com mesmo código ou sigla já existe'
    })
    create(@Body() createCountryDto: CreateCountryDto) {
        return this.countriesService.create(createCountryDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todos os países' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Lista de países retornada com sucesso',
        type: [Country]
    })
    findAll() {
        return this.countriesService.findAll();
    }

    @Get('code/:code')
    @ApiOperation({ summary: 'Obter país por código' })
    @ApiParam({ name: 'code', description: 'Código do país' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'País encontrado',
        type: Country
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'País não encontrado'
    })
    findByCode(@Param('code') code: string) {
        return this.countriesService.findByCode(code);
    }

    @Get('sigla/:sigla')
    @ApiOperation({ summary: 'Obter país por sigla' })
    @ApiParam({ name: 'sigla', description: 'Sigla do país' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'País encontrado',
        type: Country
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'País não encontrado'
    })
    findBySigla(@Param('sigla') sigla: string) {
        return this.countriesService.findBySigla(sigla);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obter país por ID' })
    @ApiParam({ name: 'id', description: 'ID do país' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'País encontrado',
        type: Country
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'País não encontrado'
    })
    findOne(@Param('id') id: string) {
        return this.countriesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar país por ID' })
    @ApiParam({ name: 'id', description: 'ID do país' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'País atualizado com sucesso',
        type: Country
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Dados de entrada inválidos'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'País não encontrado'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'País com mesmo código ou sigla já existe'
    })
    update(@Param('id') id: string, @Body() updateCountryDto: UpdateCountryDto) {
        return this.countriesService.update(id, updateCountryDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Remover país por ID' })
    @ApiParam({ name: 'id', description: 'ID do país' })
    @ApiResponse({
        status: HttpStatus.NO_CONTENT,
        description: 'País removido com sucesso'
    })
    @ApiResponse({
        status: HttpStatus.NOT_FOUND,
        description: 'País não encontrado'
    })
    @ApiResponse({
        status: HttpStatus.CONFLICT,
        description: 'Não é possível excluir o país pois ele possui estados vinculados'
    })
    async remove(@Param('id') id: string) {
        await this.countriesService.remove(id);
    }
}