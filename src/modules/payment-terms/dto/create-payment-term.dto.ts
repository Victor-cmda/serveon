import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePaymentTermInstallmentDto } from './create-payment-term-installment.dto';

export class CreatePaymentTermDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fineRate?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercentage?: number = 0;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean = true; // Manter ativo no backend para consistência com banco de dados

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentTermInstallmentDto)
  installments: CreatePaymentTermInstallmentDto[];
}
