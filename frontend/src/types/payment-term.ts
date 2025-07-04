export interface PaymentTerm {
  id: number;
  name: string;
  description?: string;
  interestRate: number;
  fineRate: number;
  discountPercentage: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  installments: PaymentTermInstallment[];
}

export interface PaymentTermInstallment {
  id: number;
  paymentTermId: number;
  installmentNumber: number;
  paymentMethodId: number;
  daysToPayment: number;
  percentageValue: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentTermDto {
  name: string;
  description?: string;
  interestRate?: number;
  fineRate?: number;
  discountPercentage?: number;
  ativo?: boolean;
  installments: CreatePaymentTermInstallmentDto[];
}

export interface CreatePaymentTermInstallmentDto {
  installmentNumber: number;
  paymentMethodId: number;
  daysToPayment: number;
  percentageValue: number;
  ativo?: boolean;
}

export interface UpdatePaymentTermDto {
  name?: string;
  description?: string;
  interestRate?: number;
  fineRate?: number;
  discountPercentage?: number;
  ativo?: boolean;
  installments?: CreatePaymentTermInstallmentDto[];
}