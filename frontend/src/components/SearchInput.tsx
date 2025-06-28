import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn, toUpperCase } from '@/lib/utils';
import { useNavigate, NavigateFunction } from 'react-router-dom';

interface NavigationItem {
  title: string;
  path: string;
  description?: string;
}

interface SearchInputProps {
  placeholder?: string;
  className?: string;
  onNavigate?: (path: string) => void; // Callback alternativo para navegação
}

// Lista de páginas disponíveis no sistema - atualizada com base nas rotas reais
const navigationItems: NavigationItem[] = [
  { title: 'Dashboard', path: '/', description: 'Visão geral do sistema' },
  { title: 'Clientes', path: '/customers', description: 'Cadastro e listagem de clientes' },
  { title: 'Países', path: '/countries', description: 'Gerenciamento de países' },
  { title: 'Estados', path: '/states', description: 'Gerenciamento de estados' },
  { title: 'Cidades', path: '/cities', description: 'Gerenciamento de cidades' },
  { title: 'Métodos de Pagamentos', path: '/payment-methods', description: 'Gerênciamento de Métodos de pagamento' },
];

// Componente interno que usa useNavigate
function SearchInputWithNavigation(props: SearchInputProps) {
  const navigate = useNavigate();
  return <SearchInputInternal {...props} navigate={navigate} />;
}

// Componente interno que recebe a função navigate
function SearchInputInternal({
  placeholder = 'Buscar no sistema...',
  className,
  navigate,
  onNavigate,
}: SearchInputProps & { navigate?: NavigateFunction }) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [filteredItems, setFilteredItems] = useState<NavigationItem[]>([]);

  // Filtrar itens baseado no valor de busca
  useEffect(() => {
    if (searchValue.trim() === '') {
      setFilteredItems([]);
      return;
    }

    const lowerCaseSearch = searchValue.toLowerCase();
    const filtered = navigationItems.filter(
      item =>
        item.title.toLowerCase().includes(lowerCaseSearch) ||
        (item.description && item.description.toLowerCase().includes(lowerCaseSearch))
    );
    setFilteredItems(filtered);
  }, [searchValue]);

  // Navegar para a página selecionada
  const handleSelectItem = (path: string) => {
    if (navigate) {
      navigate(path);
    } else if (onNavigate) {
      onNavigate(path);
    } else {
      // Fallback caso nenhum método de navegação esteja disponível
      window.location.href = path;
    }
    setSearchValue('');
    setSearchFocused(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Transformar o valor para maiúsculas para exibição
    const value = e.target.value;
    setSearchValue(toUpperCase(value));
  };

  return (
    <div className={cn('relative max-w-md flex-1', className)}>
      <div
        className={cn(
          'relative transition-all duration-200 ease-in-out',
          searchFocused ? 'scale-105' : 'scale-100',
        )}
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          value={searchValue}
          className={cn(
            'w-full border-muted bg-muted/30 pl-10 pr-4 transition-all duration-200',
            searchFocused
              ? 'border-primary/50 ring-2 ring-primary/20'
              : 'hover:border-muted/80',
          )}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            // Pequeno atraso para permitir cliques nos resultados
            setTimeout(() => setSearchFocused(false), 150);
          }}
          onChange={handleSearchChange}
          upperCase={true}
        />
      </div>

      {/* Lista de resultados da busca */}
      {searchFocused && filteredItems.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-md border border-border bg-background shadow-md">
          <ul className="py-1">
            {filteredItems.map((item) => (
              <li key={item.path}>
                <button
                  className="flex w-full flex-col px-4 py-2 text-left hover:bg-muted/50"
                  onClick={() => handleSelectItem(item.path)}
                  type="button"
                >
                  <span className="font-medium">{item.title}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
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
