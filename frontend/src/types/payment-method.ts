export interface PaymentMethod {
  id: number;
  description: string;
  code?: string;
  type?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodDto {
  description: string;
  code?: string;
  type?: string;
  ativo?: boolean;
}

export interface UpdatePaymentMethodDto {
  description?: string;
  code?: string;
  type?: string;
  ativo?: boolean;
} 