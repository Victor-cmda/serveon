export interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodDto {
  name: string;
  type: string;
  ativo?: boolean;
}

export interface UpdatePaymentMethodDto {
  name?: string;
  type?: string;
  ativo?: boolean;
} 