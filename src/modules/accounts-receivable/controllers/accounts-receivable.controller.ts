import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AccountsReceivableService } from '../services/accounts-receivable.service';
import { CreateAccountReceivableDto } from '../dto/create-account-receivable.dto';
import { UpdateAccountReceivableDto } from '../dto/update-account-receivable.dto';
import { ReceiveAccountDto } from '../dto/receive-account.dto';
import { AccountReceivable } from '../entities/account-receivable.entity';

@ApiTags('Accounts Receivable')
@Controller('accounts-receivable')
export class AccountsReceivableController {
  constructor(private readonly accountsReceivableService: AccountsReceivableService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova conta a receber' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Conta a receber criada com sucesso',
    type: AccountReceivable,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  create(@Body() createAccountReceivableDto: CreateAccountReceivableDto) {
    return this.accountsReceivableService.create(createAccountReceivableDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as contas a receber' })
  @ApiQuery({ name: 'clienteId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'dataInicio', required: false, type: Date })
  @ApiQuery({ name: 'dataFim', required: false, type: Date })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de contas a receber retornada com sucesso',
    type: [AccountReceivable],
  })
  findAll(
    @Query('clienteId') clienteId?: number,
    @Query('status') status?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    const filters: any = {};

    if (clienteId) {
      filters.clienteId = Number(clienteId);
    }

    if (status) {
      filters.status = status;
    }

    if (dataInicio) {
      filters.dataInicio = new Date(dataInicio);
    }

    if (dataFim) {
      filters.dataFim = new Date(dataFim);
    }

    return this.accountsReceivableService.findAll(filters);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Listar contas vencidas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de contas vencidas retornada com sucesso',
    type: [AccountReceivable],
  })
  findOverdue() {
    return this.accountsReceivableService.findOverdue();
  }

  @Get('customer/:clienteId')
  @ApiOperation({ summary: 'Listar contas a receber por cliente' })
  @ApiParam({ name: 'clienteId', description: 'ID do cliente' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de contas do cliente retornada com sucesso',
    type: [AccountReceivable],
  })
  findByCustomer(@Param('clienteId') clienteId: string) {
    return this.accountsReceivableService.findByCustomer(+clienteId);
  }

  @Get('period')
  @ApiOperation({ summary: 'Listar contas a receber por período' })
  @ApiQuery({ name: 'dataInicio', required: true, type: Date })
  @ApiQuery({ name: 'dataFim', required: true, type: Date })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de contas do período retornada com sucesso',
    type: [AccountReceivable],
  })
  findByPeriod(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.accountsReceivableService.findByPeriod(
      new Date(dataInicio),
      new Date(dataFim),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter conta a receber por ID' })
  @ApiParam({ name: 'id', description: 'ID da conta a receber' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conta a receber encontrada',
    type: AccountReceivable,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conta a receber não encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.accountsReceivableService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar conta a receber' })
  @ApiParam({ name: 'id', description: 'ID da conta a receber' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conta a receber atualizada com sucesso',
    type: AccountReceivable,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conta a receber não encontrada',
  })
  update(
    @Param('id') id: string,
    @Body() updateAccountReceivableDto: UpdateAccountReceivableDto,
  ) {
    return this.accountsReceivableService.update(+id, updateAccountReceivableDto);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Realizar recebimento de conta' })
  @ApiParam({ name: 'id', description: 'ID da conta a receber' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Recebimento realizado com sucesso',
    type: AccountReceivable,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos ou conta já recebida',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conta a receber não encontrada',
  })
  receive(@Param('id') id: string, @Body() receiveAccountDto: ReceiveAccountDto) {
    return this.accountsReceivableService.receive(+id, receiveAccountDto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar conta a receber' })
  @ApiParam({ name: 'id', description: 'ID da conta a receber' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Conta cancelada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Não é possível cancelar esta conta',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conta a receber não encontrada',
  })
  cancel(@Param('id') id: string) {
    return this.accountsReceivableService.cancel(+id);
  }

  @Post('update-overdue-status')
  @ApiOperation({ summary: 'Atualizar status de contas vencidas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status atualizado com sucesso',
  })
  updateOverdueStatus() {
    return this.accountsReceivableService.updateOverdueStatus();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover conta a receber' })
  @ApiParam({ name: 'id', description: 'ID da conta a receber' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Conta removida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Não é possível remover esta conta',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conta a receber não encontrada',
  })
  remove(@Param('id') id: string) {
    return this.accountsReceivableService.remove(+id);
  }
}
