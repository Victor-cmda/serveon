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

export interface AccountsReceivableFilterOptions {
  searchTerm: string;
  status: string;
  clienteId: string;
  tipoDocumento: string;
  dataEmissaoInicio: Date | undefined;
  dataEmissaoFim: Date | undefined;
  dataVencimentoInicio: Date | undefined;
  dataVencimentoFim: Date | undefined;
  dataRecebimentoInicio: Date | undefined;
  dataRecebimentoFim: Date | undefined;
  valorMinimo: string;
  valorMaximo: string;
  apenasVencidas: boolean;
}

interface AccountsReceivableFiltersProps {
  filters: AccountsReceivableFilterOptions;
  onFiltersChange: (filters: AccountsReceivableFilterOptions) => void;
  onClearFilters: () => void;
}

export const AccountsReceivableFilters: React.FC<AccountsReceivableFiltersProps> = ({
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

  const handleFilterChange = (key: keyof AccountsReceivableFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.status !== 'TODOS' ||
      (filters.clienteId !== '' && filters.clienteId !== '0') ||
      filters.tipoDocumento !== 'TODOS' ||
      filters.dataEmissaoInicio !== undefined ||
      filters.dataEmissaoFim !== undefined ||
      filters.dataVencimentoInicio !== undefined ||
      filters.dataVencimentoFim !== undefined ||
      filters.dataRecebimentoInicio !== undefined ||
      filters.dataRecebimentoFim !== undefined ||
      filters.valorMinimo !== '' ||
      filters.valorMaximo !== '' ||
      filters.apenasVencidas
    );
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'TODOS') count++;
    if (filters.clienteId !== '' && filters.clienteId !== '0') count++;
    if (filters.tipoDocumento !== 'TODOS') count++;
    if (filters.dataEmissaoInicio || filters.dataEmissaoFim) count++;
    if (filters.dataVencimentoInicio || filters.dataVencimentoFim) count++;
    if (filters.dataRecebimentoInicio || filters.dataRecebimentoFim) count++;
    if (filters.valorMinimo !== '' || filters.valorMaximo !== '') count++;
    if (filters.apenasVencidas) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Barra de Busca Principal */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, cliente, documento..."
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
          <PopoverContent 
            className="w-[600px] border-0 shadow-2xl rounded-2xl overflow-hidden" 
            align="end"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
              opacity: 1,
            }}
          >
            <div className="space-y-4 p-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold tracking-tight">Filtros Avançados</h3>
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
                      <SelectItem value="ABERTO">Aberto</SelectItem>
                      <SelectItem value="RECEBIDO">Recebido</SelectItem>
                      <SelectItem value="VENCIDO">Vencido</SelectItem>
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

                {/* Tipo de Documento */}
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select
                    value={filters.tipoDocumento}
                    onValueChange={(value) => handleFilterChange('tipoDocumento', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODOS">Todos</SelectItem>
                      <SelectItem value="FATURA">Fatura</SelectItem>
                      <SelectItem value="DUPLICATA">Duplicata</SelectItem>
                      <SelectItem value="BOLETO">Boleto</SelectItem>
                      <SelectItem value="NOTA_FISCAL">Nota Fiscal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Apenas Vencidas */}
                <div className="space-y-2">
                  <Label>Filtro Rápido</Label>
                  <Select
                    value={filters.apenasVencidas ? 'vencidas' : 'todas'}
                    onValueChange={(value) => handleFilterChange('apenasVencidas', value === 'vencidas')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as contas</SelectItem>
                      <SelectItem value="vencidas">Apenas vencidas</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <PopoverContent 
                      className="w-auto p-0 border-0 shadow-2xl rounded-2xl overflow-hidden" 
                      align="start"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                      }}
                    >
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
                    <PopoverContent 
                      className="w-auto p-0 border-0 shadow-2xl rounded-2xl overflow-hidden" 
                      align="start"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                      }}
                    >
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

                {/* Data Vencimento Início */}
                <div className="space-y-2">
                  <Label>Data Vencimento (De)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filters.dataVencimentoInicio && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dataVencimentoInicio ? (
                          format(filters.dataVencimentoInicio, 'PPP', { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-auto p-0 border-0 shadow-2xl rounded-2xl overflow-hidden" 
                      align="start"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                      }}
                    >
                      <Calendar
                        mode="single"
                        selected={filters.dataVencimentoInicio}
                        onSelect={(date) => handleFilterChange('dataVencimentoInicio', date)}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Data Vencimento Fim */}
                <div className="space-y-2">
                  <Label>Data Vencimento (Até)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filters.dataVencimentoFim && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dataVencimentoFim ? (
                          format(filters.dataVencimentoFim, 'PPP', { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-auto p-0 border-0 shadow-2xl rounded-2xl overflow-hidden" 
                      align="start"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                      }}
                    >
                      <Calendar
                        mode="single"
                        selected={filters.dataVencimentoFim}
                        onSelect={(date) => handleFilterChange('dataVencimentoFim', date)}
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

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200/50">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-6 border-gray-300 hover:bg-gray-100 transition-all duration-200"
                >
                  Fechar
                </Button>
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 transition-all duration-200"
                >
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
            <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 text-xs font-medium">
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
            <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 text-xs font-medium">
              Cliente: {customers.find(c => c.id.toString() === filters.clienteId)?.nomeFantasia || customers.find(c => c.id.toString() === filters.clienteId)?.razaoSocial || 'ID ' + filters.clienteId}
              <button
                onClick={() => handleFilterChange('clienteId', '0')}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.tipoDocumento !== 'TODOS' && (
            <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 text-xs font-medium">
              Tipo: {filters.tipoDocumento}
              <button
                onClick={() => handleFilterChange('tipoDocumento', 'TODOS')}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.apenasVencidas && (
            <div className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 text-xs font-medium">
              Apenas Vencidas
              <button
                onClick={() => handleFilterChange('apenasVencidas', false)}
                className="ml-1 hover:text-red-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {(filters.dataVencimentoInicio || filters.dataVencimentoFim) && (
            <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 text-xs font-medium">
              Vencimento: {filters.dataVencimentoInicio && format(filters.dataVencimentoInicio, 'dd/MM/yy')} - {filters.dataVencimentoFim && format(filters.dataVencimentoFim, 'dd/MM/yy')}
              <button
                onClick={() => {
                  handleFilterChange('dataVencimentoInicio', undefined);
                  handleFilterChange('dataVencimentoFim', undefined);
                }}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {(filters.valorMinimo !== '' || filters.valorMaximo !== '') && (
            <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 text-xs font-medium">
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
