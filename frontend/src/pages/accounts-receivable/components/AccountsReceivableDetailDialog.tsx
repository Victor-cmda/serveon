import { useState, useEffect } from 'react';
import {
  DollarSign,
  XCircle,
  FileText,
  Calendar as CalendarIcon,
  User,
  CreditCard,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { accountsReceivableApi, customerApi, paymentTermApi, paymentMethodApi } from '@/services/api';
import { AccountReceivable, ReceiveAccountDto } from '@/types/account-receivable';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [paymentTerm, setPaymentTerm] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const [receiveData, setReceiveData] = useState<ReceiveAccountDto>({
    valorRecebido: 0,
    dataRecebimento: new Date().toISOString().split('T')[0],
    formaPagamentoId: 0,
    valorDesconto: 0,
    valorJuros: 0,
    valorMulta: 0,
  });

  useEffect(() => {
    // Carregar formas de pagamento
    const loadPaymentMethods = async () => {
      try {
        const methods = await paymentMethodApi.getAll();
        setPaymentMethods(methods.filter((m: any) => m.ativo));
      } catch (error) {
        console.error('Erro ao carregar formas de pagamento:', error);
      }
    };
    loadPaymentMethods();
  }, []);

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
      
      // Buscar o cliente para obter a condição de pagamento
      let customerPaymentTerm = null;
      if (data.clienteId) {
        try {
          const customer = await customerApi.getById(data.clienteId);
          
          // Se o cliente tem condição de pagamento, buscar seus dados
          if (customer.condicaoPagamentoId) {
            customerPaymentTerm = await paymentTermApi.getById(customer.condicaoPagamentoId);
            setPaymentTerm(customerPaymentTerm);
          }
        } catch (error) {
          console.error('Erro ao buscar condição de pagamento:', error);
        }
      }
      
      // Calcular valores baseado na data atual e condição de pagamento
      const hoje = new Date();
      const vencimento = new Date(data.dataVencimento);
      const diffDays = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
      
      // Usar os valores já calculados da conta ou calcular novos se necessário
      let desconto = data.valorDesconto || 0;
      let juros = data.valorJuros || 0;
      let multa = data.valorMulta || 0;
      let formaPagamentoId = data.formaPagamentoId || 0;
      
      // Se ainda não tem valores calculados e tem condição de pagamento, calcular
      if ((desconto === 0 && juros === 0 && multa === 0) && customerPaymentTerm) {
        if (diffDays < 0) {
          // Pagamento antecipado - aplicar percentual de desconto da condição
          const percentualDesconto = customerPaymentTerm.discountPercentage || 0;
          desconto = data.valorOriginal * (percentualDesconto / 100);
        } else if (diffDays > 0) {
          // Pagamento atrasado - aplicar multa e juros da condição
          const percentualMulta = customerPaymentTerm.fineRate || 0;
          const percentualJuros = customerPaymentTerm.interestRate || 0;
          
          multa = data.valorOriginal * (percentualMulta / 100);
          juros = diffDays * (data.valorOriginal * (percentualJuros / 100));
        }
      }
      
      // Buscar forma de pagamento da condição se disponível
      if (customerPaymentTerm && customerPaymentTerm.installments && customerPaymentTerm.installments.length > 0) {
        const firstInstallment = customerPaymentTerm.installments[0];
        formaPagamentoId = firstInstallment.paymentMethodId || data.formaPagamentoId || 0;
        console.log('Forma de pagamento da condição:', formaPagamentoId);
      } else {
        console.log('Usando forma de pagamento da conta:', formaPagamentoId);
      }
      
      // Calcular o valor total a receber
      // Se tem desconto calculado (pagamento antecipado), aplicar o desconto
      // Caso contrário, usar o saldo devedor que já inclui juros e multa
      let valorTotal: number;
      if (desconto > 0) {
        valorTotal = data.valorOriginal - desconto;
      } else {
        valorTotal = data.valorSaldo;
      }
      
      console.log('Dados do recebimento:', {
        valorOriginal: data.valorOriginal,
        valorSaldo: data.valorSaldo,
        desconto,
        juros,
        multa,
        valorTotal,
        formaPagamentoId,
        diffDays
      });
      
      setReceiveData({
        valorRecebido: valorTotal,
        dataRecebimento: new Date().toISOString().split('T')[0],
        formaPagamentoId: formaPagamentoId,
        valorDesconto: desconto,
        valorJuros: juros,
        valorMulta: multa,
      });
    } catch (error) {
      toast.error('Erro ao carregar conta');
      console.error(error);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async () => {
    if (!accountId) return;

    try {
      await accountsReceivableApi.receive(accountId, receiveData);
      toast.success('Recebimento registrado com sucesso!');
      setReceiveDialogOpen(false);
      loadAccount();
      onUpdate?.();
    } catch (error) {
      toast.error('Erro ao registrar recebimento');
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
              {/* Botão de Recebimento */}
              {(account.status === 'ABERTO' || account.status === 'VENCIDO') && (
                <div className="flex justify-start">
                  <Button onClick={() => setReceiveDialogOpen(true)}>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Receber Pagamento
                  </Button>
                </div>
              )}

              {/* Condição de Pagamento do Cliente */}
              {paymentTerm && (
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-green-900 dark:text-green-100">
                      <CreditCard className="h-4 w-4" />
                      Condição de Pagamento do Cliente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-green-700 dark:text-green-300">Nome</Label>
                        <p className="font-semibold text-green-900 dark:text-green-100">{paymentTerm.name}</p>
                      </div>
                      {paymentTerm.discountPercentage > 0 && (
                        <div>
                          <Label className="text-xs text-green-700 dark:text-green-300">Desconto Antecipação</Label>
                          <p className="font-semibold text-green-900 dark:text-green-100">{paymentTerm.discountPercentage}%</p>
                        </div>
                      )}
                      {paymentTerm.fineRate > 0 && (
                        <div>
                          <Label className="text-xs text-green-700 dark:text-green-300">Multa</Label>
                          <p className="font-semibold text-green-900 dark:text-green-100">{paymentTerm.fineRate}%</p>
                        </div>
                      )}
                      {paymentTerm.interestRate > 0 && (
                        <div>
                          <Label className="text-xs text-green-700 dark:text-green-300">Juros (ao dia)</Label>
                          <p className="font-semibold text-green-900 dark:text-green-100">{paymentTerm.interestRate}%</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                      <CalendarIcon className="h-4 w-4" />
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

      {/* Dialog de Recebimento */}
      <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Receber Pagamento
            </DialogTitle>
            <DialogDescription>
              Conta #{account?.id} - Vencimento: {account?.dataVencimento ? format(new Date(account.dataVencimento), "dd/MM/yyyy", { locale: ptBR }) : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Informativo sobre Condição de Pagamento */}
            {paymentTerm && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                <div className="flex items-start gap-2">
                  <CreditCard className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      <strong>Condição de Pagamento:</strong> {paymentTerm.name}
                      {' - '}
                      Os valores de desconto, juros e multa são calculados automaticamente 
                      com base na condição de pagamento do cliente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Valor Original */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <Label className="text-xs text-muted-foreground">Valor Original</Label>
                <p className="text-lg font-semibold">
                  {account?.valorOriginal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Saldo Devedor</Label>
                <p className="text-lg font-semibold">
                  {account?.valorSaldo?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>

            {/* Data de Recebimento */}
            <div className="space-y-2">
              <Label>Data de Recebimento *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !receiveData.dataRecebimento && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {receiveData.dataRecebimento ? (
                      format(new Date(receiveData.dataRecebimento), "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={receiveData.dataRecebimento ? new Date(receiveData.dataRecebimento) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        setReceiveData(prev => ({ ...prev, dataRecebimento: dateStr }));
                        
                        // Calcular desconto/juros/multa baseado na data e condição de pagamento
                        if (account) {
                          const vencimento = new Date(account.dataVencimento);
                          const recebimento = new Date(dateStr);
                          const diffDays = Math.floor((recebimento.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24));
                          
                          let desconto = 0;
                          let juros = 0;
                          let multa = 0;
                          
                          if (diffDays < 0 && paymentTerm) {
                            // Pagamento antecipado - aplicar percentual de desconto da condição
                            const percentualDesconto = paymentTerm.discountPercentage || 0;
                            desconto = account.valorOriginal * (percentualDesconto / 100);
                          } else if (diffDays > 0 && paymentTerm) {
                            // Pagamento atrasado - aplicar multa e juros da condição
                            const percentualMulta = paymentTerm.fineRate || 0;
                            const percentualJuros = paymentTerm.interestRate || 0;
                            
                            multa = account.valorOriginal * (percentualMulta / 100);
                            juros = diffDays * (account.valorOriginal * (percentualJuros / 100));
                          }
                          
                          // O valor total é o valor original com os ajustes calculados
                          const valorTotal = account.valorOriginal - desconto + juros + multa;
                          
                          setReceiveData(prev => ({
                            ...prev,
                            valorDesconto: desconto,
                            valorJuros: juros,
                            valorMulta: multa,
                            valorRecebido: valorTotal,
                          }));
                        }
                      }
                    }}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Forma de Pagamento */}
            <div className="space-y-2">
              <Label>Forma de Pagamento *</Label>
              <Select
                value={receiveData.formaPagamentoId?.toString()}
                onValueChange={(value) => setReceiveData(prev => ({ ...prev, formaPagamentoId: parseInt(value) }))}
                disabled={paymentTerm && paymentTerm.installments && paymentTerm.installments.length > 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method: any) => (
                    <SelectItem key={method.id} value={method.id.toString()}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {paymentTerm && paymentTerm.installments && paymentTerm.installments.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Definido automaticamente pela condição de pagamento
                </p>
              )}
            </div>

            {/* Valores Calculados Automaticamente */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Desconto {paymentTerm && `(${paymentTerm.discountPercentage}%)`}</Label>
                <Input
                  type="text"
                  value={(receiveData.valorDesconto || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                  readOnly
                  className="font-mono bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Calculado automaticamente pela condição de pagamento
                </p>
              </div>

              <div className="space-y-2">
                <Label>Juros {paymentTerm && `(${paymentTerm.interestRate}% ao dia)`}</Label>
                <Input
                  type="text"
                  value={(receiveData.valorJuros || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                  readOnly
                  className="font-mono bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Calculado automaticamente pela condição de pagamento
                </p>
              </div>

              <div className="space-y-2">
                <Label>Multa {paymentTerm && `(${paymentTerm.fineRate}%)`}</Label>
                <Input
                  type="text"
                  value={(receiveData.valorMulta || 0).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                  readOnly
                  className="font-mono bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Calculado automaticamente pela condição de pagamento
                </p>
              </div>

              <div className="space-y-2">
                <Label>Valor Total a Receber</Label>
                <Input
                  type="text"
                  value={receiveData.valorRecebido.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  })}
                  readOnly
                  className="font-mono font-semibold text-lg bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Recebimento integral obrigatório. Não é permitido recebimento parcial.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleReceive}
              disabled={!receiveData.formaPagamentoId || receiveData.valorRecebido <= 0}
            >
              Confirmar Recebimento Integral
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
