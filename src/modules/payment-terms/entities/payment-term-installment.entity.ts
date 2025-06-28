export class PaymentTermInstallment {
  id: number;
  paymentTermId: number;
  installmentNumber: number;
  paymentMethodId: number;
  daysToPayment: number;
  percentageValue: number;
  interestRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
