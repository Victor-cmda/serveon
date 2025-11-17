import { useState, useEffect } from 'react';
import {
  DollarSign,
  XCircle,
  FileText,
  Calendar,
  User,
  CreditCard,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { accountsReceivableApi } from '@/services/api';
import { AccountReceivable } from '@/types/account-receivable';
import { toast } from '@/lib/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AccountsReceivableDetailDialogProps {
  accountId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function AccountsReceivableDetailDialog({
  accountId,
  open,
  onOpenChange,
  onUpdate,
}: AccountsReceivableDetailDialogProps) {
  const [account, setAccount] = useState<AccountReceivable | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accountId && open) {
      loadAccount();
    }
  }, [accountId, open]);

  const loadAccount = async () => {
    if (!accountId) return;

    try {
      setLoading(true);
      const data = await accountsReceivableApi.getById(accountId);
      setAccount(data);
    } catch (error) {
      toast.error('Erro ao carregar conta');
      console.error(error);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { 
      label: string; 
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
      icon: React.ReactNode;
      className?: string;
    }> = {
      ABERTO: { 
        label: 'Aberto', 
        variant: 'default',
        icon: <Clock className="h-3 w-3" />
      },
      RECEBIDO: { 
        label: 'Recebido', 
        variant: 'secondary',
        icon: <CheckCircle2 className="h-3 w-3" />,
        className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      },
      VENCIDO: { 
        label: 'Vencido', 
        variant: 'destructive',
        icon: <AlertCircle className="h-3 w-3" />
      },
      CANCELADO: { 
        label: 'Cancelado', 
        variant: 'outline',
        icon: <XCircle className="h-3 w-3" />
      },
    };

    const config = variants[status] || variants.ABERTO;

    return (
      <Badge variant={config.variant} className={`gap-1.5 ${config.className || ''}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
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

  const hasVendaVinculada = account && (account.vendaNumeroPedido || account.vendaModelo || account.vendaSerie);

  if (!account && !loading) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="space-y-3">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <DollarSign className="h-6 w-6" />
                Conta a Receber #{account?.id}
              </DialogTitle>
              <div className="flex items-center justify-between">
                <DialogDescription>
                  Documento: {account?.numeroDocumento}
                </DialogDescription>
                {account && getStatusBadge(account.status)}
              </div>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : account ? (
            <div className="space-y-6">
              {/* Aviso - Todas as contas são de vendas */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <div className="flex items-start gap-3">
                  <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      Conta vinculada a venda
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Esta conta foi criada automaticamente através do módulo de Vendas. 
                      Para cancelar, cancele a venda de origem.
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid de Informações */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Informações do Documento */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FileText className="h-4 w-4" />
                      Documento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Número</Label>
                      <p className="font-medium">{account.numeroDocumento}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Tipo</Label>
                      <p className="font-medium">{getTipoDocumentoLabel(account.tipoDocumento)}</p>
                    </div>
                    {account.parcela && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Parcela</Label>
                        <p className="font-medium">
                          <span className="inline-flex items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900 px-2 py-1 text-sm font-medium text-blue-800 dark:text-blue-300">
                            {account.parcela}
                          </span>
                        </p>
                      </div>
                    )}
                    {account.vendaNumeroPedido && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Número NF</Label>
                        <p className="font-medium">{account.vendaNumeroPedido}</p>
                      </div>
                    )}
                    {account.vendaModelo && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Modelo NF</Label>
                        <p className="font-medium">{account.vendaModelo}</p>
                      </div>
                    )}
                    {account.vendaSerie && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Série NF</Label>
                        <p className="font-medium">{account.vendaSerie}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Cliente */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Nome</Label>
                      <p className="font-medium">{account.clienteNome || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">CNPJ/CPF</Label>
                      <p className="font-medium">{account.clienteCnpjCpf || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Datas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-4 w-4" />
                      Datas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Emissão</Label>
                      <p className="font-medium">{formatDate(account.dataEmissao)}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Vencimento</Label>
                      <p className="font-medium">{formatDate(account.dataVencimento)}</p>
                    </div>
                    {account.dataRecebimento && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Recebimento</Label>
                        <p className="font-medium">{formatDate(account.dataRecebimento)}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Valores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <DollarSign className="h-4 w-4" />
                      Valores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <Label className="text-xs text-muted-foreground">Original</Label>
                      <p className="font-medium">{formatCurrency(account.valorOriginal)}</p>
                    </div>
                    {account.valorDesconto > 0 && (
                      <div className="flex justify-between text-green-600">
                        <Label className="text-xs">Desconto</Label>
                        <p className="font-medium">- {formatCurrency(account.valorDesconto)}</p>
                      </div>
                    )}
                    {account.valorJuros > 0 && (
                      <div className="flex justify-between text-yellow-600">
                        <Label className="text-xs">Juros</Label>
                        <p className="font-medium">+ {formatCurrency(account.valorJuros)}</p>
                      </div>
                    )}
                    {account.valorMulta > 0 && (
                      <div className="flex justify-between text-red-600">
                        <Label className="text-xs">Multa</Label>
                        <p className="font-medium">+ {formatCurrency(account.valorMulta)}</p>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between">
                      <Label className="text-xs font-semibold">Total</Label>
                      <p className="font-bold">
                        {formatCurrency(
                          account.valorOriginal -
                          account.valorDesconto +
                          account.valorJuros +
                          account.valorMulta
                        )}
                      </p>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <Label className="text-xs">Recebido</Label>
                      <p className="font-medium">{formatCurrency(account.valorRecebido)}</p>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between">
                      <Label className="text-xs font-semibold">Saldo</Label>
                      <p className="font-bold text-blue-600">
                        {formatCurrency(account.valorSaldo)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Forma de Pagamento */}
              {account.formaPagamentoNome && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CreditCard className="h-4 w-4" />
                      Forma de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{account.formaPagamentoNome}</p>
                  </CardContent>
                </Card>
              )}

              {/* Vínculo com Venda */}
              {hasVendaVinculada && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ShoppingCart className="h-4 w-4" />
                      Vínculo com Venda
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    {account.vendaNumeroPedido && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Pedido</Label>
                        <p className="font-medium">{account.vendaNumeroPedido}</p>
                      </div>
                    )}
                    {account.vendaModelo && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Modelo</Label>
                        <p className="font-medium">{account.vendaModelo}</p>
                      </div>
                    )}
                    {account.vendaSerie && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Série</Label>
                        <p className="font-medium">{account.vendaSerie}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Observações */}
              {account.observacoes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {account.observacoes}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
