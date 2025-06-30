import { PartialType } from '@nestjs/swagger';
import { CreatePaymentMethodDto } from './create-payment-method.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';

export class UpdatePaymentMethodDto extends PartialType(
  CreatePaymentMethodDto,
) {
  @ApiProperty({
    description: 'Description of the payment method',
    example: 'Credit Card',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  description?: string;

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
  })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean; // Manter ativo no backend para consistência com banco de dados
}
