export interface Transporter {
  id: number;
  cnpj: string;
  nome: string;
  nomeFantasia?: string;
  paisId?: number;
  estadoId?: number;
  cidadeId?: number;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  website?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Campos relacionados (para exibição)
  paisNome?: string;
  estadoNome?: string;
  cidadeNome?: string;
  uf?: string;
}

export interface CreateTransporterDto {
  cnpj: string;
  nome: string;
  nomeFantasia?: string;
  paisId?: number;
  estadoId?: number;
  cidadeId?: number;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  website?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface UpdateTransporterDto extends Partial<CreateTransporterDto> {
  id?: number;
}
