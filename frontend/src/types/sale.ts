export interface Sale {
  id: number;
  clienteId: number;
  condicaoPagamentoId: number;
  funcionarioId: number;
  dataVenda: Date;
  dataVencimento: Date;
  valorTotal: number;
  valorDesconto: number;
  valorLiquido: number;
  status: 'ORCAMENTO' | 'CONFIRMADA' | 'CANCELADA' | 'ENTREGUE' | 'FATURADA';
  transportadoraId?: number;
  observacoes?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSaleDto {
  clienteId: number;
  condicaoPagamentoId: number;
  funcionarioId: number;
  dataVenda: Date;
  dataVencimento: Date;
  valorTotal: number;
  valorDesconto?: number;
  status?: 'ORCAMENTO' | 'CONFIRMADA' | 'CANCELADA' | 'ENTREGUE' | 'FATURADA';
  transportadoraId?: number;
  observacoes?: string;
}

export interface UpdateSaleDto extends Partial<CreateSaleDto> {}