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
    description: 'Description of the payment method',
    example: 'Credit Card',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  description: string;

  @ApiProperty({
    description: 'Code of the payment method',
    example: 'CC',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  code?: string;

  @ApiProperty({
    description: 'Type of payment method',
    example: 'card',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  type?: string;

  @ApiProperty({
    description: 'Status of the payment method (active/inactive)',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
