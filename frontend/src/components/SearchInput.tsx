import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, Clock, ArrowRight, Hash, TrendingUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNavigate, NavigateFunction } from 'react-router-dom';

interface NavigationItem {
  title: string;
  path: string;
  description?: string;
  category: string;
  keywords?: string[];
  icon?: React.ReactNode;
  priority?: number; // Maior = mais importante
}

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onNavigate?: (path: string) => void;
}

// Lista expandida de páginas do sistema com categorias e palavras-chave
const navigationItems: NavigationItem[] = [
  // Dashboard
  {
    title: 'Dashboard',
    path: '/',
    description: 'Visão geral e indicadores do sistema',
    category: 'Principal',
    keywords: ['inicio', 'home', 'painel', 'visao geral', 'dashboard', 'kpi', 'metricas', 'estatisticas'],
    priority: 10
  },

  // Operacional - Vendas e Compras
  {
    title: 'Vendas',
    path: '/sales',
    description: 'Gerenciar vendas e pedidos',
    category: 'Operacional',
    keywords: ['venda', 'sale', 'pedido', 'order', 'nf', 'nota fiscal', 'faturamento', 'receita'],
    priority: 9
  },
  {
    title: 'Compras',
    path: '/purchases',
    description: 'Gerenciar compras e fornecimentos',
    category: 'Operacional',
    keywords: ['compra', 'purchase', 'fornecimento', 'aquisicao', 'entrada', 'estoque'],
    priority: 9
  },
  {
    title: 'Contas a Pagar',
    path: '/accounts-payable',
    description: 'Gerenciar contas e pagamentos a fornecedores',
    category: 'Operacional',
    keywords: ['conta', 'pagar', 'pagamento', 'debito', 'divida', 'fornecedor', 'financeiro', 'vencimento'],
    priority: 8
  },

  // Gestão Principal
  {
    title: 'Clientes',
    path: '/customers',
    description: 'Cadastro e gestão de clientes',
    category: 'Cadastros',
    keywords: ['cliente', 'customer', 'cadastro', 'pessoa', 'empresa', 'consumidor', 'comprador', 'cpf', 'cnpj'],
    priority: 9
  },
  {
    title: 'Fornecedores',
    path: '/suppliers',
    description: 'Cadastro e gestão de fornecedores',
    category: 'Cadastros',
    keywords: ['fornecedor', 'supplier', 'vendedor', 'empresa', 'compra', 'suprimento', 'cnpj'],
    priority: 9
  },
  {
    title: 'Transportadoras',
    path: '/transporters',
    description: 'Gestão de empresas transportadoras',
    category: 'Cadastros',
    keywords: ['transportadora', 'frete', 'entrega', 'logistica', 'correio', 'transporte', 'envio'],
    priority: 7
  },
  {
    title: 'Produtos',
    path: '/products',
    description: 'Cadastro e gestão de produtos e serviços',
    category: 'Cadastros',
    keywords: ['produto', 'item', 'mercadoria', 'estoque', 'inventario', 'sku', 'catalogo', 'preco'],
    priority: 9
  },

  // Recursos Humanos
  {
    title: 'Funcionários',
    path: '/employees',
    description: 'Cadastro e gestão de funcionários',
    category: 'RH',
    keywords: ['funcionario', 'employee', 'colaborador', 'pessoa', 'rh', 'trabalhador', 'equipe', 'staff'],
    priority: 8
  },
  {
    title: 'Departamentos',
    path: '/departments',
    description: 'Gestão de departamentos e setores',
    category: 'RH',
    keywords: ['departamento', 'setor', 'divisao', 'area', 'organizacao', 'estrutura', 'unidade'],
    priority: 6
  },
  {
    title: 'Cargos',
    path: '/positions',
    description: 'Gestão de cargos e funções',
    category: 'RH',
    keywords: ['cargo', 'funcao', 'position', 'role', 'trabalho', 'ocupacao', 'posto'],
    priority: 6
  },

  // Localização
  {
    title: 'Países',
    path: '/countries',
    description: 'Cadastro de países',
    category: 'Localização',
    keywords: ['pais', 'country', 'nacao', 'territorio', 'geografia', 'nacionalidade'],
    priority: 4
  },
  {
    title: 'Estados',
    path: '/states',
    description: 'Cadastro de estados',
    category: 'Localização',
    keywords: ['estado', 'state', 'uf', 'regiao', 'provincia', 'unidade federativa'],
    priority: 4
  },
  {
    title: 'Cidades',
    path: '/cities',
    description: 'Cadastro de cidades e municípios',
    category: 'Localização',
    keywords: ['cidade', 'city', 'municipio', 'localidade', 'urbano', 'ibge', 'endereco'],
    priority: 4
  },

  // Financeiro
  {
    title: 'Métodos de Pagamento',
    path: '/payment-methods',
    description: 'Configuração de formas de pagamento',
    category: 'Financeiro',
    keywords: ['pagamento', 'payment', 'forma', 'meio', 'dinheiro', 'cartao', 'pix', 'boleto', 'debito', 'credito'],
    priority: 7
  },
  {
    title: 'Condições de Pagamento',
    path: '/payment-terms',
    description: 'Configuração de condições e prazos',
    category: 'Financeiro',
    keywords: ['condicao', 'termo', 'prazo', 'parcelamento', 'financeiro', 'parcela', 'juros', 'desconto'],
    priority: 7
  },

  // Cadastros Auxiliares
  {
    title: 'Categorias',
    path: '/categories',
    description: 'Categorias e classificações de produtos',
    category: 'Cadastros Auxiliares',
    keywords: ['categoria', 'tipo', 'grupo', 'classificacao', 'classe', 'segmento', 'familia'],
    priority: 6
  },
  {
    title: 'Marcas',
    path: '/brands',
    description: 'Marcas e fabricantes de produtos',
    category: 'Cadastros Auxiliares',
    keywords: ['marca', 'brand', 'fabricante', 'empresa', 'logo', 'industria', 'produtor'],
    priority: 6
  },
  {
    title: 'Unidades de Medida',
    path: '/unit-measures',
    description: 'Unidades de medida e conversões',
    category: 'Cadastros Auxiliares',
    keywords: ['unidade', 'medida', 'unit', 'kg', 'metro', 'litro', 'peca', 'quantidade', 'conversao'],
    priority: 5
  },
];

