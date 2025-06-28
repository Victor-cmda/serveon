export interface Brand {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandDto {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface UpdateBrandDto {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
}
