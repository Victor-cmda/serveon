export interface Position {
  id: number;
  nome: string;
  descricao?: string;
  departamentoId?: number;
  departamentoNome?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionDto {
  nome: string;
  descricao?: string;
  departamentoId?: number;
  ativo?: boolean;
}

export interface UpdatePositionDto {
  nome?: string;
  descricao?: string;
  departamentoId?: number;
  ativo?: boolean;
}
