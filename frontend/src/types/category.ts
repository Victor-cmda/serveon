export interface Category {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface UpdateCategoryDto {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
}
