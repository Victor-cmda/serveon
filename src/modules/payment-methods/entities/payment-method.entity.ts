import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class PaymentMethod extends BaseEntity {
  @ApiProperty({
    description: 'Description of the payment method',
    example: 'Credit Card',
  })
  description: string;

  @ApiProperty({
    description: 'Code of the payment method',
    example: 'CC',
    required: false,
  })
  code?: string;

  @ApiProperty({
    description: 'Type of payment method',
    example: 'card',
    required: false,
  })
  type?: string;
}
