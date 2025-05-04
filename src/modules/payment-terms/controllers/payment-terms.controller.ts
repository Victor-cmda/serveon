import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, ParseIntPipe } from '@nestjs/common';
import { PaymentTermsService } from '../services/payment-terms.service';
import { CreatePaymentTermDto } from '../dto/create-payment-term.dto';
import { UpdatePaymentTermDto } from '../dto/update-payment-term.dto';

@Controller('payment-terms')
export class PaymentTermsController {
  constructor(private readonly paymentTermsService: PaymentTermsService) {}

  @Post()
  async create(@Body() createPaymentTermDto: CreatePaymentTermDto) {
    return this.paymentTermsService.create(createPaymentTermDto);
  }

  @Get()
  async findAll() {
    return this.paymentTermsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentTermsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentTermDto: UpdatePaymentTermDto,
  ) {
    return this.paymentTermsService.update(id, updatePaymentTermDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.paymentTermsService.remove(id);
  }
}
