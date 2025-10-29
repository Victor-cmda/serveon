import React, { useState, useEffect } from 'react';
import { Filter, X, CalendarIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { customerApi } from '@/services/api';
import { Customer } from '@/types/customer';

export interface SaleFilterOptions {
  searchTerm: string;
  status: string;
  clienteId: string;
  dataEmissaoInicio: Date | undefined;
  dataEmissaoFim: Date | undefined;
  dataEntregaInicio: Date | undefined;
  dataEntregaFim: Date | undefined;
  modelo: string;
  serie: string;
  valorMinimo: string;
  valorMaximo: string;
}

interface SaleFiltersProps {
  filters: SaleFilterOptions;
  onFiltersChange: (filters: SaleFilterOptions) => void;
  onClearFilters: () => void;
}

export const SaleFilters: React.FC<SaleFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleFilterChange = (key: keyof SaleFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.status !== 'TODOS' ||
      (filters.clienteId !== '' && filters.clienteId !== '0') ||
      filters.dataEmissaoInicio !== undefined ||
      filters.dataEmissaoFim !== undefined ||
      filters.dataEntregaInicio !== undefined ||
      filters.dataEntregaFim !== undefined ||
      filters.modelo !== '' ||
      filters.serie !== '' ||
      filters.valorMinimo !== '' ||
      filters.valorMaximo !== ''
    );
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'TODOS') count++;
    if (filters.clienteId !== '' && filters.clienteId !== '0') count++;
    if (filters.dataEmissaoInicio || filters.dataEmissaoFim) count++;
    if (filters.dataEntregaInicio || filters.dataEntregaFim) count++;
    if (filters.modelo !== '') count++;
    if (filters.serie !== '') count++;
    if (filters.valorMinimo !== '' || filters.valorMaximo !== '') count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Barra de Busca Principal */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, cliente, funcionário..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-8"
          />
        </div>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros Avançados
              {activeFiltersCount() > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {activeFiltersCount()}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[600px]" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filtros Avançados</h3>
                {hasActiveFilters() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClearFilters();
                      setIsOpen(false);
                    }}
                    className="gap-1"
                  >
                    <X className="h-3 w-3" />
                    Limpar Filtros
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="APROVADO">Aprovado</SelectItem>
                      <SelectItem value="ENVIADO">Enviado</SelectItem>
                      <SelectItem value="ENTREGUE">Entregue</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cliente */}
                <div className="space-y-2">
                  <Label>Cliente</Label>
                  <Select
                    value={filters.clienteId}
                    onValueChange={(value) => handleFilterChange('clienteId', value)}
                    disabled={loadingCustomers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Todos</SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.nomeFantasia || customer.razaoSocial}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Modelo */}
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input
                    placeholder="Ex: 55"
                    value={filters.modelo}
                    onChange={(e) => handleFilterChange('modelo', e.target.value)}
                  />
                </div>

                {/* Série */}
                <div className="space-y-2">
                  <Label>Série</Label>
                  <Input
                    placeholder="Ex: 1"
                    value={filters.serie}
                    onChange={(e) => handleFilterChange('serie', e.target.value)}
                  />
                </div>

                {/* Data Emissão Início */}
                <div className="space-y-2">
                  <Label>Data Emissão (De)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filters.dataEmissaoInicio && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dataEmissaoInicio ? (
                          format(filters.dataEmissaoInicio, 'PPP', { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dataEmissaoInicio}
                        onSelect={(date) => handleFilterChange('dataEmissaoInicio', date)}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Data Emissão Fim */}
                <div className="space-y-2">
                  <Label>Data Emissão (Até)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filters.dataEmissaoFim && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dataEmissaoFim ? (
                          format(filters.dataEmissaoFim, 'PPP', { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dataEmissaoFim}
                        onSelect={(date) => handleFilterChange('dataEmissaoFim', date)}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Data Entrega Início */}
                <div className="space-y-2">
                  <Label>Data Entrega (De)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filters.dataEntregaInicio && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dataEntregaInicio ? (
                          format(filters.dataEntregaInicio, 'PPP', { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dataEntregaInicio}
                        onSelect={(date) => handleFilterChange('dataEntregaInicio', date)}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Data Entrega Fim */}
                <div className="space-y-2">
                  <Label>Data Entrega (Até)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filters.dataEntregaFim && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dataEntregaFim ? (
                          format(filters.dataEntregaFim, 'PPP', { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dataEntregaFim}
                        onSelect={(date) => handleFilterChange('dataEntregaFim', date)}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Valor Mínimo */}
                <div className="space-y-2">
                  <Label>Valor Mínimo (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={filters.valorMinimo}
                    onChange={(e) => handleFilterChange('valorMinimo', e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>

                {/* Valor Máximo */}
                <div className="space-y-2">
                  <Label>Valor Máximo (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={filters.valorMaximo}
                    onChange={(e) => handleFilterChange('valorMaximo', e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={() => setIsOpen(false)}>
                  Aplicar Filtros
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearFilters}
            title="Limpar todos os filtros"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Chips de Filtros Ativos */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          {filters.status !== 'TODOS' && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange('status', 'TODOS')}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.clienteId !== '' && filters.clienteId !== '0' && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
              Cliente: {customers.find(c => c.id.toString() === filters.clienteId)?.nomeFantasia || customers.find(c => c.id.toString() === filters.clienteId)?.razaoSocial || 'ID ' + filters.clienteId}
              <button
                onClick={() => handleFilterChange('clienteId', '0')}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.modelo !== '' && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
              Modelo: {filters.modelo}
              <button
                onClick={() => handleFilterChange('modelo', '')}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.serie !== '' && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
              Série: {filters.serie}
              <button
                onClick={() => handleFilterChange('serie', '')}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {(filters.dataEmissaoInicio || filters.dataEmissaoFim) && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
              Emissão: {filters.dataEmissaoInicio && format(filters.dataEmissaoInicio, 'dd/MM/yy')} - {filters.dataEmissaoFim && format(filters.dataEmissaoFim, 'dd/MM/yy')}
              <button
                onClick={() => {
                  handleFilterChange('dataEmissaoInicio', undefined);
                  handleFilterChange('dataEmissaoFim', undefined);
                }}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {(filters.dataEntregaInicio || filters.dataEntregaFim) && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
              Entrega: {filters.dataEntregaInicio && format(filters.dataEntregaInicio, 'dd/MM/yy')} - {filters.dataEntregaFim && format(filters.dataEntregaFim, 'dd/MM/yy')}
              <button
                onClick={() => {
                  handleFilterChange('dataEntregaInicio', undefined);
                  handleFilterChange('dataEntregaFim', undefined);
                }}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {(filters.valorMinimo !== '' || filters.valorMaximo !== '') && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
              Valor: R$ {filters.valorMinimo || '0'} - R$ {filters.valorMaximo || '∞'}
              <button
                onClick={() => {
                  handleFilterChange('valorMinimo', '');
                  handleFilterChange('valorMaximo', '');
                }}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
