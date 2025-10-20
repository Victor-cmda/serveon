export interface Purchase {
  id: number;
  numeroSequencial?: number | null;
  numeroPedido?: string;
  numeroNota?: string;
  modelo?: string;
  serie?: string;
  fornecedorId: number;
  fornecedorNome?: string;
  dataEmissao: string;
  dataChegada?: string;
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
  status: 'PENDENTE' | 'APROVADO' | 'ENVIADO' | 'RECEBIDO' | 'CANCELADO';
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
}

export interface PurchaseItem {
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

export interface PurchaseInstallment {
  id?: number;
  parcela: number;
  codigoFormaPagto?: string;
  formaPagamentoId: number;
  dataVencimento: string;
  valorParcela: number;
}

export interface CreatePurchaseData {
  numeroPedido?: string;
  numeroNota?: string;
  modelo: string;
  serie: string;
  fornecedorId: number;
  dataEmissao: string;
  dataChegada?: string;
  dataEntregaRealizada?: string;
  condicaoPagamentoId: number;
  formaPagamentoId?: number;
  funcionarioId: number;
  tipoFrete?: 'CIF' | 'FOB';
  valorFrete?: number;
  valorSeguro?: number;
  outrasDespesas?: number;
  valorDesconto?: number;
  valorAcrescimo?: number;
  status?: 'PENDENTE' | 'APROVADO' | 'ENVIADO' | 'RECEBIDO' | 'CANCELADO';
  transportadoraId?: number;
  observacoes?: string;
  aprovadoPor?: number;
  dataAprovacao?: string;
  itens?: PurchaseItem[];
  parcelas?: PurchaseInstallment[];
}

export interface UpdatePurchaseData extends Partial<CreatePurchaseData> {
  ativo?: boolean;
}