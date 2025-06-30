export interface Country {
  id: number;
  nome: string;
  codigo: string;
  sigla: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface State {
  id: number;
  nome: string;
  uf: string;
  paisId: number;
  paisNome?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: number;
  nome: string;
  codigoIbge?: string;
  estadoId: number;
  estadoNome?: string;
  uf?: string;
  paisNome?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCountryDto {
  nome: string;
  codigo: string;
  sigla: string;
}

export interface UpdateCountryDto {
  nome?: string;
  codigo?: string;
  sigla?: string;
  ativo?: boolean;
}

export interface CreateStateDto {
  nome: string;
  uf: string;
  paisId: number;
}

export interface UpdateStateDto {
  nome?: string;
  uf?: string;
  paisId?: number;
  ativo?: boolean;
}

export interface CreateCityDto {
  nome: string;
  codigoIbge?: string;
  estadoId: number;
}

export interface UpdateCityDto {
  nome?: string;
  ativo?: boolean;
  codigoIbge?: string;
  estadoId?: number;
}
