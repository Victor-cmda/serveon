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
import { supplierApi } from '@/services/api';
import { Supplier } from '@/types/supplier';

export interface AccountsPayableFilterOptions {
  searchTerm: string;
  status: string;
  fornecedorId: string;
  tipoDocumento: string;
  dataEmissaoInicio: Date | undefined;
  dataEmissaoFim: Date | undefined;
  dataVencimentoInicio: Date | undefined;
  dataVencimentoFim: Date | undefined;
  dataPagamentoInicio: Date | undefined;
  dataPagamentoFim: Date | undefined;
  valorMinimo: string;
  valorMaximo: string;
  apenaasVencidas: boolean;
}

interface AccountsPayableFiltersProps {
  filters: AccountsPayableFilterOptions;
  onFiltersChange: (filters: AccountsPayableFilterOptions) => void;
  onClearFilters: () => void;
}

export const AccountsPayableFilters: React.FC<AccountsPayableFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const data = await supplierApi.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const handleFilterChange = (key: keyof AccountsPayableFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.status !== 'TODOS' ||
      (filters.fornecedorId !== '' && filters.fornecedorId !== '0') ||
      filters.tipoDocumento !== 'TODOS' ||
      filters.dataEmissaoInicio !== undefined ||
      filters.dataEmissaoFim !== undefined ||
      filters.dataVencimentoInicio !== undefined ||
      filters.dataVencimentoFim !== undefined ||
      filters.dataPagamentoInicio !== undefined ||
      filters.dataPagamentoFim !== undefined ||
      filters.valorMinimo !== '' ||
      filters.valorMaximo !== '' ||
      filters.apenaasVencidas
    );
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'TODOS') count++;
    if (filters.fornecedorId !== '' && filters.fornecedorId !== '0') count++;
    if (filters.tipoDocumento !== 'TODOS') count++;
    if (filters.dataEmissaoInicio || filters.dataEmissaoFim) count++;
    if (filters.dataVencimentoInicio || filters.dataVencimentoFim) count++;
    if (filters.dataPagamentoInicio || filters.dataPagamentoFim) count++;
    if (filters.valorMinimo !== '' || filters.valorMaximo !== '') count++;
    if (filters.apenaasVencidas) count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Barra de Busca Principal */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, fornecedor, documento..."
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
                      <SelectItem value="ABERTO">Aberto</SelectItem>
                      <SelectItem value="PAGO">Pago</SelectItem>
                      <SelectItem value="PARCIAL">Parcial</SelectItem>
                      <SelectItem value="VENCIDO">Vencido</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fornecedor */}
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Select
                    value={filters.fornecedorId}
                    onValueChange={(value) => handleFilterChange('fornecedorId', value)}
                    disabled={loadingSuppliers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os fornecedores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Todos</SelectItem>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.nomeFantasia || supplier.razaoSocial}
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
                    value={filters.apenaasVencidas ? 'vencidas' : 'todas'}
                    onValueChange={(value) => handleFilterChange('apenaasVencidas', value === 'vencidas')}
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
                    <PopoverContent className="w-auto p-0" align="start">
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
                    <PopoverContent className="w-auto p-0" align="start">
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
          {filters.fornecedorId !== '' && filters.fornecedorId !== '0' && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
              Fornecedor: {suppliers.find(s => s.id.toString() === filters.fornecedorId)?.nomeFantasia || suppliers.find(s => s.id.toString() === filters.fornecedorId)?.razaoSocial || 'ID ' + filters.fornecedorId}
              <button
                onClick={() => handleFilterChange('fornecedorId', '0')}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.tipoDocumento !== 'TODOS' && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
              Tipo: {filters.tipoDocumento}
              <button
                onClick={() => handleFilterChange('tipoDocumento', 'TODOS')}
                className="ml-1 hover:text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.apenaasVencidas && (
            <div className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-700">
              Apenas Vencidas
              <button
                onClick={() => handleFilterChange('apenaasVencidas', false)}
                className="ml-1 hover:text-red-900"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {(filters.dataVencimentoInicio || filters.dataVencimentoFim) && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
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
