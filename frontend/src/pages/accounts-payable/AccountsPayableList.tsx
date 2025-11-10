import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Eye, Receipt, MoreVertical, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { accountsPayableApi } from '@/services/api';
import { AccountPayable } from '@/types/account-payable';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AccountsPayableFilters, AccountsPayableFilterOptions } from './components/AccountsPayableFilters';
import { AccountsPayableDetailDialog } from './components/AccountsPayableDetailDialog';
import { isAfter, isBefore, parseISO, isSameDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AccountsPayableList: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const [filters, setFilters] = useState<AccountsPayableFilterOptions>({
    searchTerm: '',
    status: 'TODOS',
    fornecedorId: '0',
    tipoDocumento: 'TODOS',
    dataEmissaoInicio: undefined,
    dataEmissaoFim: undefined,
    dataVencimentoInicio: undefined,
    dataVencimentoFim: undefined,
    dataPagamentoInicio: undefined,
    dataPagamentoFim: undefined,
    valorMinimo: '',
    valorMaximo: '',
    apenaasVencidas: false,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountsPayableApi.getAll();
      setAccounts(data);
    } catch (error) {
      console.error('Erro ao carregar contas a pagar:', error);
      toast.error('Erro ao carregar contas a pagar');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'TODOS',
      fornecedorId: '0',
      tipoDocumento: 'TODOS',
      dataEmissaoInicio: undefined,
      dataEmissaoFim: undefined,
      dataVencimentoInicio: undefined,
      dataVencimentoFim: undefined,
      dataPagamentoInicio: undefined,
      dataPagamentoFim: undefined,
      valorMinimo: '',
      valorMaximo: '',
      apenaasVencidas: false,
    });
  };

  const handleCancel = async (id: number) => {
    try {
      await accountsPayableApi.cancel(id);
      toast.success('Conta cancelada com sucesso!');
      loadAccounts();
    } catch (error) {
      toast.error('Erro ao cancelar conta');
      console.error(error);
    }
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      // Filtro de busca por texto
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        !filters.searchTerm ||
        account.numeroDocumento.toLowerCase().includes(searchLower) ||
        account.id.toString().includes(filters.searchTerm) ||
        (account.fornecedorNome && account.fornecedorNome.toLowerCase().includes(searchLower)) ||
        (account.fornecedorCnpjCpf && account.fornecedorCnpjCpf.toLowerCase().includes(searchLower)) ||
        account.tipoDocumento.toLowerCase().includes(searchLower);

      // Filtro de status
      const matchesStatus = filters.status === 'TODOS' || account.status === filters.status;

      // Filtro de fornecedor
      const matchesFornecedor =
        !filters.fornecedorId ||
        filters.fornecedorId === '0' ||
        account.fornecedorId?.toString() === filters.fornecedorId;

      // Filtro de tipo de documento
      const matchesTipoDocumento =
        filters.tipoDocumento === 'TODOS' ||
        account.tipoDocumento === filters.tipoDocumento;

      // Filtro de data de emissão
      let matchesDataEmissao = true;
      if (filters.dataEmissaoInicio || filters.dataEmissaoFim) {
        const dataEmissao = parseISO(account.dataEmissao);
        if (filters.dataEmissaoInicio && filters.dataEmissaoFim) {
          matchesDataEmissao =
            (isAfter(dataEmissao, filters.dataEmissaoInicio) || isSameDay(dataEmissao, filters.dataEmissaoInicio)) &&
            (isBefore(dataEmissao, filters.dataEmissaoFim) || isSameDay(dataEmissao, filters.dataEmissaoFim));
        } else if (filters.dataEmissaoInicio) {
          matchesDataEmissao = isAfter(dataEmissao, filters.dataEmissaoInicio) || isSameDay(dataEmissao, filters.dataEmissaoInicio);
        } else if (filters.dataEmissaoFim) {
          matchesDataEmissao = isBefore(dataEmissao, filters.dataEmissaoFim) || isSameDay(dataEmissao, filters.dataEmissaoFim);
        }
      }

      // Filtro de data de vencimento
      let matchesDataVencimento = true;
      if (filters.dataVencimentoInicio || filters.dataVencimentoFim) {
        const dataVencimento = parseISO(account.dataVencimento);
        if (filters.dataVencimentoInicio && filters.dataVencimentoFim) {
          matchesDataVencimento =
            (isAfter(dataVencimento, filters.dataVencimentoInicio) || isSameDay(dataVencimento, filters.dataVencimentoInicio)) &&
            (isBefore(dataVencimento, filters.dataVencimentoFim) || isSameDay(dataVencimento, filters.dataVencimentoFim));
        } else if (filters.dataVencimentoInicio) {
          matchesDataVencimento = isAfter(dataVencimento, filters.dataVencimentoInicio) || isSameDay(dataVencimento, filters.dataVencimentoInicio);
        } else if (filters.dataVencimentoFim) {
          matchesDataVencimento = isBefore(dataVencimento, filters.dataVencimentoFim) || isSameDay(dataVencimento, filters.dataVencimentoFim);
        }
      }

      // Filtro de valor
      let matchesValor = true;
      if (filters.valorMinimo || filters.valorMaximo) {
        const valorMinimo = filters.valorMinimo ? parseFloat(filters.valorMinimo) : 0;
        const valorMaximo = filters.valorMaximo ? parseFloat(filters.valorMaximo) : Infinity;
        matchesValor = account.valorSaldo >= valorMinimo && account.valorSaldo <= valorMaximo;
      }

      // Filtro de contas vencidas
      let matchesVencidas = true;
      if (filters.apenaasVencidas) {
        matchesVencidas = account.status === 'VENCIDO';
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFornecedor &&
        matchesTipoDocumento &&
        matchesDataEmissao &&
        matchesDataVencimento &&
        matchesValor &&
        matchesVencidas
      );
    });
  }, [accounts, filters]);

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ABERTO: 'Aberto',
      PAGO: 'Pago',
      PARCIAL: 'Parcial',
      VENCIDO: 'Vencido',
      CANCELADO: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ABERTO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      PAGO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      PARCIAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      VENCIDO: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      CANCELADO: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
    };
    return colors[status] || colors.ABERTO;
  };

  const getTipoDocumentoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      FATURA: 'Fatura',
      DUPLICATA: 'Duplicata',
      BOLETO: 'Boleto',
      NOTA_FISCAL: 'Nota Fiscal',
    };
    return labels[tipo] || tipo;
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
            <Receipt className="h-8 w-8" />
            Contas a Pagar
          </h1>
          <p className="text-muted-foreground">
            Gerencie as contas a pagar da empresa
          </p>
        </div>
        <Link
          to="/accounts-payable/new"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nova Conta
        </Link>
      </div>

      <AccountsPayableFilters
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
                  Documento
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Fornecedor
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Emissão
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Vencimento
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Valor Original
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Valor Pago
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Saldo
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
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Receipt className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {filters.searchTerm || filters.status !== 'TODOS' 
                          ? 'Nenhuma conta encontrada com os filtros aplicados.' 
                          : 'Nenhuma conta cadastrada.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => (
                  <tr key={account.id} className="border-b">
                    <td className="p-4">
                      <div className="font-medium">{account.numeroDocumento}</div>
                      <div className="text-sm text-muted-foreground">
                        {getTipoDocumentoLabel(account.tipoDocumento)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{account.fornecedorNome || '-'}</div>
                      {account.fornecedorCnpjCpf && (
                        <div className="text-sm text-muted-foreground">
                          {account.fornecedorCnpjCpf}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{formatDate(account.dataEmissao)}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{formatDate(account.dataVencimento)}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-medium">{formatCurrency(account.valorOriginal)}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-sm text-green-600">{formatCurrency(account.valorPago)}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="font-medium text-blue-600">{formatCurrency(account.valorSaldo)}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(account.status)}`}
                      >
                        {getStatusLabel(account.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedAccountId(account.id);
                            setDetailDialogOpen(true);
                          }}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8"
                          title="Visualizar conta"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        
                        {/* Só mostra o dropdown se houver opções disponíveis */}
                        {account.status !== 'PAGO' && 
                         account.status !== 'CANCELADO' && 
                         !account.compraNumeroPedido && 
                         !account.compraModelo && 
                         !account.compraSerie && 
                         !account.compraFornecedorId && (
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
                                onClick={() => handleCancel(account.id)}
                                className="cursor-pointer text-red-600"
                              >
                                <X className="mr-2 h-4 w-4" />
                                <span>Cancelar</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Mostrando {filteredAccounts.length} de {accounts.length} conta{accounts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Detail Dialog */}
      <AccountsPayableDetailDialog
        accountId={selectedAccountId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onUpdate={loadAccounts}
      />
    </div>
  );
};

export default AccountsPayableList;
