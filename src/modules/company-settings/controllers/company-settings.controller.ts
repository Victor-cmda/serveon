import {
  Controller,
  Get,
  Put,
  Body,
  HttpStatus,
} from '@nestjs/common';
import { CompanySettingsService } from '../services/company-settings.service';
import { UpdateCompanySettingsDto } from '../dto/update-company-settings.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CompanySettings } from '../entities/company-settings.entity';

@ApiTags('Company Settings')
@Controller('company-settings')
export class CompanySettingsController {
  constructor(private readonly companySettingsService: CompanySettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obter configurações da empresa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configurações retornadas com sucesso',
    type: CompanySettings,
  })
  get() {
    return this.companySettingsService.get();
  }

  @Put()
  @ApiOperation({ summary: 'Atualizar configurações da empresa' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Configurações atualizadas com sucesso',
    type: CompanySettings,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  update(@Body() updateDto: UpdateCompanySettingsDto) {
    return this.companySettingsService.update(updateDto);
  }
}
