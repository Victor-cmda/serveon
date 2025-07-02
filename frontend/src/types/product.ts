export interface Product {
  id: number;
  produto: string; // Nome/descrição do produto
  codigoBarras?: string;
  referencia?: string;
  descricao?: string;
  observacoes?: string;
  quantidadeMinima: number;
  quantidade: number;
  valorCompra?: number;
  valorVenda?: number;
  percentualLucro?: number;
  pesoLiquido?: number;
  pesoBruto?: number;
  ncm?: string;
  cest?: string;
  gtin?: string;
  gtinTributavel?: string;
  unidade?: string;
  valorUnitario?: number;
  situacao?: string;
  ativo: boolean;
  
  // Relacionamentos
  unidadeMedidaId?: number;
  unidadeMedidaNome?: string;
  
  marcaId?: number;
  marcaNome?: string;
  
  categoriaId?: number;
  categoriaNome?: string;
  
  // Campos de auditoria
  dataCriacao: string;
  dataAlteracao: string;
  usuarioCriacao?: string;
  usuarioAtualizacao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  produto: string;
  codigoBarras?: string | null;
  referencia?: string | null;
  descricao?: string | null;
  observacoes?: string | null;
  quantidadeMinima?: number;
  quantidade?: number;
  valorCompra?: number | null;
  valorVenda?: number | null;
  percentualLucro?: number | null;
  pesoLiquido?: number | null;
  pesoBruto?: number | null;
  ncm?: string | null;
  cest?: string | null;
  gtin?: string | null;
  gtinTributavel?: string | null;
  unidade?: string | null;
  valorUnitario?: number | null;
  situacao?: string | null;
  ativo?: boolean;
  unidadeMedidaId?: number;
  marcaId?: number | null;
  categoriaId?: number;
}

export interface UpdateProductDto {
  produto?: string;
  codigoBarras?: string | null;
  referencia?: string | null;
  descricao?: string | null;
  observacoes?: string | null;
  quantidadeMinima?: number;
  quantidade?: number;
  valorCompra?: number | null;
  valorVenda?: number | null;
  percentualLucro?: number | null;
  pesoLiquido?: number | null;
  pesoBruto?: number | null;
  ncm?: string | null;
  cest?: string | null;
  gtin?: string | null;
  gtinTributavel?: string | null;
  unidade?: string | null;
  valorUnitario?: number | null;
  situacao?: string | null;
  ativo?: boolean;
  unidadeMedidaId?: number;
  marcaId?: number | null;
  categoriaId?: number;
}
