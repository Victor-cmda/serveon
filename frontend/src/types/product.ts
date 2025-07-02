export interface Product {
  id: number;
  produto: string; // Nome/descrição do produto
  codigo?: string;
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
  codigo?: string;
  codigoBarras?: string;
  referencia?: string;
  descricao?: string;
  observacoes?: string;
  quantidadeMinima?: number;
  quantidade?: number;
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
  ativo?: boolean;
  unidadeMedidaId?: number;
  marcaId?: number;
  categoriaId?: number;
}

export interface UpdateProductDto {
  produto?: string;
  codigo?: string;
  codigoBarras?: string;
  referencia?: string;
  descricao?: string;
  observacoes?: string;
  quantidadeMinima?: number;
  quantidade?: number;
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
  ativo?: boolean;
  unidadeMedidaId?: number;
  marcaId?: number;
  categoriaId?: number;
}
