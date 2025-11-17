export interface AccountReceivable {
  id: number;
  vendaNumeroPedido?: string;
  vendaModelo?: string;
  vendaSerie?: string;
  vendaClienteId?: number;
  parcela?: number;
  clienteId: number;
  clienteNome?: string;
  clienteCnpjCpf?: string;
  numeroDocumento: string;
  tipoDocumento: 'FATURA' | 'DUPLICATA' | 'BOLETO' | 'NOTA_FISCAL';
  dataEmissao: string;
  dataVencimento: string;
  dataRecebimento?: string;
  valorOriginal: number;
  valorDesconto: number;
  valorJuros: number;
  valorMulta: number;
  valorRecebido: number;
  valorSaldo: number;
  formaPagamentoId?: number;
  formaPagamentoNome?: string;
  status: 'ABERTO' | 'RECEBIDO' | 'VENCIDO' | 'CANCELADO';
  recebidoPor?: number;
  recebidoPorNome?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountReceivableDto {
  vendaNumeroPedido?: string;
  vendaModelo?: string;
  vendaSerie?: string;
  vendaClienteId?: number;
  parcela?: number;
  clienteId: number;
  numeroDocumento: string;
  tipoDocumento?: 'FATURA' | 'DUPLICATA' | 'BOLETO' | 'NOTA_FISCAL';
  dataEmissao: string;
  dataVencimento: string;
  valorOriginal: number;
  valorDesconto?: number;
  valorJuros?: number;
  valorMulta?: number;
  formaPagamentoId?: number;
  observacoes?: string;
}

export interface UpdateAccountReceivableDto {
  numeroDocumento?: string;
  tipoDocumento?: 'FATURA' | 'DUPLICATA' | 'BOLETO' | 'NOTA_FISCAL';
  dataEmissao?: string;
  dataVencimento?: string;
  dataRecebimento?: string;
  valorOriginal?: number;
  valorDesconto?: number;
  valorJuros?: number;
  valorMulta?: number;
  valorRecebido?: number;
  formaPagamentoId?: number;
  status?: 'ABERTO' | 'RECEBIDO' | 'VENCIDO' | 'CANCELADO';
  recebidoPor?: number;
  observacoes?: string;
}

export interface ReceiveAccountDto {
  dataRecebimento: string;
  valorRecebido: number;
  formaPagamentoId: number;
  valorDesconto?: number;
  valorJuros?: number;
  valorMulta?: number;
  recebidoPor?: number;
  observacoes?: string;
}

export interface AccountReceivableFilters {
  clienteId?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}
