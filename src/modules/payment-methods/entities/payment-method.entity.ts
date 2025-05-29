import { ApiProperty } from '@nestjs/swagger';

export class PaymentMethod {
  @ApiProperty({
    description: 'Unique ID of the payment method',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Description of the payment method',
    example: 'Credit Card'
  })
  description: string;

  @ApiProperty({
    description: 'Code of the payment method',
    example: 'CC',
    required: false
  })
  code?: string;

  @ApiProperty({
    description: 'Type of payment method',
    example: 'card',
    required: false
  })
  type?: string;

  @ApiProperty({
    description: 'Status of the payment method (active/inactive)',
    example: true
  })
  active: boolean;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00.000Z'
  })
  updatedAt: Date;
}
