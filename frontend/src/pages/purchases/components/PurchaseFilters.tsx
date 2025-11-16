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

export interface PurchaseFilterOptions {
  searchTerm: string;
  status: string;
  fornecedorId: string;
  dataEmissaoInicio: Date | undefined;
  dataEmissaoFim: Date | undefined;
  dataChegadaInicio: Date | undefined;
  dataChegadaFim: Date | undefined;
  modelo: string;
  serie: string;
  valorMinimo: string;
  valorMaximo: string;
}

interface PurchaseFiltersProps {
  filters: PurchaseFilterOptions;
  onFiltersChange: (filters: PurchaseFilterOptions) => void;
  onClearFilters: () => void;
}

export const PurchaseFilters: React.FC<PurchaseFiltersProps> = ({
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

  const handleFilterChange = (key: keyof PurchaseFilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = () => {
    return (
      filters.status !== 'TODOS' ||
      (filters.fornecedorId !== '' && filters.fornecedorId !== '0') ||
      filters.dataEmissaoInicio !== undefined ||
      filters.dataEmissaoFim !== undefined ||
      filters.dataChegadaInicio !== undefined ||
      filters.dataChegadaFim !== undefined ||
      filters.modelo !== '' ||
      filters.serie !== '' ||
      filters.valorMinimo !== '' ||
      filters.valorMaximo !== ''
    );
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'TODOS') count++;
    if (filters.fornecedorId !== '' && filters.fornecedorId !== '0') count++;
    if (filters.dataEmissaoInicio || filters.dataEmissaoFim) count++;
    if (filters.dataChegadaInicio || filters.dataChegadaFim) count++;
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
            placeholder="Buscar por número, fornecedor, funcionário..."
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
              // zIndex: 9999
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
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="APROVADO">Aprovado</SelectItem>
                      <SelectItem value="ENVIADO">Enviado</SelectItem>
                      <SelectItem value="RECEBIDO">Recebido</SelectItem>
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

                {/* Data Chegada Início */}
                <div className="space-y-2">
                  <Label>Data Chegada (De)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filters.dataChegadaInicio && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dataChegadaInicio ? (
                          format(filters.dataChegadaInicio, 'PPP', { locale: ptBR })
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
                        selected={filters.dataChegadaInicio}
                        onSelect={(date) => handleFilterChange('dataChegadaInicio', date)}
                        locale={ptBR}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Data Chegada Fim */}
                <div className="space-y-2">
                  <Label>Data Chegada (Até)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !filters.dataChegadaFim && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dataChegadaFim ? (
                          format(filters.dataChegadaFim, 'PPP', { locale: ptBR })
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
                        selected={filters.dataChegadaFim}
                        onSelect={(date) => handleFilterChange('dataChegadaFim', date)}
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
          {(filters.dataChegadaInicio || filters.dataChegadaFim) && (
            <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium">
              Chegada: {filters.dataChegadaInicio && format(filters.dataChegadaInicio, 'dd/MM/yy')} - {filters.dataChegadaFim && format(filters.dataChegadaFim, 'dd/MM/yy')}
              <button
                onClick={() => {
                  handleFilterChange('dataChegadaInicio', undefined);
                  handleFilterChange('dataChegadaFim', undefined);
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
