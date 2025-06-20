export interface Product {
  id: number;
  nome: string; // Usando produto como nome
  codigo?: string;
  codigoBarras?: string;
  referencia?: string;
  descricao?: string;
  observacoes?: string;
  quantidadeMinima: number;
  quantidade: number;
  valorCompra?: number;
  valorVenda?: number;
  preco: number; // Para compatibilidade com valorVenda
  percentualLucro?: number;
  pesoLiquido?: number;
  pesoBruto?: number;
  ncm?: string;
  cest?: string;
  gtin?: string;
  gtinTributavel?: string;
  situacao?: string;
  ativo: boolean;
  
  // Relacionamentos
  unidadeMedidaId?: number;
  unidadeMedida?: {
    id: number;
    nome: string;
    sigla: string;
  };
  
  marcaId?: number;
  marca?: {
    id: number;
    nome: string;
  };
  
  categoriaId?: number;
  categoria?: {
    id: number;
    nome: string;
  };
  
  // Campos de auditoria
  dataCriacao: string;
  dataAlteracao: string;
  usuarioCriacao?: string;
  usuarioAtualizacao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  nome: string; // produto -> nome
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
  situacao?: string;
  ativo?: boolean;
  unidadeMedidaId?: number;
  marcaId?: number;
  categoriaId?: number;
}

export interface UpdateProductDto {
  nome?: string; // produto -> nome
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
  situacao?: string;
  ativo?: boolean;
  unidadeMedidaId?: number;
  marcaId?: number;
  categoriaId?: number;
}
