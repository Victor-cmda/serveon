import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Clock, ArrowRight, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate, NavigateFunction } from 'react-router-dom';

interface NavigationItem {
  title: string;
  path: string;
  description?: string;
  category: string;
  keywords?: string[];
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
    description: 'Visão geral do sistema',
    category: 'Principal',
    keywords: ['inicio', 'home', 'painel', 'visao geral', 'dashboard']
  },

  // Gestão Principal
  {
    title: 'Clientes',
    path: '/customers',
    description: 'Cadastro e gestão de clientes',
    category: 'Gestão Principal',
    keywords: ['cliente', 'customer', 'cadastro', 'pessoa', 'empresa']
  },
  {
    title: 'Fornecedores',
    path: '/suppliers',
    description: 'Cadastro e gestão de fornecedores',
    category: 'Gestão Principal',
    keywords: ['fornecedor', 'supplier', 'vendedor', 'empresa', 'compra']
  },
  {
    title: 'Transportadoras',
    path: '/transporters',
    description: 'Gestão de empresas transportadoras',
    category: 'Gestão Principal',
    keywords: ['transportadora', 'frete', 'entrega', 'logistica', 'correio']
  },
  {
    title: 'Produtos',
    path: '/products',
    description: 'Cadastro e gestão de produtos',
    category: 'Gestão Principal',
    keywords: ['produto', 'item', 'mercadoria', 'estoque', 'inventario']
  },
  {
    title: 'Notas Fiscais',
    path: '/invoices',
    description: 'Emissão e gestão de notas fiscais',
    category: 'Gestão Principal',
    keywords: ['nota fiscal', 'nfe', 'invoice', 'documento', 'imposto']
  },

  // Recursos Humanos
  {
    title: 'Funcionários',
    path: '/employees',
    description: 'Cadastro e gestão de funcionários',
    category: 'RH',
    keywords: ['funcionario', 'employee', 'colaborador', 'pessoa', 'rh']
  },
  {
    title: 'Departamentos',
    path: '/departments',
    description: 'Gestão de departamentos',
    category: 'RH',
    keywords: ['departamento', 'setor', 'divisao', 'area', 'organizacao']
  },
  {
    title: 'Cargos',
    path: '/positions',
    description: 'Gestão de cargos e funções',
    category: 'RH',
    keywords: ['cargo', 'funcao', 'position', 'role', 'trabalho']
  },

  // Localização
  {
    title: 'Países',
    path: '/countries',
    description: 'Cadastro de países',
    category: 'Localização',
    keywords: ['pais', 'country', 'nacao', 'territorio', 'geografia']
  },
  {
    title: 'Estados',
    path: '/states',
    description: 'Cadastro de estados',
    category: 'Localização',
    keywords: ['estado', 'state', 'uf', 'regiao', 'provincia']
  },
  {
    title: 'Cidades',
    path: '/cities',
    description: 'Cadastro de cidades',
    category: 'Localização',
    keywords: ['cidade', 'city', 'municipio', 'localidade', 'urbano']
  },

  // Administração
  {
    title: 'Métodos de Pagamento',
    path: '/payment-methods',
    description: 'Configuração de métodos de pagamento',
    category: 'Administração',
    keywords: ['pagamento', 'payment', 'forma', 'meio', 'dinheiro', 'cartao', 'pix']
  },
  {
    title: 'Condições de Pagamento',
    path: '/payment-terms',
    description: 'Configuração de condições de pagamento',
    category: 'Administração',
    keywords: ['condicao', 'termo', 'prazo', 'parcelamento', 'financeiro']
  },
  {
    title: 'Configurações',
    path: '/settings',
    description: 'Configurações do sistema',
    category: 'Administração',
    keywords: ['config', 'setting', 'opcao', 'preferencia', 'sistema']
  },

  // Cadastros de Produtos
  {
    title: 'Categorias',
    path: '/categories',
    description: 'Categorias de produtos',
    category: 'Cadastros',
    keywords: ['categoria', 'tipo', 'grupo', 'classificacao', 'classe']
  },
  {
    title: 'Marcas',
    path: '/brands',
    description: 'Marcas de produtos',
    category: 'Cadastros',
    keywords: ['marca', 'brand', 'fabricante', 'empresa', 'logo']
  },
  {
    title: 'Unidades de Medida',
    path: '/unit-measures',
    description: 'Unidades de medida para produtos',
    category: 'Cadastros',
    keywords: ['unidade', 'medida', 'unit', 'kg', 'metro', 'litro', 'peca']
  },
];

