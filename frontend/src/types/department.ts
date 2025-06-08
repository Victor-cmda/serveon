export interface Department {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  nome: string;
  descricao?: string;
  ativo?: boolean;
}

export interface UpdateDepartmentDto {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
}
