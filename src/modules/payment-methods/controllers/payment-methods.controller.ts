import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode } from '@nestjs/common';
import { PaymentMethodsService } from '../services/payment-methods.service';
import { CreatePaymentMethodDto } from '../dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '../dto/update-payment-method.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/payment-method.entity';

@ApiTags('payment-methods')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payment method' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'The payment method has been successfully created.',
    type: PaymentMethod
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid data provided.' })
  create(@Body() createPaymentMethodDto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    return this.paymentMethodsService.create(createPaymentMethodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payment methods' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns all payment methods',
    type: [PaymentMethod]
  })
  findAll(): Promise<PaymentMethod[]> {
    return this.paymentMethodsService.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a payment method by ID' })
  @ApiParam({ name: 'id', description: 'Payment method ID (número)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Returns the payment method',
    type: PaymentMethod
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment method not found' })
  findOne(@Param('id') id: string): Promise<PaymentMethod> {
    return this.paymentMethodsService.findOne(parseInt(id, 10));
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment method' })
  @ApiParam({ name: 'id', description: 'Payment method ID (número)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'The payment method has been successfully updated',
    type: PaymentMethod
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment method not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid data provided' })
  update(
    @Param('id') id: string, 
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.update(parseInt(id, 10), updatePaymentMethodDto);
  }
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete a payment method or mark as inactive if in use' 
  })
  @ApiParam({ name: 'id', description: 'Payment method ID (número)' })
  @ApiResponse({ 
    status: HttpStatus.NO_CONTENT, 
    description: 'The payment method has been successfully deleted or inactivated'
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Payment method not found' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.paymentMethodsService.remove(parseInt(id, 10));
  }
}
