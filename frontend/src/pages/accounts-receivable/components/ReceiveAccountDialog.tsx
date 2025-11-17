import { useState, useEffect } from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { accountsReceivableApi } from '@/services/api';
import { AccountReceivable, ReceiveAccountDto } from '@/types/account-receivable';
import { toast } from '@/lib/toast';

interface ReceiveAccountDialogProps {
  account: AccountReceivable | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ReceiveAccountDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: ReceiveAccountDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [receiveData, setReceiveData] = useState<ReceiveAccountDto>({
    valorRecebido: 0,
    dataRecebimento: new Date().toISOString().split('T')[0],
    formaPagamentoId: 0,
    valorDesconto: 0,
    valorJuros: 0,
    valorMulta: 0,
  });

  useEffect(() => {
    if (account && open) {
      // Calcular o valor total a receber (valor original - desconto + juros + multa)
      const valorTotal = account.valorOriginal - (account.valorDesconto || 0) + (account.valorJuros || 0) + (account.valorMulta || 0);
      
      setReceiveData({
        valorRecebido: valorTotal,
        dataRecebimento: new Date().toISOString().split('T')[0],
        formaPagamentoId: account.formaPagamentoId || 0,
        valorDesconto: account.valorDesconto || 0,
        valorJuros: account.valorJuros || 0,
        valorMulta: account.valorMulta || 0,
      });
    }
  }, [account, open]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleReceive = async () => {
    if (!account) return;

    try {
      setIsLoading(true);
      await accountsReceivableApi.receive(account.id, receiveData);
      toast.success('Recebimento registrado com sucesso!');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar recebimento');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const canReceive = account && (account.status === 'ABERTO' || account.status === 'VENCIDO');

  if (!canReceive) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Recebimento</DialogTitle>
          <DialogDescription>
            Confirme o recebimento total desta conta
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Valor Total a Receber</Label>
            <p className="text-2xl font-bold text-green-600">
              {account && formatCurrency(
                account.valorOriginal - 
                (receiveData.valorDesconto || 0) + 
                (receiveData.valorJuros || 0) + 
                (receiveData.valorMulta || 0)
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              O recebimento deve ser feito pelo valor total. Recebimento parcial não é permitido.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dataRecebimento">Data de Recebimento *</Label>
            <Input
              id="dataRecebimento"
              type="date"
              value={receiveData.dataRecebimento}
              onChange={(e) =>
                setReceiveData({ ...receiveData, dataRecebimento: e.target.value })
              }
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valorDesconto">Desconto</Label>
              <Input
                id="valorDesconto"
                type="number"
                step="0.01"
                value={receiveData.valorDesconto}
                onChange={(e) => {
                  const desconto = Number(e.target.value);
                  const valorTotal = account ? 
                    account.valorOriginal - desconto + (receiveData.valorJuros || 0) + (receiveData.valorMulta || 0) : 0;
                  setReceiveData({ 
                    ...receiveData, 
                    valorDesconto: desconto,
                    valorRecebido: valorTotal 
                  });
                }}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorJuros">Juros</Label>
              <Input
                id="valorJuros"
                type="number"
                step="0.01"
                value={receiveData.valorJuros}
                onChange={(e) => {
                  const juros = Number(e.target.value);
                  const valorTotal = account ? 
                    account.valorOriginal - (receiveData.valorDesconto || 0) + juros + (receiveData.valorMulta || 0) : 0;
                  setReceiveData({ 
                    ...receiveData, 
                    valorJuros: juros,
                    valorRecebido: valorTotal 
                  });
                }}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorMulta">Multa</Label>
              <Input
                id="valorMulta"
                type="number"
                step="0.01"
                value={receiveData.valorMulta}
                onChange={(e) => {
                  const multa = Number(e.target.value);
                  const valorTotal = account ? 
                    account.valorOriginal - (receiveData.valorDesconto || 0) + (receiveData.valorJuros || 0) + multa : 0;
                  setReceiveData({ 
                    ...receiveData, 
                    valorMulta: multa,
                    valorRecebido: valorTotal 
                  });
                }}
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button onClick={handleReceive} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" />
                Confirmar Recebimento
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