// Função de busca fuzzy simples
function fuzzySearch(needle: string, haystack: string): number {
  const hlen = haystack.length;
  const nlen = needle.length;
  if (nlen > hlen) return 0;
  if (nlen === hlen) return needle === haystack ? 1 : 0;

  let score = 0;
  let nidx = 0;

  for (let i = 0; i < hlen && nidx < nlen; i++) {
    if (needle[nidx].toLowerCase() === haystack[i].toLowerCase()) {
      score += (1.0 / hlen);
      nidx++;
    }
  }

  return nidx === nlen ? score : 0;
}

// Hook para gerenciar histórico de pesquisas
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
      const newHistory = [term, ...filtered].slice(0, 5); // Manter apenas 5 itens
      localStorage.setItem('serveon-search-history', JSON.stringify(newHistory));
    } catch {
      // Ignorar erros de localStorage
    }
  }, [getHistory]);

  return { getHistory, addToHistory };
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
  const inputRef = useRef<HTMLInputElement>(null);
  const { getHistory, addToHistory } = useSearchHistory();

  // Função de busca inteligente
  const searchItems = useCallback((query: string): NavigationItem[] => {
    if (query.trim() === '') return [];

    const lowerQuery = query.toLowerCase();
    const results: Array<NavigationItem & { score: number }> = [];

    navigationItems.forEach(item => {
      let score = 0;

      // Busca exata no título (peso 3)
      if (item.title.toLowerCase().includes(lowerQuery)) {
        score += 3;
      }

      // Busca fuzzy no título (peso 2)
      const titleScore = fuzzySearch(lowerQuery, item.title);
      score += titleScore * 2;

      // Busca na descrição (peso 1)
      if (item.description && item.description.toLowerCase().includes(lowerQuery)) {
        score += 1;
      }

      // Busca nas palavras-chave (peso 2)
      if (item.keywords) {
        item.keywords.forEach(keyword => {
          if (keyword.toLowerCase().includes(lowerQuery)) {
            score += 2;
          }
          score += fuzzySearch(lowerQuery, keyword) * 1.5;
        });
      }

      // Busca na categoria (peso 0.5)
      if (item.category.toLowerCase().includes(lowerQuery)) {
        score += 0.5;
      }

      if (score > 0) {
        results.push({ ...item, score });
      }
    });

    // Ordenar por score e retornar apenas os itens
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 8) // Limitar a 8 resultados
      .map(({ score, ...item }) => item);
  }, []);

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
    inputRef.current?.blur();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setShowHistory(false);
  };

  const handleFocus = () => {
    setSearchFocused(true);
    if (searchValue === '') {
      setShowHistory(true);
    }
  };

  const handleBlur = () => {
    // Pequeno atraso para permitir cliques nos resultados
    setTimeout(() => {
      setSearchFocused(false);
      setShowHistory(false);
    }, 150);
  };

  // Mostrar histórico quando campo estiver vazio e focado
  const historyItems = showHistory ? getHistory() : [];
  const showResults = searchFocused && (filteredItems.length > 0 || historyItems.length > 0);

  return (
    <div className={cn('relative max-w-md flex-1', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={searchValue}
          className={cn(
            'w-full border-border bg-background pl-10 pr-4 transition-all duration-200',
            searchFocused
              ? 'border-primary ring-2 ring-primary/20'
              : 'hover:border-muted-foreground/20',
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleSearchChange}
        />
      </div>

      {/* Lista de resultados da busca */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-lg border border-border bg-background shadow-lg">
          <div className="max-h-96 overflow-y-auto py-2">
            {/* Histórico de pesquisas */}
            {historyItems.length > 0 && searchValue === '' && (
              <>
                <div className="px-3 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Pesquisas recentes
                </div>
                {historyItems.map((term, index) => (
                  <button
                    key={`history-${index}`}
                    className="flex w-full items-center px-3 py-2 text-left hover:bg-muted/50 text-sm"
                    onClick={() => setSearchValue(term)}
                    type="button"
                  >
                    <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                    {term}
                  </button>
                ))}
                {filteredItems.length > 0 && <div className="border-t border-border my-1" />}
              </>
            )}

            {/* Resultados da busca */}
            {filteredItems.length > 0 && (
              <>
                <div className="px-3 py-1 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  Páginas ({filteredItems.length})
                </div>
                {filteredItems.map((item, index) => (
                  <button
                    key={item.path}
                    className={cn(
                      "flex w-full flex-col px-3 py-2 text-left transition-colors",
                      selectedIndex === index
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => handleSelectItem(item.path, item.title)}
                    type="button"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.title}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                    {item.description && (
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}

            {/* Nenhum resultado encontrado */}
            {filteredItems.length === 0 && searchValue !== '' && historyItems.length === 0 && (
              <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                Nenhuma página encontrada para "{searchValue}"
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
