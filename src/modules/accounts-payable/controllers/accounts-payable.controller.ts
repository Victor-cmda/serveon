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
import { AccountsPayableService } from '../services/accounts-payable.service';
import { CreateAccountPayableDto } from '../dto/create-account-payable.dto';
import { UpdateAccountPayableDto } from '../dto/update-account-payable.dto';
import { PayAccountDto } from '../dto/pay-account.dto';
import { AccountPayable } from '../entities/account-payable.entity';

@ApiTags('Accounts Payable')
@Controller('accounts-payable')
export class AccountsPayableController {
  constructor(private readonly accountsPayableService: AccountsPayableService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova conta a pagar' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Conta a pagar criada com sucesso',
    type: AccountPayable,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  create(@Body() createAccountPayableDto: CreateAccountPayableDto) {
    return this.accountsPayableService.create(createAccountPayableDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as contas a pagar' })
  @ApiQuery({ name: 'fornecedorId', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'dataInicio', required: false, type: Date })
  @ApiQuery({ name: 'dataFim', required: false, type: Date })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de contas a pagar retornada com sucesso',
    type: [AccountPayable],
  })
  findAll(
    @Query('fornecedorId') fornecedorId?: number,
    @Query('status') status?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    const filters: any = {};

    if (fornecedorId) {
      filters.fornecedorId = Number(fornecedorId);
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

    return this.accountsPayableService.findAll(filters);
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Listar contas vencidas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de contas vencidas retornada com sucesso',
    type: [AccountPayable],
  })
  findOverdue() {
    return this.accountsPayableService.findOverdue();
  }

  @Get('supplier/:fornecedorId')
  @ApiOperation({ summary: 'Listar contas a pagar por fornecedor' })
  @ApiParam({ name: 'fornecedorId', description: 'ID do fornecedor' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de contas do fornecedor retornada com sucesso',
    type: [AccountPayable],
  })
  findBySupplier(@Param('fornecedorId') fornecedorId: string) {
    return this.accountsPayableService.findBySupplier(+fornecedorId);
  }

  @Get('period')
  @ApiOperation({ summary: 'Listar contas a pagar por período' })
  @ApiQuery({ name: 'dataInicio', required: true, type: Date })
  @ApiQuery({ name: 'dataFim', required: true, type: Date })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de contas do período retornada com sucesso',
    type: [AccountPayable],
  })
  findByPeriod(
    @Query('dataInicio') dataInicio: string,
    @Query('dataFim') dataFim: string,
  ) {
    return this.accountsPayableService.findByPeriod(
      new Date(dataInicio),
      new Date(dataFim),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter conta a pagar por ID' })
  @ApiParam({ name: 'id', description: 'ID da conta a pagar' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conta a pagar encontrada',
    type: AccountPayable,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conta a pagar não encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.accountsPayableService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar conta a pagar' })
  @ApiParam({ name: 'id', description: 'ID da conta a pagar' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conta a pagar atualizada com sucesso',
    type: AccountPayable,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conta a pagar não encontrada',
  })
  update(
    @Param('id') id: string,
    @Body() updateAccountPayableDto: UpdateAccountPayableDto,
  ) {
    return this.accountsPayableService.update(+id, updateAccountPayableDto);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: 'Realizar pagamento de conta' })
  @ApiParam({ name: 'id', description: 'ID da conta a pagar' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pagamento realizado com sucesso',
    type: AccountPayable,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados de entrada inválidos ou conta já paga',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Conta a pagar não encontrada',
  })
  pay(@Param('id') id: string, @Body() payAccountDto: PayAccountDto) {
    return this.accountsPayableService.pay(+id, payAccountDto);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar conta a pagar' })
  @ApiParam({ name: 'id', description: 'ID da conta a pagar' })
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
    description: 'Conta a pagar não encontrada',
  })
  cancel(@Param('id') id: string) {
    return this.accountsPayableService.cancel(+id);
  }

  @Post('update-overdue-status')
  @ApiOperation({ summary: 'Atualizar status de contas vencidas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status atualizado com sucesso',
  })
  updateOverdueStatus() {
    return this.accountsPayableService.updateOverdueStatus();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover conta a pagar' })
  @ApiParam({ name: 'id', description: 'ID da conta a pagar' })
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
    description: 'Conta a pagar não encontrada',
  })
  remove(@Param('id') id: string) {
    return this.accountsPayableService.remove(+id);
  }
}
