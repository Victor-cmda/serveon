import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class PaymentTermInstallment extends BaseEntity {
  @ApiProperty({
    description: 'ID da condição de pagamento',
    example: 1,
  })
  paymentTermId: number;

  @ApiProperty({
    description: 'Número da parcela',
    example: 1,
  })
  installmentNumber: number;

  @ApiProperty({
    description: 'ID da forma de pagamento',
    example: 1,
  })
  paymentMethodId: number;

  @ApiProperty({
    description: 'Dias para pagamento',
    example: 30,
  })
  daysToPayment: number;

  @ApiProperty({
    description: 'Percentual do valor total',
    example: 100.00,
  })
  percentageValue: number;
}
