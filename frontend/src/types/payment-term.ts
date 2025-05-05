export interface PaymentTerm {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  installments: PaymentTermInstallment[];
}

export interface PaymentTermInstallment {
  id: string;
  paymentTermId: string;
  installmentNumber: number;
  paymentMethodId: string;
  daysToPayment: number;
  percentageValue: number;
  interestRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentTermDto {
  name: string;
  description?: string;
  isActive?: boolean;
  installments: CreatePaymentTermInstallmentDto[];
}

export interface CreatePaymentTermInstallmentDto {
  installmentNumber: number;
  paymentMethodId: string;
  daysToPayment: number;
  percentageValue: number;
  interestRate?: number;
  isActive?: boolean;
}

export interface UpdatePaymentTermDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  installments?: CreatePaymentTermInstallmentDto[];
}