import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
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
  isActive?: boolean = true;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentTermInstallmentDto)
  installments: CreatePaymentTermInstallmentDto[];
}
