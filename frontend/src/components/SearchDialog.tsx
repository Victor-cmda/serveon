import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  X,
  Filter,
  Plus,
  Search,
  Download,
  Star,
  Table,
  LayoutGrid,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,  TooltipTrigger,
} from '@/components/ui/tooltip';

// Implementação nativa do debounce para evitar dependência do lodash
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export interface Entity {
  id: number;
  [key: string]: any;
}

export interface DisplayColumn<T extends Entity = Entity> {
  key: keyof T | ((item: T) => React.ReactNode);
  header: string;
}

export interface SearchDialogProps<T extends Entity = Entity> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  entities: T[];
  isLoading?: boolean;
  onSelect: (entity: T) => void;
  onCreateNew?: () => void;
  onEdit?: (entity: T) => void; // Nova propriedade para edição
  displayColumns: DisplayColumn<T>[];
  searchKeys: (keyof T)[];
  entityType?: string; // Identificador único para o tipo de entidade (usado para favoritos)
  hideNewButton?: boolean;
  extraActions?: React.ReactNode;
}

interface FilterCondition<T extends Entity = Entity> {
  field: keyof T;
  operator: string;
  value: string;
}

export function SearchDialog<T extends Entity = Entity>({
  open,
  onOpenChange,
  title,
  description,
  entities,
  isLoading = false,
  onSelect,
  onCreateNew,
  onEdit,
  displayColumns,
  searchKeys,
  entityType = 'item',
  hideNewButton = false,
  extraActions,
}: SearchDialogProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterCondition<T>[]>([]);
  const [filterField, setFilterField] = useState<keyof T | ''>('');
  const [filterOperator, setFilterOperator] = useState('contém');
  const [filterValue, setFilterValue] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem(`favorites-${entityType}`);
    return saved ? JSON.parse(saved) : [];
  });

  const filterableColumns = displayColumns.filter(
    (col) =>
      typeof col.key === 'string' ||
      typeof col.key === 'number' ||
      typeof col.key === 'symbol',
  );

  useEffect(() => {
    localStorage.setItem(`favorites-${entityType}`, JSON.stringify(favorites));
  }, [favorites, entityType]);

  useEffect(() => {
    if (!open) {
      setFilterField('');
      setFilterOperator('contém');
      setFilterValue('');
    } else {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  }, [open]);
  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      if (prev.includes(id)) {
        return prev.filter((favId) => favId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const isFavorite = (id: number) => favorites.includes(id);

  const addFilter = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (filterField && filterValue) {
      setFilters([
        ...filters,
        {
          field: filterField as keyof T,
          operator: filterOperator,
          value: filterValue,
        },
      ]);
      setFilterField('');
      setFilterValue('');
    }
  };

  const removeFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filterField && filterValue) {
      addFilter();
    }
  };

  const exportToCSV = () => {
    const filteredEntities = filterEntities(entities);

    const headers = displayColumns
      .filter((col) => typeof col.key === 'string')
      .map((col) => col.header);

    const rows = filteredEntities.map((entity) =>
      displayColumns
        .filter((col) => typeof col.key === 'string')
        .map((col) => {
          const key = col.key as keyof T;
          return typeof entity[key] === 'object'
            ? JSON.stringify(entity[key])
            : String(entity[key] || '');
        }),
    );

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${entityType || 'data'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterEntities = useCallback(
    (items: T[]) => {
      let filtered = [...items];

      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        filtered = filtered.filter((item) =>
          searchKeys.some((key) => {
            const value = item[key];
            return (
              value && String(value).toLowerCase().includes(searchTermLower)
            );
          }),
        );
      }

      if (filters.length > 0) {
        filtered = filtered.filter((item) =>
          filters.every((filter) => {
            const itemValue = String(item[filter.field] || '').toLowerCase();
            const filterValueLower = filter.value.toLowerCase();

            switch (filter.operator) {
              case 'contém':
                return itemValue.includes(filterValueLower);
              case 'igual a':
                return itemValue === filterValueLower;
              case 'começa com':
                return itemValue.startsWith(filterValueLower);
              case 'termina com':
                return itemValue.endsWith(filterValueLower);
              case 'não contém':
                return !itemValue.includes(filterValueLower);
              default:
                return true;
            }
          }),
        );
      }

      return filtered;
    },
    [searchTerm, filters, searchKeys],
  );

  const debouncedSetSearchTerm = useMemo(
    () => debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    [],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchTerm(e.target.value);
  };

  const filteredEntities = filterEntities(entities);

  const renderCellValue = (entity: T, column: DisplayColumn<T>) => {
    if (typeof column.key === 'function') {
      return column.key(entity);
    }

    const value = entity[column.key as keyof T];
    if (value === undefined || value === null) return '-';
    return String(value);
  };

  const sortedEntities = [...filteredEntities].sort((a, b) => {
    const aFav = isFavorite(a.id) ? 0 : 1;
    const bFav = isFavorite(b.id) ? 0 : 1;
    return aFav - bFav;
  });

  const renderViewToggle = () => (
    <div className="flex">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('table')}
              className="rounded-r-none"
            >
              <Table className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Visualização de tabela</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('card')}
              className="rounded-l-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Visualização de cards</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[95vw] xl:max-w-[95vw] 2xl:max-w-[95vw] w-[98vw] h-[95vh] max-h-[95vh] p-6 overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-base">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Barra de pesquisa e botões */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center justify-between">
            <div className="relative flex-1 w-full sm:w-auto min-w-[280px]">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Pesquisar..."
                className="pl-10 py-6 text-lg"
                defaultValue={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
              {renderViewToggle()}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() =>
                        setShowAdvancedFilters(!showAdvancedFilters)
                      }
                      className="h-10"
                    >
                      <Filter className="h-5 w-5 mr-2" /> Filtros
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Filtros avançados</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={exportToCSV}
                      className="h-10"
                    >
                      <Download className="h-5 w-5 mr-2" /> Exportar
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Exportar CSV</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {extraActions}

              {!hideNewButton && onCreateNew && (
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onCreateNew();
                  }} 
                  size="lg" 
                  className="h-10"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Novo
                </Button>
              )}
            </div>
          </div>

          {showAdvancedFilters && (
            <div className="space-y-3 border rounded-md p-4">
              <div className="text-base font-medium">Filtros Avançados</div>

              {filters.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {filters.map((filter, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1 text-sm py-2 px-3"
                    >
                      <span>{String(filter.field)}</span>
                      <span>{filter.operator}</span>
                      <span>"{filter.value}"</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-1 p-0"
                        onClick={() => removeFilter(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Select
                  value={filterField as string}
                  onValueChange={(value) => setFilterField(value as keyof T)}
                >
                  <SelectTrigger className="w-full sm:w-[220px] h-10">
                    <SelectValue placeholder="Selecione o campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterableColumns.map((column, index) => (
                      <SelectItem key={index} value={String(column.key)}>
                        {column.header}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filterOperator}
                  onValueChange={setFilterOperator}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-10">
                    <SelectValue placeholder="Operador" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contém">Contém</SelectItem>
                    <SelectItem value="igual a">Igual a</SelectItem>
                    <SelectItem value="começa com">Começa com</SelectItem>
                    <SelectItem value="termina com">Termina com</SelectItem>
                    <SelectItem value="não contém">Não contém</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  placeholder="Valor"
                  onKeyDown={handleKeyDown}
                  className="flex-1 min-w-[200px] h-10"
                />

                <Button
                  onClick={addFilter}
                  disabled={!filterField || !filterValue}
                  type="button"
                  size="lg"
                  className="h-10"
                >
                  Adicionar filtro
                </Button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {viewMode === 'table' && (
              <div className="rounded-md border overflow-hidden h-full">
                <div className="overflow-x-auto h-full">
                  <table className="w-full table-fixed">
                    <thead className="bg-muted sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                          Fav
                        </th>
                        {displayColumns.map((column, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                          >
                            {column.header}
                          </th>
                        ))}
                        {onEdit && (
                          <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                            Ações
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td
                            colSpan={displayColumns.length + 1}
                            className="text-center p-6 text-base"
                          >
                            Carregando...
                          </td>
                        </tr>
                      ) : sortedEntities.length === 0 ? (
                        <tr>
                          <td
                            colSpan={displayColumns.length + 1}
                            className="text-center p-6 text-base"
                          >
                            Nenhum resultado encontrado.
                          </td>
                        </tr>
                      ) : (
                        sortedEntities.map((entity) => (
                          <tr
                            key={entity.id}
                            className="cursor-pointer hover:bg-muted/50 border-t"
                            onClick={() => onSelect(entity)}
                          >
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(entity.id);
                                }}
                              >
                                <Star
                                  className={`h-5 w-5 ${
                                    isFavorite(entity.id)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              </Button>
                            </td>
                            {displayColumns.map((column, colIndex) => (
                              <td
                                key={colIndex}
                                className="px-4 py-3 text-base"
                              >
                                {renderCellValue(entity, column)}
                              </td>
                            ))}
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEdit?.(entity);
                                }}
                              >
                                <Edit className="h-5 w-5 text-muted-foreground" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewMode === 'card' && (
              <div className="h-full overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {isLoading ? (
                    <div className="col-span-full text-center p-6 text-base">
                      Carregando...
                    </div>
                  ) : sortedEntities.length === 0 ? (
                    <div className="col-span-full text-center p-6 text-base">
                      Nenhum resultado encontrado.
                    </div>
                  ) : (
                    sortedEntities.map((entity) => {
                      const mainColumns = displayColumns.slice(0, 3);
                      const mainColumn = mainColumns[0];
                      const secondaryColumns = mainColumns.slice(1);

                      return (
                        <Card
                          key={entity.id}
                          className={`cursor-pointer hover:shadow-md transition-all ${
                            isFavorite(entity.id) ? 'border-yellow-200' : ''
                          }`}
                          onClick={() => onSelect(entity)}
                        >
                          <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                            <div>
                              <CardTitle className="text-lg">
                                {renderCellValue(entity, mainColumn)}
                              </CardTitle>
                              {secondaryColumns.map((col, idx) => (
                                <CardDescription key={idx} className="text-sm">
                                  {col.header}: {renderCellValue(entity, col)}
                                </CardDescription>
                              ))}
                            </div>
                            <div className="flex">
                              {onEdit && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 -mt-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(entity);
                                  }}
                                >
                                  <Edit className="h-5 w-5 text-muted-foreground" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 -mt-1 -mr-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(entity.id);
                                }}
                              >
                                <Star
                                  className={`h-5 w-5 ${
                                    isFavorite(entity.id)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            {/* Mostrar até 2 campos adicionais */}
                            <div className="text-base">
                              {displayColumns.slice(3, 5).map((col, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between mt-1"
                                >
                                  <span className="text-muted-foreground">
                                    {col.header}:
                                  </span>
                                  <span>{renderCellValue(entity, col)}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between pt-4 mt-4 border-t">
          <div className="text-base text-muted-foreground">
            {filteredEntities.length} {entityType} encontrados
          </div>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="lg"
            className="h-11 px-6 text-base"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
