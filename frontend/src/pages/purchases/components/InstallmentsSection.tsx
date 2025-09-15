import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, parseCurrency } from "../utils/validationUtils";
import type { PurchaseInstallment, Purchase } from "@/types/purchase";

interface InstallmentsSectionProps {
  data: Partial<Purchase>;
  installments: PurchaseInstallment[];
  onUpdateInstallments: (installments: PurchaseInstallment[]) => void;
  paymentMethods: Array<{ id: number; nome: string; codigo?: string }>;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export function InstallmentsSection({
  data,
  installments,
  onUpdateInstallments,
  paymentMethods,
  isLoading = false,
  errors = {},
}: InstallmentsSectionProps) {
  const addInstallment = () => {
    const nextParcela = installments.length + 1;
    const newInstallment: PurchaseInstallment = {
      id: 0,
      parcela: nextParcela,
      codigoFormaPagto: '',
      formaPagamentoId: 0,
      formaPagamento: '',
      dataVencimento: '',
      valorParcela: 0,
    };
    
    onUpdateInstallments([...installments, newInstallment]);
  };

  const removeInstallment = (index: number) => {
    const newInstallments = installments.filter((_, i) => i !== index);
    // Reorganizar números das parcelas
    const reorderedInstallments = newInstallments.map((installment, i) => ({
      ...installment,
      parcela: i + 1,
    }));
    onUpdateInstallments(reorderedInstallments);
  };

  const updateInstallment = (index: number, field: keyof PurchaseInstallment, value: any) => {
    const newInstallments = [...installments];
    const installment = { ...newInstallments[index] };
    
    if (field === 'formaPagamentoId') {
      const method = paymentMethods.find(m => m.id === parseInt(value));
      if (method) {
        installment.formaPagamentoId = method.id;
        installment.formaPagamento = method.nome;
        installment.codigoFormaPagto = method.codigo || '';
      }
    } else if (field === 'valorParcela') {
      installment.valorParcela = typeof value === 'string' ? parseCurrency(value) : value;
    } else {
      (installment as any)[field] = value;
    }

    newInstallments[index] = installment;
    onUpdateInstallments(newInstallments);
  };

  const generateInstallments = () => {
    if (!data.totalAPagar || !data.condicaoPagamentoId) {
      return;
    }

    // Esta função seria melhor implementada no backend baseada na condição de pagamento
    // Por enquanto, vamos criar uma parcela única
    const newInstallments: PurchaseInstallment[] = [{
      id: 0,
      parcela: 1,
      codigoFormaPagto: '',
      formaPagamentoId: 0,
      formaPagamento: '',
      dataVencimento: '',
      valorParcela: data.totalAPagar,
    }];

    onUpdateInstallments(newInstallments);
  };

  const totalParcelas = installments.reduce((sum, installment) => sum + (installment.valorParcela || 0), 0);
  const diferenca = (data.totalAPagar || 0) - totalParcelas;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Parcelas de Pagamento</CardTitle>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={generateInstallments}
            disabled={isLoading || !data.totalAPagar}
          >
            Gerar Parcelas
          </Button>
          <Button 
            type="button" 
            onClick={addInstallment}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Parcela
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {installments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma parcela configurada. Clique em "Gerar Parcelas" ou "Adicionar Parcela" para começar.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Parcela</TableHead>
                    <TableHead className="w-[100px]">Código</TableHead>
                    <TableHead className="w-[200px]">Forma de Pagamento</TableHead>
                    <TableHead className="w-[150px]">Data Vencimento</TableHead>
                    <TableHead className="w-[120px]">Valor</TableHead>
                    <TableHead className="w-[50px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((installment, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{installment.parcela}</div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={installment.codigoFormaPagto || ''}
                          onChange={(e) => updateInstallment(index, 'codigoFormaPagto', e.target.value)}
                          className="text-sm"
                          disabled={isLoading}
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={installment.formaPagamentoId?.toString() || ''}
                          onValueChange={(value) => updateInstallment(index, 'formaPagamentoId', value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.id} value={method.id.toString()}>
                                {method.codigo ? `${method.codigo} - ${method.nome}` : method.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={installment.dataVencimento || ''}
                          onChange={(e) => updateInstallment(index, 'dataVencimento', e.target.value)}
                          className="text-sm"
                          disabled={isLoading}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={installment.valorParcela || ''}
                          onChange={(e) => updateInstallment(index, 'valorParcela', e.target.value)}
                          className="text-sm"
                          step="0.01"
                          min="0"
                          disabled={isLoading}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInstallment(index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Resumo das parcelas */}
            <div className="flex justify-end">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-right font-medium">Total das Parcelas:</div>
                  <div className="text-right font-bold">
                    {formatCurrency(totalParcelas)}
                  </div>
                  <div className="text-right font-medium">Total a Pagar:</div>
                  <div className="text-right">
                    {formatCurrency(data.totalAPagar || 0)}
                  </div>
                  <div className="text-right font-medium">Diferença:</div>
                  <div className={`text-right font-bold ${diferenca > 0 ? 'text-red-600' : diferenca < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatCurrency(Math.abs(diferenca))}
                    {diferenca > 0 && ' (falta)'}
                    {diferenca < 0 && ' (sobra)'}
                  </div>
                </div>
                {Math.abs(diferenca) > 0.01 && (
                  <div className="mt-2 text-xs text-amber-600">
                    ⚠️ A soma das parcelas não confere com o total a pagar
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}