// Função de busca fuzzy aprimorada com melhor scoring
function fuzzySearch(needle: string, haystack: string): number {
  const hlen = haystack.length;
  const nlen = needle.length;
  if (nlen > hlen) return 0;
  if (nlen === hlen) return needle.toLowerCase() === haystack.toLowerCase() ? 1 : 0;

  let score = 0;
  let nidx = 0;
  let consecutiveBonus = 0;
  let lastMatchIndex = -2;

  for (let i = 0; i < hlen && nidx < nlen; i++) {
    if (needle[nidx].toLowerCase() === haystack[i].toLowerCase()) {
      // Bonus por caracteres consecutivos
      if (i === lastMatchIndex + 1) {
        consecutiveBonus += 0.15;
      } else {
        consecutiveBonus = 0;
      }

      // Bonus por match no início
      const positionBonus = i === 0 ? 0.3 : 0;

      // Bonus por match após espaço ou traço
      const wordBoundaryBonus = (i > 0 && (haystack[i - 1] === ' ' || haystack[i - 1] === '-')) ? 0.2 : 0;

      score += (1.0 / hlen) + consecutiveBonus + positionBonus + wordBoundaryBonus;
      lastMatchIndex = i;
      nidx++;
    }
  }

  return nidx === nlen ? Math.min(score, 1) : 0;
}

