// Formatadores para campos de compras
export const formatCurrency = (value: string | number | undefined): string => {
  if (!value) return '';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) : value;
  if (isNaN(numValue)) return '';
  
  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const formatNumber = (value: string | number | undefined): string => {
  if (!value) return '';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) : value;
  if (isNaN(numValue)) return '';
  
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  });
};

export const formatQuantity = (value: string | number | undefined): string => {
  if (!value) return '';
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) : value;
  if (isNaN(numValue)) return '';
  
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
};

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

export const formatCode = (value: string | undefined): string => {
  if (!value) return '';
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 50);
};

export const formatSerie = (value: string | undefined): string => {
  if (!value) return '';
  return value.replace(/[^0-9]/g, '').slice(0, 10);
};

export const formatModelo = (value: string | undefined): string => {
  if (!value) return '';
  return value.replace(/[^0-9]/g, '').slice(0, 10);
};

export const clearFormat = (value: string | undefined): string => {
  if (!value) return '';
  return value.replace(/[^\d,.-]/g, '').replace(',', '.');
};

export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
};

export const parseNumber = (value: string): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;
};

// Validações específicas para compras
export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== undefined && value !== null;
};

export const validatePositiveNumber = (value: number | string): boolean => {
  const numValue = typeof value === 'string' ? parseNumber(value) : value;
  return numValue >= 0;
};

export const validateDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  if (!startDate || !endDate) return true;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

// Cálculos para compras
export const calculateItemTotal = (
  quantidade: number,
  precoUN: number,
  descUN: number = 0
): { liquidoUN: number; total: number } => {
  const liquidoUN = precoUN - descUN;
  const total = liquidoUN * quantidade;
  
  return {
    liquidoUN: Math.max(0, liquidoUN),
    total: Math.max(0, total),
  };
};

export const calculateItemCusto = (
  liquidoUN: number,
  quantidade: number,
  rateio: number = 0
): { custoFinalUN: number; custoFinal: number } => {
  const rateioUnitario = quantidade > 0 ? rateio / quantidade : 0;
  const custoFinalUN = liquidoUN + rateioUnitario;
  const custoFinal = custoFinalUN * quantidade;
  
  return {
    custoFinalUN: Math.max(0, custoFinalUN),
    custoFinal: Math.max(0, custoFinal),
  };
};

export const calculatePurchaseTotal = (
  totalProdutos: number,
  valorFrete: number = 0,
  valorSeguro: number = 0,
  outrasDespesas: number = 0,
  valorDesconto: number = 0
): number => {
  return Math.max(0, totalProdutos + valorFrete + valorSeguro + outrasDespesas - valorDesconto);
};

// Utilitários para status
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'PENDENTE':
      return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMADA':
      return 'bg-blue-100 text-blue-800';
    case 'ENTREGUE':
      return 'bg-green-100 text-green-800';
    case 'CANCELADA':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'PENDENTE': 'Pendente',
    'CONFIRMADA': 'Confirmada',
    'ENTREGUE': 'Entregue',
    'CANCELADA': 'Cancelada',
  };
  
  return labels[status] || status;
};

// Validação de formulário específica para compras
export const validatePurchaseForm = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!validateRequired(data.fornecedorId)) {
    errors.push('Fornecedor é obrigatório');
  }
  
  if (!validateRequired(data.dataEmissao)) {
    errors.push('Data de emissão é obrigatória');
  }
  
  if (!validateRequired(data.dataChegada)) {
    errors.push('Data de chegada é obrigatória');
  }
  
  if (!validateRequired(data.condicaoPagamentoId)) {
    errors.push('Condição de pagamento é obrigatória');
  }
  
  if (!validateRequired(data.funcionarioId)) {
    errors.push('Funcionário responsável é obrigatório');
  }
  
  if (data.dataEmissao && data.dataChegada && !validateDateRange(data.dataEmissao, data.dataChegada)) {
    errors.push('Data de chegada deve ser posterior à data de emissão');
  }
  
  if (data.valorFrete && !validatePositiveNumber(data.valorFrete)) {
    errors.push('Valor do frete deve ser um número positivo');
  }
  
  if (data.valorSeguro && !validatePositiveNumber(data.valorSeguro)) {
    errors.push('Valor do seguro deve ser um número positivo');
  }
  
  if (data.outrasDespesas && !validatePositiveNumber(data.outrasDespesas)) {
    errors.push('Outras despesas deve ser um número positivo');
  }
  
  if (data.valorDesconto && !validatePositiveNumber(data.valorDesconto)) {
    errors.push('Valor de desconto deve ser um número positivo');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};