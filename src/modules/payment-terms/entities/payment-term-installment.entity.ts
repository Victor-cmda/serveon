export class PaymentTermInstallment {
  id: string;
  paymentTermId: string;
  installmentNumber: number;
  paymentMethodId: string;
  daysToPayment: number;
  percentageValue: number;
  interestRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}