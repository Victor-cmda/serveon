import { IsNotEmpty, IsNumber, IsOptional, IsPositive, Min } from 'class-validator';

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
  @IsNumber()
  isActive?: boolean = true;
}