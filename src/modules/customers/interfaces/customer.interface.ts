export interface Customer {
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
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  cidadeNome?: string;
  estadoNome?: string;
  uf?: string;
}