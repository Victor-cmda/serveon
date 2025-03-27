export interface Country {
    id: string;
    nome: string;
    codigo: string;
    sigla: string;
    createdAt: string;
    updatedAt: string;
}

export interface State {
    id: string;
    nome: string;
    uf: string;
    paisId: string;
    paisNome?: string;
    createdAt: string;
    updatedAt: string;
}

export interface City {
    id: string;
    nome: string;
    codigoIbge?: string;
    estadoId: string;
    estadoNome?: string;
    uf?: string;
    paisNome?: string;
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
}

export interface CreateStateDto {
    nome: string;
    uf: string;
    paisId: string;
}

export interface UpdateStateDto {
    nome?: string;
    uf?: string;
    paisId?: string;
}

export interface CreateCityDto {
    nome: string;
    codigoIbge?: string;
    estadoId: string;
}

export interface UpdateCityDto {
    nome?: string;
    codigoIbge?: string;
    estadoId?: string;
}