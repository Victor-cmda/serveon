import { PaymentTermInstallment } from "./payment-term-installment.entity";

export class PaymentTerm {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  installments: PaymentTermInstallment[];
}
