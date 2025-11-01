import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Eye, ShoppingBag, MoreVertical, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { salesApi } from '../../services/api';
import { Sale } from '../../types/sale';
import { toast } from '../../lib/toast';
import SaleViewDialog from './components/SaleViewDialog';
import { SaleFilters, SaleFilterOptions } from './components/SaleFilters';
import { isAfter, isBefore, isEqual, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const SalesList: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  
  const [filters, setFilters] = useState<SaleFilterOptions>({
    searchTerm: '',
    status: 'TODOS',
    clienteId: '0',
    dataEmissaoInicio: undefined,
    dataEmissaoFim: undefined,
    dataEntregaInicio: undefined,
    dataEntregaFim: undefined,
    modelo: '',
    serie: '',
    valorMinimo: '',
    valorMaximo: '',
  });

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await salesApi.getAll();
      setSales(data);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar as vendas',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'TODOS',
      clienteId: '0',
      dataEmissaoInicio: undefined,
      dataEmissaoFim: undefined,
      dataEntregaInicio: undefined,
      dataEntregaFim: undefined,
      modelo: '',
      serie: '',
      valorMinimo: '',
      valorMaximo: '',
    });
  };

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      // Filtro de busca por texto
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        !filters.searchTerm ||
        (sale.numeroPedido?.toString() || '').includes(filters.searchTerm) ||
        sale.id.toString().includes(filters.searchTerm) ||
        (sale.clienteNome && sale.clienteNome.toLowerCase().includes(searchLower)) ||
        (sale.funcionarioNome && sale.funcionarioNome.toLowerCase().includes(searchLower)) ||
        sale.status.toLowerCase().includes(searchLower) ||
        (sale.modelo && sale.modelo.toLowerCase().includes(searchLower)) ||
        (sale.serie && sale.serie.toLowerCase().includes(searchLower));

      // Filtro de status
      const matchesStatus = filters.status === 'TODOS' || sale.status === filters.status;

      // Filtro de cliente
      const matchesCliente =
        !filters.clienteId || 
        filters.clienteId === '0' || 
        sale.clienteId?.toString() === filters.clienteId;

      // Filtro de modelo
      const matchesModelo =
        !filters.modelo ||
        (sale.modelo && sale.modelo.toLowerCase().includes(filters.modelo.toLowerCase()));

      // Filtro de série
      const matchesSerie =
        !filters.serie ||
        (sale.serie && sale.serie.toLowerCase().includes(filters.serie.toLowerCase()));

      // Filtro de data de emissão
      const dataEmissao = parseISO(sale.dataEmissao);
      const matchesDataEmissaoInicio =
        !filters.dataEmissaoInicio ||
        isEqual(dataEmissao, filters.dataEmissaoInicio) ||
        isAfter(dataEmissao, filters.dataEmissaoInicio);
      const matchesDataEmissaoFim =
        !filters.dataEmissaoFim ||
        isEqual(dataEmissao, filters.dataEmissaoFim) ||
        isBefore(dataEmissao, filters.dataEmissaoFim);

      // Filtro de data de entrega
      let matchesDataEntregaInicio = true;
      let matchesDataEntregaFim = true;
      if (sale.dataEntrega) {
        const dataEntrega = parseISO(sale.dataEntrega);
        matchesDataEntregaInicio =
          !filters.dataEntregaInicio ||
          isEqual(dataEntrega, filters.dataEntregaInicio) ||
          isAfter(dataEntrega, filters.dataEntregaInicio);
        matchesDataEntregaFim =
          !filters.dataEntregaFim ||
          isEqual(dataEntrega, filters.dataEntregaFim) ||
          isBefore(dataEntrega, filters.dataEntregaFim);
      } else if (filters.dataEntregaInicio || filters.dataEntregaFim) {
        // Se tem filtro de data de entrega mas a venda não tem data de entrega, não exibe
        matchesDataEntregaInicio = false;
        matchesDataEntregaFim = false;
      }

      // Filtro de valor
      const valor = sale.totalAPagar || 0;
      const matchesValorMinimo = !filters.valorMinimo || valor >= parseFloat(filters.valorMinimo);
      const matchesValorMaximo = !filters.valorMaximo || valor <= parseFloat(filters.valorMaximo);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCliente &&
        matchesModelo &&
        matchesSerie &&
        matchesDataEmissaoInicio &&
        matchesDataEmissaoFim &&
        matchesDataEntregaInicio &&
        matchesDataEntregaFim &&
        matchesValorMinimo &&
        matchesValorMaximo
      );
    });
  }, [sales, filters]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'APROVADO':
        return 'bg-green-100 text-green-800';
      case 'ENVIADO':
        return 'bg-blue-100 text-blue-800';
      case 'ENTREGUE':
        return 'bg-green-100 text-green-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleApprove = async (saleId: number) => {
    try {
      await salesApi.approve(saleId);
      toast.success('Venda aprovada com sucesso!');
      loadSales();
    } catch (error) {
      console.error('Erro ao aprovar venda:', error);
      toast.error('Erro ao aprovar venda');
    }
  };

  const handleDeny = async (saleId: number) => {
    try {
      await salesApi.deny(saleId);
      toast.success('Venda negada com sucesso!');
      loadSales();
    } catch (error) {
      console.error('Erro ao negar venda:', error);
      toast.error('Erro ao negar venda');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-8 w-8" />
            Vendas
          </h1>
          <p className="text-muted-foreground">
            Gerencie as vendas da empresa
          </p>
        </div>
        <Link
          to="/sales/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nova Venda
        </Link>
      </div>

      <SaleFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Número
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Data Emissão
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Data Entrega
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Total a Pagar
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {filters.searchTerm || filters.status !== 'TODOS' ? 'Nenhuma venda encontrada com os filtros aplicados.' : 'Nenhuma venda cadastrada.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b">
                    <td className="p-4">
                      <div className="font-medium">{sale.numeroPedido || '-'}</div>
                      {sale.modelo && sale.serie && (
                        <div className="text-sm text-muted-foreground">
                          Mod: {sale.modelo} / Série: {sale.serie}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{sale.clienteNome || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{formatDate(sale.dataEmissao)}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{sale.dataEntrega ? formatDate(sale.dataEntrega) : '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{sale.totalAPagar ? formatCurrency(sale.totalAPagar) : '-'}</div>
                      <div className="text-sm text-muted-foreground">
                        Produtos: {sale.totalProdutos ? formatCurrency(sale.totalProdutos) : '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(sale.status)}`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                          title="Visualizar venda"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                              title="Mais opções"
                            >
                              <MoreVertical className="h-3 w-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleApprove(sale.id)}
                              disabled={sale.status === 'APROVADO' || sale.status === 'CANCELADO'}
                              className="cursor-pointer"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              <span>Aprovar Venda</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeny(sale.id)}
                              disabled={sale.status === 'APROVADO' || sale.status === 'CANCELADO'}
                              className="cursor-pointer text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              <span>Negar Venda</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredSales.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredSales.length} de {sales.length} venda(s)
          </div>
        </div>
      )}

      {selectedSale && (
        <SaleViewDialog
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
};

export default SalesList;
