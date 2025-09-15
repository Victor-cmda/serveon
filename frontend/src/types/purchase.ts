export interface Purchase {
  id: number;
  numeroSequencial?: number | null;
  codigo?: string;
  modelo?: string;
  serie?: string;
  codigoFornecedor?: string;
  fornecedorId: number;
  fornecedorNome?: string;
  dataEmissao: string;
  dataChegada: string;
  condicaoPagamentoId: number;
  condicaoPagamentoNome?: string;
  funcionarioId: number;
  funcionarioNome?: string;
  tipoFrete: 'CIF' | 'FOB';
  valorFrete: number;
  valorSeguro: number;
  outrasDespesas: number;
  totalProdutos: number;
  valorDesconto: number;
  totalAPagar: number;
  status: 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA' | 'ENTREGUE';
  transportadoraId?: number;
  transportadoraNome?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id?: number;
  compraId?: number;
  codigo: string;
  produtoId: number;
  produto: string;
  unidade: string;
  quantidade: number;
  precoUN: number;
  descUN: number;
  liquidoUN: number;
  total: number;
  rateio: number;
  custoFinalUN: number;
  custoFinal: number;
}

export interface PurchaseInstallment {
  id?: number;
  compraId?: number;
  parcela: number;
  codigoFormaPagto: string;
  formaPagamentoId: number;
  formaPagamento: string;
  dataVencimento: string;
  valorParcela: number;
}

export interface CreatePurchaseData {
  codigo?: string;
  modelo?: string;
  serie?: string;
  codigoFornecedor?: string;
  fornecedorId: number;
  dataEmissao: string;
  dataChegada: string;
  condicaoPagamentoId: number;
  funcionarioId: number;
  tipoFrete?: 'CIF' | 'FOB';
  valorFrete?: number;
  valorSeguro?: number;
  outrasDespesas?: number;
  valorDesconto?: number;
  status?: 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA' | 'ENTREGUE';
  transportadoraId?: number;
  observacoes?: string;
  itens?: PurchaseItem[];
  parcelas?: PurchaseInstallment[];
}

export interface UpdatePurchaseData extends Partial<CreatePurchaseData> {
  ativo?: boolean;
}