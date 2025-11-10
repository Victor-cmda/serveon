import { useState, useEffect } from 'react';
import {
  DollarSign,
  XCircle,
  FileText,
  Calendar,
  User,
  CreditCard,
  Package,
} from 'lucide-react';
import { accountsPayableApi } from '@/services/api';
import { AccountPayable, PayAccountDto } from '@/types/account-payable';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AccountsPayableDetailDialogProps {
  accountId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

export function AccountsPayableDetailDialog({
  accountId,
  open,
  onOpenChange,
  onUpdate,
}: AccountsPayableDetailDialogProps) {
  const [account, setAccount] = useState<AccountPayable | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [paymentData, setPaymentData] = useState<PayAccountDto>({
    valorPago: 0,
    dataPagamento: new Date().toISOString().split('T')[0],
    formaPagamentoId: 0,
    valorDesconto: 0,
    valorJuros: 0,
    valorMulta: 0,
  });

  useEffect(() => {
    if (accountId && open) {
      loadAccount();
    }
  }, [accountId, open]);

  const loadAccount = async () => {
    if (!accountId) return;

    try {
      setLoading(true);
      const data = await accountsPayableApi.getById(accountId);
      setAccount(data);
      setPaymentData({
        valorPago: data.valorSaldo,
        dataPagamento: new Date().toISOString().split('T')[0],
        formaPagamentoId: data.formaPagamentoId || 0,
        valorDesconto: 0,
        valorJuros: 0,
        valorMulta: 0,
      });
    } catch (error) {
      toast.error('Erro ao carregar conta');
      console.error(error);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!accountId) return;

    try {
      await accountsPayableApi.pay(accountId, paymentData);
      toast.success('Pagamento registrado com sucesso!');
      setPaymentDialogOpen(false);
      loadAccount();
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao registrar pagamento');
      console.error(error);
    }
  };

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!accountId) return;

    try {
      await accountsPayableApi.cancel(accountId);
      toast.success('Conta cancelada com sucesso!');
      setCancelDialogOpen(false);
      loadAccount();
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao cancelar conta');
      console.error(error);
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
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      ABERTO: { label: 'Aberto', variant: 'default' },
      PAGO: { label: 'Pago', variant: 'secondary' },
      PARCIAL: { label: 'Parcial', variant: 'outline' },
      VENCIDO: { label: 'Vencido', variant: 'destructive' },
      CANCELADO: { label: 'Cancelado', variant: 'outline' },
    };

    const config = variants[status] || variants.ABERTO;

    return <Badge variant={config.variant}>{config.label}</Badge>;
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

  // Verifica se a conta foi criada a partir de uma compra
  const isFromPurchase = (account: AccountPayable | null) => {
    if (!account) return false;
    return !!(
      account.compraNumeroPedido ||
      account.compraModelo ||
      account.compraSerie ||
      account.compraFornecedorId
    );
  };

  if (!account && !loading) {
    return null;
  }

  const canPay = account && (account.status === 'ABERTO' || account.status === 'PARCIAL' || account.status === 'VENCIDO');
  // Só pode cancelar se não for de compra, não estiver pago e não estiver cancelado
  const canCancel = account && (account.status !== 'PAGO' && account.status !== 'CANCELADO') && !isFromPurchase(account);
  const hasCompraVinculada = account && (account.compraNumeroPedido || account.compraModelo || account.compraSerie);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">
                  Conta a Pagar #{account?.id}
                </DialogTitle>
                <DialogDescription>
                  Documento: {account?.numeroDocumento}
                </DialogDescription>
              </div>
              {account && getStatusBadge(account.status)}
            </div>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : account ? (
            <div className="space-y-6">
              {/* Aviso se a conta é de compra */}
              {isFromPurchase(account) && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Conta vinculada a compra
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Esta conta foi criada automaticamente a partir de uma compra e não pode ser cancelada manualmente. 
                        Para cancelar, cancele a compra de origem.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {canPay && (
                  <Button onClick={() => setPaymentDialogOpen(true)} size="sm">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Registrar Pagamento
                  </Button>
                )}
                {canCancel && (
                  <Button variant="outline" size="sm" onClick={handleCancelClick}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                )}
              </div>

              <hr className="my-6" />

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
                  </CardContent>
                </Card>

                {/* Fornecedor */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Fornecedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Nome</Label>
                      <p className="font-medium">{account.fornecedorNome || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">CNPJ/CPF</Label>
                      <p className="font-medium">{account.fornecedorCnpjCpf || 'N/A'}</p>
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
                    {account.dataPagamento && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Pagamento</Label>
                        <p className="font-medium">{formatDate(account.dataPagamento)}</p>
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
                      <Label className="text-xs">Pago</Label>
                      <p className="font-medium">{formatCurrency(account.valorPago)}</p>
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

              {/* Vínculo com Compra */}
              {hasCompraVinculada && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Package className="h-4 w-4" />
                      Vínculo com Compra
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4">
                    {account.compraNumeroPedido && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Pedido</Label>
                        <p className="font-medium">{account.compraNumeroPedido}</p>
                      </div>
                    )}
                    {account.compraModelo && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Modelo</Label>
                        <p className="font-medium">{account.compraModelo}</p>
                      </div>
                    )}
                    {account.compraSerie && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Série</Label>
                        <p className="font-medium">{account.compraSerie}</p>
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

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Preencha os dados do pagamento para esta conta
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Saldo Atual</Label>
              <p className="text-2xl font-bold text-blue-600">
                {account && formatCurrency(account.valorSaldo)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorPago">Valor Pago *</Label>
              <Input
                id="valorPago"
                type="number"
                step="0.01"
                value={paymentData.valorPago}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, valorPago: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataPagamento">Data de Pagamento *</Label>
              <Input
                id="dataPagamento"
                type="date"
                value={paymentData.dataPagamento}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, dataPagamento: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valorDesconto">Desconto</Label>
                <Input
                  id="valorDesconto"
                  type="number"
                  step="0.01"
                  value={paymentData.valorDesconto}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, valorDesconto: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorJuros">Juros</Label>
                <Input
                  id="valorJuros"
                  type="number"
                  step="0.01"
                  value={paymentData.valorJuros}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, valorJuros: Number(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valorMulta">Multa</Label>
                <Input
                  id="valorMulta"
                  type="number"
                  step="0.01"
                  value={paymentData.valorMulta}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, valorMulta: Number(e.target.value) })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePayment}>Confirmar Pagamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Conta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar esta conta?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Não
            </Button>
            <Button onClick={handleCancelConfirm}>Sim, Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
