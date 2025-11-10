export interface AccountPayable {
  id: number;
  compraNumeroPedido?: string;
  compraModelo?: string;
  compraSerie?: string;
  compraFornecedorId?: number;
  fornecedorId: number;
  fornecedorNome?: string;
  fornecedorCnpjCpf?: string;
  numeroDocumento: string;
  tipoDocumento: 'FATURA' | 'DUPLICATA' | 'BOLETO' | 'NOTA_FISCAL';
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  valorOriginal: number;
  valorDesconto: number;
  valorJuros: number;
  valorMulta: number;
  valorPago: number;
  valorSaldo: number;
  formaPagamentoId?: number;
  formaPagamentoNome?: string;
  status: 'ABERTO' | 'PAGO' | 'PARCIAL' | 'VENCIDO' | 'CANCELADO';
  pagoPor?: number;
  pagoPorNome?: string;
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountPayableDto {
  compraNumeroPedido?: string;
  compraModelo?: string;
  compraSerie?: string;
  compraFornecedorId?: number;
  fornecedorId: number;
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

export interface UpdateAccountPayableDto {
  numeroDocumento?: string;
  tipoDocumento?: 'FATURA' | 'DUPLICATA' | 'BOLETO' | 'NOTA_FISCAL';
  dataEmissao?: string;
  dataVencimento?: string;
  dataPagamento?: string;
  valorOriginal?: number;
  valorDesconto?: number;
  valorJuros?: number;
  valorMulta?: number;
  valorPago?: number;
  formaPagamentoId?: number;
  status?: 'ABERTO' | 'PAGO' | 'PARCIAL' | 'VENCIDO' | 'CANCELADO';
  pagoPor?: number;
  observacoes?: string;
}

export interface PayAccountDto {
  dataPagamento: string;
  valorPago: number;
  formaPagamentoId: number;
  valorDesconto?: number;
  valorJuros?: number;
  valorMulta?: number;
  pagoPor?: number;
  observacoes?: string;
}

export interface AccountPayableFilters {
  fornecedorId?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}
