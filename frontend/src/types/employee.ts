export interface Employee {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  celular?: string;
  rg?: string;
  orgaoEmissor?: string;
  dataNascimento?: string;
  estadoCivil?: string;
  nacionalidade?: string;
  
  // Endereço
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidadeId?: number;
  cidadeNome?: string;
  estadoNome?: string;
  uf?: string;
  
  // Profissional
  cargoId?: number;
  cargoNome?: string;
  departamentoId?: number;
  departamentoNome?: string;
  dataAdmissao: string;
  dataDemissao?: string;
  salario?: number;
  observacoes?: string;
  
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  celular?: string;
  rg?: string;
  orgaoEmissor?: string;
  dataNascimento?: string;
  estadoCivil?: string;
  nacionalidade?: string;
  
  // Endereço
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidadeId?: number;
  
  // Profissional
  cargoId?: number;
  departamentoId?: number;
  dataAdmissao: string;
  salario?: number;
  observacoes?: string;
  ativo?: boolean;
}

export interface UpdateEmployeeDto {
  nome?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  rg?: string;
  orgaoEmissor?: string;
  dataNascimento?: string;
  estadoCivil?: string;
  nacionalidade?: string;
  
  // Endereço
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidadeId?: number;
  
  // Profissional
  cargoId?: number;
  departamentoId?: number;
  dataAdmissao?: string;
  dataDemissao?: string;
  salario?: number;
  observacoes?: string;
  ativo?: boolean;
}
