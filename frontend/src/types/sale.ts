export interface Sale {
  id: number;
  numeroSequencial?: number | null;
  numeroPedido?: string;
  modelo?: string;
  serie?: string;
  clienteId: number;
  clienteNome?: string;
  dataEmissao: string;
  dataEntrega?: string;
  dataEntregaRealizada?: string;
  condicaoPagamentoId: number;
  condicaoPagamentoNome?: string;
  formaPagamentoId?: number;
  funcionarioId: number;
  funcionarioNome?: string;
  tipoFrete: 'CIF' | 'FOB';
  valorFrete: number;
  valorSeguro: number;
  outrasDespesas: number;
  totalProdutos?: number;
  valorDesconto: number;
  valorAcrescimo?: number;
  totalAPagar?: number;
  status: 'PENDENTE' | 'APROVADO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
  transportadoraId?: number;
  transportadoraNome?: string;
  observacoes?: string;
  aprovadoPor?: number;
  dataAprovacao?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
  itens?: any[];
  parcelas?: any[];
  podeCancelar?: boolean;
}

export interface SaleItem {
  id?: number;
  produtoId: number;
  quantidade: number;
  precoUn: number;
  descUn?: number;
  liquidoUn?: number;
  total?: number;
  rateio?: number;
  custoFinalUn?: number;
  custoFinal?: number;
}

export interface SaleInstallment {
  id?: number;
  parcela: number;
  codigoFormaPagto?: string;
  formaPagamentoId: number;
  dataVencimento: string;
  valorParcela: number;
}

export interface CreateSaleDto {
  numeroPedido?: string;
  modelo?: string;  // Opcional, gerado automaticamente se não fornecido (padrão: '55')
  serie?: string;   // Opcional, gerado automaticamente se não fornecido (padrão: '1')
  clienteId: number;
  dataEmissao: string;
  dataEntrega?: string;
  dataEntregaRealizada?: string;
  condicaoPagamentoId: number;
  formaPagamentoId?: number;
  funcionarioId?: number;
  tipoFrete?: 'CIF' | 'FOB';
  valorFrete?: number;
  valorSeguro?: number;
  outrasDespesas?: number;
  valorDesconto?: number;
  valorAcrescimo?: number;
  status?: 'PENDENTE' | 'APROVADO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
  transportadoraId?: number;
  observacoes?: string;
  aprovadoPor?: number;
  dataAprovacao?: string;
  itens?: SaleItem[];
  parcelas?: SaleInstallment[];
}

export interface UpdateSaleDto extends Partial<CreateSaleDto> {
  ativo?: boolean;
}