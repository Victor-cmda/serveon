import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
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
  @IsBoolean()
  ativo?: boolean = true; // Manter ativo no backend para consistência com banco de dados

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentTermInstallmentDto)
  installments: CreatePaymentTermInstallmentDto[];
}
