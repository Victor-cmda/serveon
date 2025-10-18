export interface Customer {
  id: number;
  cnpjCpf: string;
  tipo: 'F' | 'J';
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidadeId?: number;
  cidadeNome?: string;
  estadoNome?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  isEstrangeiro?: boolean;
  tipoDocumento?: string; // Tipo de documento para estrangeiros (passaporte, id fiscal, etc)
  condicaoPagamentoId?: number;
  condicaoPagamentoNome?: string;
}

export interface CreateCustomerDto {
  cnpjCpf: string;
  tipo: 'F' | 'J';
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidadeId: number;
  cep?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  condicaoPagamentoId?: number;
}

export interface UpdateCustomerDto {
  cliente?: string;
  apelido?: string;
  tipo?: 'F' | 'J';
  razaoSocial?: string;
  nomeFantasia?: string;  inscricaoEstadual?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidadeId?: number;
  cep?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  condicaoPagamentoId?: number;
}
