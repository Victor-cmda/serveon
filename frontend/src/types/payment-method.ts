export interface PaymentMethod {
  id: number;
  description: string;
  code?: string;
  type?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentMethodDto {
  description: string;
  code?: string;
  type?: string;
  active?: boolean;
}

export interface UpdatePaymentMethodDto {
  description?: string;
  code?: string;
  type?: string;
  active?: boolean;
} 