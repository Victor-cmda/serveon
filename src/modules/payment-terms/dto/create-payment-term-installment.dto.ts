import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';

export class CreatePaymentTermInstallmentDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  installmentNumber: number;
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  paymentMethodId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  daysToPayment: number;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  percentageValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  interestRate: number = 0;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean = true; // Manter ativo no backend para consistência com banco de dados
}
