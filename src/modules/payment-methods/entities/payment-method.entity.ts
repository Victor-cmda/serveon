import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';

export class PaymentMethod extends BaseEntity {
  @ApiProperty({
    description: 'Name of the payment method',
    example: 'Credit Card',
  })
  name: string;

  @ApiProperty({
    description: 'Type of payment method',
    example: 'card',
  })
  type: string;
}
