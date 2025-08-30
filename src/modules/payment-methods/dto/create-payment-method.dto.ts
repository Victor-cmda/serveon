import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty({
    description: 'Name of the payment method',
    example: 'Credit Card',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Type of payment method',
    example: 'card',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  type: string;

  @ApiProperty({
    description: 'Status of the payment method (active/inactive)',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
