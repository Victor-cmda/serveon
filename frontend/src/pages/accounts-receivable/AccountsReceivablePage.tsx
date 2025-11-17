import React, { useState, useEffect, useMemo } from 'react';
import { Eye, Receipt, MoreVertical, Printer } from 'lucide-react';
import { accountsReceivableApi } from '@/services/api';
import { AccountReceivable } from '@/types/account-receivable';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AccountsReceivableFilters, AccountsReceivableFilterOptions } from './components/AccountsReceivableFilters';
import { AccountsReceivableDetailDialog } from './components/AccountsReceivableDetailDialog';
import { isAfter, isBefore, parseISO, isSameDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AccountsReceivablePage: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const [filters, setFilters] = useState<AccountsReceivableFilterOptions>({
    searchTerm: '',
    status: 'TODOS',
    clienteId: '0',
    tipoDocumento: 'TODOS',
    dataEmissaoInicio: undefined,
    dataEmissaoFim: undefined,
    dataVencimentoInicio: undefined,
    dataVencimentoFim: undefined,
    dataRecebimentoInicio: undefined,
    dataRecebimentoFim: undefined,
    valorMinimo: '',
    valorMaximo: '',
    apenasVencidas: false,
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountsReceivableApi.getAll();
      setAccounts(data);
    } catch (error) {
      console.error('Erro ao carregar contas a receber:', error);
      toast.error('Erro ao carregar contas a receber');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'TODOS',
      clienteId: '0',
      tipoDocumento: 'TODOS',
      dataEmissaoInicio: undefined,
      dataEmissaoFim: undefined,
      dataVencimentoInicio: undefined,
      dataVencimentoFim: undefined,
      dataRecebimentoInicio: undefined,
      dataRecebimentoFim: undefined,
      valorMinimo: '',
      valorMaximo: '',
      apenasVencidas: false,
    });
  };

  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      // Filtro de busca por texto
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        !filters.searchTerm ||
        account.numeroDocumento.toLowerCase().includes(searchLower) ||
        account.id.toString().includes(filters.searchTerm) ||
        (account.clienteNome && account.clienteNome.toLowerCase().includes(searchLower)) ||
        (account.clienteCnpjCpf && account.clienteCnpjCpf.toLowerCase().includes(searchLower)) ||
        account.tipoDocumento.toLowerCase().includes(searchLower);

      // Filtro de status
      const matchesStatus = filters.status === 'TODOS' || account.status === filters.status;

      // Filtro de cliente
      const matchesCliente =
        !filters.clienteId ||
        filters.clienteId === '0' ||
        account.clienteId?.toString() === filters.clienteId;

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
      if (filters.apenasVencidas) {
        matchesVencidas = account.status === 'VENCIDO';
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCliente &&
        matchesTipoDocumento &&
        matchesDataEmissao &&
        matchesDataVencimento &&
        matchesValor &&
        matchesVencidas
      );
    });
  }, [accounts, filters]);

  // Ordenar as contas filtradas por Modelo → Série → Número → Cliente → Parcela
  const sortedAccounts = useMemo(() => {
    return [...filteredAccounts].sort((a, b) => {
      // 1. Ordenar por Modelo
      const modeloA = a.vendaModelo || '';
      const modeloB = b.vendaModelo || '';
      if (modeloA !== modeloB) {
        return modeloA.localeCompare(modeloB);
      }

      // 2. Ordenar por Série
      const serieA = a.vendaSerie || '';
      const serieB = b.vendaSerie || '';
      if (serieA !== serieB) {
        return serieA.localeCompare(serieB);
      }

      // 3. Ordenar por Número
      const numeroA = a.vendaNumeroPedido || a.numeroDocumento || '';
      const numeroB = b.vendaNumeroPedido || b.numeroDocumento || '';
      if (numeroA !== numeroB) {
        return numeroA.localeCompare(numeroB);
      }

      // 4. Ordenar por Cliente
      const clienteA = a.clienteNome || '';
      const clienteB = b.clienteNome || '';
      if (clienteA !== clienteB) {
        return clienteA.localeCompare(clienteB);
      }

      // 5. Ordenar por Parcela (VARCHAR agora - comparação natural)
      const parcelaA = a.parcela || '';
      const parcelaB = b.parcela || '';
      return parcelaA.toString().localeCompare(parcelaB.toString(), undefined, { numeric: true });
    });
  }, [filteredAccounts]);

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      ABERTO: 'Aberto',
      RECEBIDO: 'Recebido',
      VENCIDO: 'Vencido',
      CANCELADO: 'Cancelado',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ABERTO: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      RECEBIDO: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
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
            Contas a Receber
          </h1>
          <p className="text-muted-foreground">
            Gerencie as contas a receber da empresa
          </p>
        </div>
      </div>

      <AccountsReceivableFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
      />

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-2 text-center align-middle font-medium text-muted-foreground whitespace-nowrap w-[80px]">
                  Modelo
                </th>
                <th className="h-12 px-2 text-center align-middle font-medium text-muted-foreground whitespace-nowrap w-[80px]">
                  Série
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap w-[140px]">
                  Número
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">
                  Cliente
                </th>
                <th className="h-12 px-2 text-center align-middle font-medium text-muted-foreground whitespace-nowrap w-[80px]">
                  Parcela
                </th>
                <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap w-[100px]">
                  Tipo
                </th>
                <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap w-[100px]">
                  Emissão
                </th>
                <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap w-[110px]">
                  Vencimento
                </th>
                <th className="h-12 px-3 text-right align-middle font-medium text-muted-foreground whitespace-nowrap w-[120px]">
                  Valor Original
                </th>
                <th className="h-12 px-3 text-right align-middle font-medium text-muted-foreground whitespace-nowrap w-[100px]">
                  Saldo
                </th>
                <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap w-[100px]">
                  Status
                </th>
                <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground whitespace-nowrap w-[80px]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="h-24 text-center">
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
                sortedAccounts.map((account) => (
                  <tr key={account.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 text-center w-[80px]">
                      <div className="text-sm whitespace-nowrap">{account.vendaModelo || '-'}</div>
                    </td>
                    <td className="p-2 text-center w-[80px]">
                      <div className="text-sm whitespace-nowrap">{account.vendaSerie || '-'}</div>
                    </td>
                    <td className="p-4 w-[140px]">
                      <div className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{account.vendaNumeroPedido || account.numeroDocumento}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={account.clienteNome || '-'}>
                        {account.clienteNome || '-'}
                      </div>
                      {account.clienteCnpjCpf && (
                        <div className="text-sm text-muted-foreground whitespace-nowrap">
                          {account.clienteCnpjCpf}
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-center w-[80px]">
                      {account.parcela ? (
                        <div className="inline-flex items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-1 text-xs font-medium text-blue-800 dark:text-blue-300 whitespace-nowrap">
                          {account.parcela}
                        </div>
                      ) : (
                        <span className="text-muted-foreground whitespace-nowrap">-</span>
                      )}
                    </td>
                    <td className="p-3 w-[100px]">
                      <div className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">{getTipoDocumentoLabel(account.tipoDocumento)}</div>
                    </td>
                    <td className="p-3 w-[100px]">
                      <div className="text-sm whitespace-nowrap">{formatDate(account.dataEmissao)}</div>
                    </td>
                    <td className="p-3 w-[110px]">
                      <div className="text-sm whitespace-nowrap">{formatDate(account.dataVencimento)}</div>
                    </td>
                    <td className="p-3 text-right w-[120px]">
                      <div className="font-medium whitespace-nowrap">{formatCurrency(account.valorOriginal)}</div>
                    </td>
                    <td className="p-3 text-right w-[100px]">
                      <div className="font-medium text-blue-600 whitespace-nowrap">{formatCurrency(account.valorSaldo)}</div>
                    </td>
                    <td className="p-3 w-[100px]">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${getStatusColor(account.status)}`}
                      >
                        {getStatusLabel(account.status)}
                      </span>
                    </td>
                    <td className="p-3 w-[80px]">
                      <div className="flex items-center gap-2 justify-center">
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
                        
                        {/* Dropdown de ações (apenas para imprimir - não há opções de cancelamento) */}
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
                              onClick={() => window.open(`/accounts-receivable/print/${account.id}`, '_blank')}
                              className="cursor-pointer"
                            >
                              <Printer className="mr-2 h-4 w-4" />
                              <span>Imprimir Comprovante</span>
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

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Mostrando {sortedAccounts.length} de {accounts.length} conta{accounts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Detail Dialog */}
      <AccountsReceivableDetailDialog
        accountId={selectedAccountId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        onUpdate={loadAccounts}
      />
    </div>
  );
};

export default AccountsReceivablePage;