// Função para normalizar texto (remover acentos)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Função para calcular distância de Levenshtein (similaridade de strings)
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Hook para gerenciar histórico e estatísticas de pesquisas
function useSearchHistory() {
  const getHistory = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem('serveon-search-history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const addToHistory = useCallback((term: string) => {
    if (term.trim().length < 2) return;

    try {
      const history = getHistory();
      const filtered = history.filter(item => item !== term);
      const newHistory = [term, ...filtered].slice(0, 10); // Aumentado para 10 itens
      localStorage.setItem('serveon-search-history', JSON.stringify(newHistory));
    } catch {
      // Ignorar erros de localStorage
    }
  }, [getHistory]);

  const clearHistory = useCallback(() => {
    try {
      localStorage.removeItem('serveon-search-history');
    } catch {
      // Ignorar erros
    }
  }, []);

  // Rastrear páginas mais visitadas
  const trackVisit = useCallback((path: string) => {
    try {
      const stored = localStorage.getItem('serveon-page-visits');
      const visits = stored ? JSON.parse(stored) : {};
      visits[path] = (visits[path] || 0) + 1;
      localStorage.setItem('serveon-page-visits', JSON.stringify(visits));
    } catch {
      // Ignorar erros
    }
  }, []);

  const getPopularPages = useCallback((): Record<string, number> => {
    try {
      const stored = localStorage.getItem('serveon-page-visits');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  return { getHistory, addToHistory, clearHistory, trackVisit, getPopularPages };
}

// Componente interno que usa useNavigate
function SearchInputWithNavigation(props: SearchInputProps) {
  const navigate = useNavigate();
  return <SearchInputInternal {...props} navigate={navigate} />;
}

// Componente interno que recebe a função navigate
function SearchInputInternal({
  placeholder = 'Buscar no sistema... (Ctrl+K)',
  className,
  navigate,
  onNavigate,
}: SearchInputProps & { navigate?: NavigateFunction }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredItems, setFilteredItems] = useState<NavigationItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showHistory, setShowHistory] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { getHistory, addToHistory, clearHistory, trackVisit, getPopularPages } = useSearchHistory();

  // Memorizar páginas populares para otimização
  const popularPages = useMemo(() => getPopularPages(), [getPopularPages]);

  // Função de busca inteligente aprimorada
  const searchItems = useCallback((query: string): NavigationItem[] => {
    if (query.trim() === '') return [];

    const normalizedQuery = normalizeText(query);
    const queryWords = normalizedQuery.split(/\s+/);
    const results: Array<NavigationItem & { score: number }> = [];

    navigationItems.forEach(item => {
      let score = 0;
      const normalizedTitle = normalizeText(item.title);
      const normalizedDesc = item.description ? normalizeText(item.description) : '';
      const normalizedCategory = normalizeText(item.category);

      // 1. Match exato no título (peso 10)
      if (normalizedTitle === normalizedQuery) {
        score += 10;
      }

      // 2. Título começa com a busca (peso 8)
      if (normalizedTitle.startsWith(normalizedQuery)) {
        score += 8;
      }

      // 3. Título contém a busca (peso 5)
      if (normalizedTitle.includes(normalizedQuery)) {
        score += 5;
      }

      // 4. Busca fuzzy no título (peso 4)
      const titleFuzzyScore = fuzzySearch(normalizedQuery, normalizedTitle);
      score += titleFuzzyScore * 4;

      // 5. Similaridade por Levenshtein (peso 3)
      const maxLength = Math.max(normalizedQuery.length, normalizedTitle.length);
      const distance = levenshteinDistance(normalizedQuery, normalizedTitle);
      const similarity = 1 - (distance / maxLength);
      if (similarity > 0.6) {
        score += similarity * 3;
      }

      // 6. Busca por palavras individuais (peso 2 cada)
      queryWords.forEach(word => {
        if (word.length >= 2) {
          if (normalizedTitle.includes(word)) score += 2;
          if (normalizedDesc.includes(word)) score += 1;
          if (normalizedCategory.includes(word)) score += 0.5;
        }
      });

      // 7. Busca nas palavras-chave (peso 3)
      if (item.keywords) {
        item.keywords.forEach(keyword => {
          const normalizedKeyword = normalizeText(keyword);
          if (normalizedKeyword === normalizedQuery) {
            score += 4;
          } else if (normalizedKeyword.includes(normalizedQuery)) {
            score += 3;
          }
          score += fuzzySearch(normalizedQuery, normalizedKeyword) * 2;
        });
      }

      // 8. Busca na descrição (peso 1.5)
      if (item.description && normalizedDesc.includes(normalizedQuery)) {
        score += 1.5;
      }

      // 9. Busca na categoria (peso 1)
      if (normalizedCategory.includes(normalizedQuery)) {
        score += 1;
      }

      // 10. Bonus por prioridade da página (peso variável)
      if (item.priority) {
        score += item.priority * 0.3;
      }

      // 11. Bonus por popularidade (páginas mais visitadas)
      const visits = popularPages[item.path] || 0;
      if (visits > 0) {
        score += Math.min(visits * 0.2, 2); // Máximo de 2 pontos por popularidade
      }

      if (score > 0) {
        results.push({ ...item, score });
      }
    });

    // Ordenar por score e retornar top 10 resultados
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ score, ...item }) => item);
  }, [popularPages]);

  // Filtrar itens baseado no valor de busca
  useEffect(() => {
    const filtered = searchItems(searchValue);
    setFilteredItems(filtered);
    setSelectedIndex(-1);
  }, [searchValue, searchItems]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!searchFocused) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredItems.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && filteredItems[selectedIndex]) {
            handleSelectItem(filteredItems[selectedIndex].path, filteredItems[selectedIndex].title);
          }
          break;
        case 'Escape':
          setSearchFocused(false);
          setSearchValue('');
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchFocused, filteredItems, selectedIndex]);

  // Atalho global Ctrl+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setSearchFocused(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Navegar para a página selecionada
  const handleSelectItem = (path: string, title?: string) => {
    if (title) {
      addToHistory(title);
    }
    
    trackVisit(path);

    if (navigate) {
      navigate(path);
    } else if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }

    setSearchValue('');
    setSearchFocused(false);
    setShowHistory(false);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowHistory(value === '');
    setShowSuggestions(value.length === 0);
  };

  const handleFocus = () => {
    setSearchFocused(true);
    if (searchValue === '') {
      setShowHistory(true);
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Pequeno atraso para permitir cliques nos resultados
    setTimeout(() => {
      setSearchFocused(false);
      setShowHistory(false);
      setShowSuggestions(false);
    }, 200);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setShowHistory(true);
    setShowSuggestions(true);
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    clearHistory();
    setShowHistory(false);
  };

  // Sugestões de páginas populares
  const suggestedPages = useMemo(() => {
    return navigationItems
      .sort((a, b) => {
        const visitsA = popularPages[a.path] || 0;
        const visitsB = popularPages[b.path] || 0;
        if (visitsA !== visitsB) return visitsB - visitsA;
        return (b.priority || 0) - (a.priority || 0);
      })
      .slice(0, 5);
  }, [popularPages]);

  // Mostrar histórico e sugestões quando campo estiver vazio e focado
  const historyItems = showHistory ? getHistory() : [];
  const showResults = searchFocused && (filteredItems.length > 0 || historyItems.length > 0 || showSuggestions);

  return (
    <div className={cn('relative max-w-md flex-1', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchValue}
          className={cn(
            'w-full border-border bg-background pl-10 transition-all duration-200',
            searchValue ? 'pr-9' : 'pr-4',
            searchFocused
              ? 'border-primary ring-2 ring-primary/20'
              : 'hover:border-muted-foreground/20',
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleSearchChange}
          autoComplete="off"
          spellCheck="false"
        />
        {searchValue && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleClearSearch}
            type="button"
            aria-label="Limpar busca"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Lista de resultados da busca */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-border bg-background shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="max-h-[500px] overflow-y-auto py-2">
            {/* Histórico de pesquisas */}
            {historyItems.length > 0 && searchValue === '' && (
              <>
                <div className="px-3 py-2 flex items-center justify-between">
                  <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Pesquisas Recentes
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                  >
                    Limpar
                  </button>
                </div>
                {historyItems.map((term, index) => (
                  <button
                    key={`history-${index}`}
                    className="flex w-full items-center px-3 py-2.5 text-left hover:bg-muted/70 transition-colors text-sm group"
                    onClick={() => setSearchValue(term)}
                    type="button"
                  >
                    <Clock className="h-3.5 w-3.5 mr-2.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="flex-1">{term}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
                {(filteredItems.length > 0 || showSuggestions) && <div className="border-t border-border my-2" />}
              </>
            )}

            {/* Sugestões de páginas populares */}
            {showSuggestions && searchValue === '' && suggestedPages.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Páginas Populares
                </div>
                {suggestedPages.map((item) => (
                  <button
                    key={`suggested-${item.path}`}
                    className="flex w-full flex-col px-3 py-2.5 text-left hover:bg-muted/70 transition-colors group"
                    onClick={() => handleSelectItem(item.path, item.title)}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm group-hover:text-primary transition-colors">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {item.category}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    {item.description && (
                      <span className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </span>
                    )}
                  </button>
                ))}
                {filteredItems.length > 0 && <div className="border-t border-border my-2" />}
              </>
            )}

            {/* Resultados da busca */}
            {filteredItems.length > 0 && searchValue !== '' && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  Resultados ({filteredItems.length})
                </div>
                {filteredItems.map((item, index) => (
                  <button
                    key={item.path}
                    className={cn(
                      "flex w-full flex-col px-3 py-2.5 text-left transition-all duration-150 group",
                      selectedIndex === index
                        ? "bg-primary/10 border-l-2 border-l-primary"
                        : "hover:bg-muted/70 border-l-2 border-l-transparent"
                    )}
                    onClick={() => handleSelectItem(item.path, item.title)}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-medium text-sm transition-colors",
                        selectedIndex === index ? "text-primary" : "group-hover:text-primary"
                      )}>
                        {item.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={selectedIndex === index ? "default" : "outline"} 
                          className="text-[10px] px-1.5 py-0"
                        >
                          {item.category}
                        </Badge>
                        <ArrowRight className={cn(
                          "h-3 w-3 transition-all",
                          selectedIndex === index 
                            ? "text-primary translate-x-0 opacity-100" 
                            : "text-muted-foreground -translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                        )} />
                      </div>
                    </div>
                    {item.description && (
                      <span className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {item.description}
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}

            {/* Nenhum resultado encontrado */}
            {filteredItems.length === 0 && searchValue !== '' && (
              <div className="px-3 py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-3">
                  <Search className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Nenhum resultado encontrado
                </p>
                <p className="text-xs text-muted-foreground">
                  Tente usar palavras-chave diferentes ou verifique a ortografia
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Exportar ambos os componentes para flexibilidade
export { SearchInputWithNavigation as SearchInputWithRouter };
export { SearchInputInternal };

// Componente padrão exportado
export function SearchInput(props: SearchInputProps) {
  try {
    // Tenta usar o componente com Router
    return <SearchInputWithNavigation {...props} />;
  } catch {
    // Fallback para o componente sem Router
    console.warn('Router context not available, using fallback navigation');
    return <SearchInputInternal {...props} />;
  }
}
