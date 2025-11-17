import { useState, useEffect } from 'react';
import { Search, Filter, FileText, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { accountsReceivableApi, customerApi } from '@/services/api';
import { AccountReceivable } from '@/types/account-receivable';
import { Customer } from '@/types/customer';
import {
  AccountsReceivableDetailDialog,
  ReceiveAccountDialog,
} from './components';
import { toast } from '@/lib/toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AccountsReceivablePage() {
  const [accounts, setAccounts] = useState<AccountReceivable[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [selectedAccount, setSelectedAccount] = useState<AccountReceivable | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [statusFilter, customerFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (customerFilter !== 'all') params.clienteId = customerFilter;

      const [accountsData, customersData] = await Promise.all([
        accountsReceivableApi.getAll(params),
        customerApi.getAll(),
      ]);

      setAccounts(accountsData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (account: AccountReceivable) => {
    setSelectedAccount(account);
    setIsDetailDialogOpen(true);
  };

  const handleReceive = (account: AccountReceivable) => {
    setSelectedAccount(account);
    setIsReceiveDialogOpen(true);
  };

  const handleCancel = async (account: AccountReceivable) => {
    if (!confirm('Tem certeza que deseja cancelar esta conta?')) return;

    try {
      await accountsReceivableApi.cancel(account.id);
      toast.success('Conta cancelada com sucesso.');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar conta.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ABERTO':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Aberto
          </Badge>
        );
      case 'RECEBIDO':
        return (
          <Badge className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="h-3 w-3" />
            Recebido
          </Badge>
        );
      case 'VENCIDO':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Vencido
          </Badge>
        );
      case 'CANCELADO':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Aberto
          </Badge>
        );
    }
  };  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.clienteNome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const totalReceivables = filteredAccounts.reduce(
    (sum, account) => sum + (account.status === 'ABERTO' || account.status === 'VENCIDO' ? account.valorSaldo : 0),
    0
  );

  const totalOverdue = filteredAccounts
    .filter((account) => account.status === 'VENCIDO')
    .reduce((sum, account) => sum + account.valorSaldo, 0);

  const totalReceived = filteredAccounts
    .filter((account) => account.status === 'RECEBIDO')
    .reduce((sum, account) => sum + account.valorRecebido, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contas a Receber</h1>
          <p className="text-muted-foreground">
            Contas criadas automaticamente através do módulo de Vendas
          </p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalReceivables)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredAccounts.filter((a) => a.status === 'ABERTO' || a.status === 'VENCIDO').length} contas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contas Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalOverdue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredAccounts.filter((a) => a.status === 'VENCIDO').length} contas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(totalReceived)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredAccounts.filter((a) => a.status === 'RECEBIDO').length} contas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtre as contas por status, cliente ou termo de busca</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por documento, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ABERTO">Em Aberto</SelectItem>
                <SelectItem value="RECEBIDO">Recebido</SelectItem>
                <SelectItem value="VENCIDO">Vencido</SelectItem>
                <SelectItem value="CANCELADO">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={customerFilter} onValueChange={setCustomerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Clientes</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.razaoSocial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCustomerFilter('all');
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <Card>
        <CardHeader>
          <CardTitle>Contas a Receber</CardTitle>
          <CardDescription>
            {filteredAccounts.length} {filteredAccounts.length === 1 ? 'conta encontrada' : 'contas encontradas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma conta encontrada</div>
          ) : (
            <div className="space-y-4">
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(account)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">{account.numeroDocumento}</div>
                          <div className="text-sm text-muted-foreground">{account.clienteNome}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Emissão</div>
                          <div className="font-medium">
                            {format(new Date(account.dataEmissao), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Vencimento</div>
                          <div className="font-medium">
                            {format(new Date(account.dataVencimento), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Valor Original</div>
                          <div className="font-medium">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(account.valorOriginal)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Saldo</div>
                          <div className="font-bold text-lg">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(account.valorSaldo)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      {getStatusBadge(account.status)}
                      <div className="flex gap-2">
                        {account.status === 'ABERTO' && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReceive(account);
                            }}
                          >
                            Receber
                          </Button>
                        )}
                        {(account.status === 'ABERTO' || account.status === 'VENCIDO') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(account);
                            }}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedAccount && (
        <>
          <AccountsReceivableDetailDialog
            open={isDetailDialogOpen}
            onOpenChange={setIsDetailDialogOpen}
            accountId={selectedAccount.id}
            onUpdate={loadData}
          />

          <ReceiveAccountDialog
            open={isReceiveDialogOpen}
            onOpenChange={setIsReceiveDialogOpen}
            account={selectedAccount}
            onSuccess={loadData}
          />
        </>
      )}
    </div>
  );
}

export default AccountsReceivablePage;
