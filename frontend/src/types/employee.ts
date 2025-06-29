export interface Employee {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  rg?: string;
  cidadeId?: number;
  cidadeNome?: string;
  cargoId?: number;
  cargoNome?: string;
  departamentoId?: number;
  departamentoNome?: string;
  dataAdmissao: string;
  dataDemissao?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  rg?: string;
  cidadeId?: number;
  cargoId?: number;
  departamentoId?: number;
  dataAdmissao: string;
  ativo?: boolean;
}

export interface UpdateEmployeeDto {
  nome?: string;
  email?: string;
  telefone?: string;
  rg?: string;
  cidadeId?: number;
  cargoId?: number;
  departamentoId?: number;
  dataAdmissao?: string;
  dataDemissao?: string;
  ativo?: boolean;
}
