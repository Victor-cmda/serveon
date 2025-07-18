export interface UnitMeasure {
  id: number;
  nome: string;
  sigla: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitMeasureDto {
  nome: string;
  sigla: string;
  ativo?: boolean;
}

export interface UpdateUnitMeasureDto {
  nome?: string;
  sigla?: string;
  ativo?: boolean;
}
