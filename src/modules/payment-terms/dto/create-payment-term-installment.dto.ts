import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Min } from 'class-validator';

export class CreatePaymentTermInstallmentDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  installmentNumber: number;

  @IsNotEmpty()
  @IsString()
  @IsUUID()
  paymentMethodId: string;

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
  isActive?: boolean = true;
}