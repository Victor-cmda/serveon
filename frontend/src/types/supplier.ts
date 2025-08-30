export interface Supplier {
  id: number;
  fornecedor: string;
  apelido: string;
  cnpjCpf: string;
  tipo: 'F' | 'J';
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  paisId?: number;
  nacionalidadeId?: number;
  estadoId?: number;
  cidadeId?: number;
  cidadeNome?: string;
  estadoNome?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  limiteCredito?: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  isEstrangeiro?: boolean;
  tipoDocumento?: string; // Tipo de documento para estrangeiros (passaporte, id fiscal, etc)
  condicaoPagamentoId?: number;
  condicaoPagamentoNome?: string;
  // Campos específicos para fornecedores
  website?: string;
  observacoes?: string;
  responsavel?: string;
  celularResponsavel?: string;
}

export interface CreateSupplierDto {
  fornecedor: string;
  apelido: string;
  cnpjCpf: string;
  tipo: 'F' | 'J';
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  paisId?: number;
  nacionalidadeId?: number;
  estadoId?: number;
  cidadeId?: number;
  cep?: string;
  telefone?: string;
  email?: string;
  limiteCredito?: number;
  ativo?: boolean;
  isEstrangeiro?: boolean;
  tipoDocumento?: string;
  condicaoPagamentoId?: number;
  // Campos específicos para fornecedores
  website?: string;
  observacoes?: string;
  responsavel?: string;
  celularResponsavel?: string;
}

export interface UpdateSupplierDto {
  tipo?: 'F' | 'J';
  razaoSocial?: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  paisId?: number;
  nacionalidadeId?: number;
  estadoId?: number;
  cidadeId?: number;
  cep?: string;
  telefone?: string;
  email?: string;
  limiteCredito?: number;
  ativo?: boolean;
  isEstrangeiro?: boolean;
  tipoDocumento?: string;
  condicaoPagamentoId?: number;
  // Campos específicos para fornecedores
  website?: string;
  observacoes?: string;
  responsavel?: string;
  celularResponsavel?: string;
}
