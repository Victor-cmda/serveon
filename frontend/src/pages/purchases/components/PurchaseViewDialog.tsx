import React from 'react';
import {
  Package,
  Building2,
  Calendar,
  CreditCard,
  Truck,
  FileText,
  DollarSign,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
} from 'lucide-react';
import { Purchase } from '../../../types/purchase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PurchaseViewDialogProps {
  purchase: Purchase | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PurchaseViewDialog: React.FC<PurchaseViewDialogProps> = ({ 
  purchase, 
  open, 
  onOpenChange 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { 
      label: string; 
      variant: 'default' | 'secondary' | 'destructive' | 'outline';
      icon: React.ReactNode;
    }> = {
      PENDENTE: { 
        label: 'Pendente', 
        variant: 'outline',
        icon: <Clock className="h-3 w-3" />
      },
      APROVADO: { 
        label: 'Aprovado', 
        variant: 'default',
        icon: <CheckCircle2 className="h-3 w-3" />
      },
      CONFIRMADA: { 
        label: 'Confirmada', 
        variant: 'default',
        icon: <CheckCircle2 className="h-3 w-3" />
      },
      ENVIADO: { 
        label: 'Enviado', 
        variant: 'default',
        icon: <Truck className="h-3 w-3" />
      },
      RECEBIDO: { 
        label: 'Recebido', 
        variant: 'secondary',
        icon: <PackageCheck className="h-3 w-3" />
      },
      ENTREGUE: { 
        label: 'Entregue', 
        variant: 'secondary',
        icon: <PackageCheck className="h-3 w-3" />
      },
      CANCELADO: { 
        label: 'Cancelado', 
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />
      },
      CANCELADA: { 
        label: 'Cancelada', 
        variant: 'destructive',
        icon: <XCircle className="h-3 w-3" />
      },
    };

    const config = statusConfig[status] || statusConfig.PENDENTE;

    return (
      <Badge variant={config.variant} className="gap-1.5">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  if (!purchase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="space-y-3">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Package className="h-6 w-6" />
              Compra #{purchase.id}
            </DialogTitle>
            <div className="flex items-center justify-between">
              <DialogDescription>
                {purchase.numeroNota ? `Nota Fiscal: ${purchase.numeroNota}` : 'Detalhes da compra'}
              </DialogDescription>
              {getStatusBadge(purchase.status)}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Documento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Número do Pedido</Label>
                  <p className="font-medium">{purchase.numeroPedido || '-'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Modelo</Label>
                    <p className="font-medium">{purchase.modelo || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Série</Label>
                    <p className="font-medium">{purchase.serie || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4" />
                  Fornecedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <p className="font-medium">{purchase.fornecedorNome || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Código</Label>
                  <p className="font-medium">#{purchase.fornecedorId}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Datas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Emissão</Label>
                    <p className="font-medium">{formatDate(purchase.dataEmissao)}</p>
                  </div>
                  {purchase.dataChegada && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Chegada</Label>
                      <p className="font-medium">{formatDate(purchase.dataChegada)}</p>
                    </div>
                  )}
                </div>
                {purchase.dataEntregaRealizada && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Entrega Realizada</Label>
                    <p className="font-medium">{formatDate(purchase.dataEntregaRealizada)}</p>
                  </div>
                )}
                {purchase.dataAprovacao && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Aprovação</Label>
                    <p className="font-medium">{formatDate(purchase.dataAprovacao)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Responsável e Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Funcionário</Label>
                  <p className="font-medium">{purchase.funcionarioNome || '-'}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Condição de Pagamento</Label>
                  <p className="font-medium">{purchase.condicaoPagamentoNome || '-'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Truck className="h-4 w-4" />
                Frete e Transporte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Tipo de Frete</Label>
                  <Badge variant="outline" className="mt-1">
                    {purchase.tipoFrete}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Valor do Frete</Label>
                  <p className="font-medium">{formatCurrency(purchase.valorFrete)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Valor do Seguro</Label>
                  <p className="font-medium">{formatCurrency(purchase.valorSeguro)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Outras Despesas</Label>
                  <p className="font-medium">{formatCurrency(purchase.outrasDespesas)}</p>
                </div>
              </div>
              {purchase.transportadoraNome && (
                <div className="mt-3">
                  <Label className="text-xs text-muted-foreground">Transportadora</Label>
                  <p className="font-medium">{purchase.transportadoraNome}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" />
                Valores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm text-muted-foreground">Total dos Produtos</Label>
                  <p className="font-medium">{formatCurrency(purchase.totalProdutos || 0)}</p>
                </div>
                {purchase.valorDesconto > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <Label className="text-sm">Desconto</Label>
                    <p className="font-medium">- {formatCurrency(purchase.valorDesconto)}</p>
                  </div>
                )}
                {purchase.valorAcrescimo && purchase.valorAcrescimo > 0 && (
                  <div className="flex justify-between items-center text-orange-600">
                    <Label className="text-sm">Acréscimo</Label>
                    <p className="font-medium">+ {formatCurrency(purchase.valorAcrescimo)}</p>
                  </div>
                )}
                <div className="flex justify-between items-center text-blue-600">
                  <Label className="text-sm">Frete</Label>
                  <p className="font-medium">+ {formatCurrency(purchase.valorFrete)}</p>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Total a Pagar</Label>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(purchase.totalAPagar || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {purchase.itens && purchase.itens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4" />
                  Produtos ({purchase.itens.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-center">Qtd</TableHead>
                        <TableHead className="text-center">Unidade</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Desconto</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchase.itens.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.produto || '-'}</TableCell>
                          <TableCell className="text-center">{item.quantidade}</TableCell>
                          <TableCell className="text-center">{item.unidade || '-'}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.preco_un || 0)}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            {formatCurrency(item.desc_un || 0)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.total || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {purchase.parcelas && purchase.parcelas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="h-4 w-4" />
                  Parcelas ({purchase.parcelas.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Parcela</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Forma de Pagamento</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchase.parcelas.map((parcela: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="text-center">
                            <Badge variant="outline">{parcela.parcela || index + 1}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(parcela.data_vencimento)}</TableCell>
                          <TableCell>{parcela.forma_pagamento || '-'}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(parcela.valor_parcela || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {purchase.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {purchase.observacoes}
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-muted-foreground">Criado em</Label>
                  <p className="text-sm">{formatDate(purchase.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Atualizado em</Label>
                  <p className="text-sm">{formatDate(purchase.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseViewDialog;
