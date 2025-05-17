export interface Supplier {
  id: string;
  cnpjCpf: string;
  tipo: 'F' | 'J';
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidadeId?: string;
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
  condicaoPagamentoId?: string;
  condicaoPagamentoNome?: string;
  // Campos específicos para fornecedores
  website?: string;
  observacoes?: string;
  responsavel?: string;
  celularResponsavel?: string;
}

export interface CreateSupplierDto {
  cnpjCpf: string;
  tipo: 'F' | 'J';
  razaoSocial: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidadeId: string;
  cep?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  condicaoPagamentoId?: string;
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
  inscricaoMunicipal?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidadeId?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  ativo?: boolean;
  condicaoPagamentoId?: string;
  // Campos específicos para fornecedores
  website?: string;
  observacoes?: string;
  responsavel?: string;
  celularResponsavel?: string;
}
