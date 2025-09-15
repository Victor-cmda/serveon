import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";
import { formatCurrency, parseCurrency, calculatePurchaseTotal } from "../utils/validationUtils";
import type { Purchase } from "@/types/purchase";

interface FinancialSectionProps {
  data: Partial<Purchase>;
  onUpdate: (field: string, value: any) => void;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export function FinancialSection({
  data,
  onUpdate,
  isLoading = false,
  errors = {},
}: FinancialSectionProps) {
  const handleCurrencyChange = (field: string, value: string) => {
    const numValue = parseCurrency(value);
    onUpdate(field, numValue);
    
    // Recalcular total a pagar quando valores mudam
    if (['valorFrete', 'valorSeguro', 'outrasDespesas', 'valorDesconto'].includes(field)) {
      const updatedData = { ...data, [field]: numValue };
      const totalAPagar = calculatePurchaseTotal(
        updatedData.totalProdutos || 0,
        updatedData.valorFrete || 0,
        updatedData.valorSeguro || 0,
        updatedData.outrasDespesas || 0,
        updatedData.valorDesconto || 0
      );
      onUpdate('totalAPagar', totalAPagar);
    }
  };

  // Calcular total automaticamente quando totalProdutos muda
  React.useEffect(() => {
    if (data.totalProdutos !== undefined) {
      const totalAPagar = calculatePurchaseTotal(
        data.totalProdutos || 0,
        data.valorFrete || 0,
        data.valorSeguro || 0,
        data.outrasDespesas || 0,
        data.valorDesconto || 0
      );
      onUpdate('totalAPagar', totalAPagar);
    }
  }, [data.totalProdutos]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Financeiras</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primeira linha - Custos adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="valorFrete">Valor do Frete</Label>
            <Input
              id="valorFrete"
              type="number"
              value={data.valorFrete || ''}
              onChange={(e) => handleCurrencyChange('valorFrete', e.target.value)}
              placeholder="0,00"
              step="0.01"
              min="0"
              className={errors.valorFrete ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.valorFrete && (
              <p className="text-sm text-red-600 mt-1">{errors.valorFrete}</p>
            )}
          </div>

          <div>
            <Label htmlFor="valorSeguro">Valor do Seguro</Label>
            <Input
              id="valorSeguro"
              type="number"
              value={data.valorSeguro || ''}
              onChange={(e) => handleCurrencyChange('valorSeguro', e.target.value)}
              placeholder="0,00"
              step="0.01"
              min="0"
              className={errors.valorSeguro ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.valorSeguro && (
              <p className="text-sm text-red-600 mt-1">{errors.valorSeguro}</p>
            )}
          </div>

          <div>
            <Label htmlFor="outrasDespesas">Outras Despesas</Label>
            <Input
              id="outrasDespesas"
              type="number"
              value={data.outrasDespesas || ''}
              onChange={(e) => handleCurrencyChange('outrasDespesas', e.target.value)}
              placeholder="0,00"
              step="0.01"
              min="0"
              className={errors.outrasDespesas ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.outrasDespesas && (
              <p className="text-sm text-red-600 mt-1">{errors.outrasDespesas}</p>
            )}
          </div>

          <div>
            <Label htmlFor="valorDesconto">Valor de Desconto</Label>
            <Input
              id="valorDesconto"
              type="number"
              value={data.valorDesconto || ''}
              onChange={(e) => handleCurrencyChange('valorDesconto', e.target.value)}
              placeholder="0,00"
              step="0.01"
              min="0"
              className={errors.valorDesconto ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.valorDesconto && (
              <p className="text-sm text-red-600 mt-1">{errors.valorDesconto}</p>
            )}
          </div>
        </div>

        {/* Resumo financeiro */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lado esquerdo - Detalhamento */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Detalhamento dos Valores</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal dos Produtos:</span>
                  <span className="font-medium">{formatCurrency(data.totalProdutos || 0)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span>{formatCurrency(data.valorFrete || 0)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Seguro:</span>
                  <span>{formatCurrency(data.valorSeguro || 0)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Outras Despesas:</span>
                  <span>{formatCurrency(data.outrasDespesas || 0)}</span>
                </div>
                
                <div className="flex justify-between border-t pt-2">
                  <span>Subtotal c/ Despesas:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      (data.totalProdutos || 0) + 
                      (data.valorFrete || 0) + 
                      (data.valorSeguro || 0) + 
                      (data.outrasDespesas || 0)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-red-600">
                  <span>(-) Desconto:</span>
                  <span>{formatCurrency(data.valorDesconto || 0)}</span>
                </div>
              </div>
            </div>

            {/* Lado direito - Total */}
            <div className="flex flex-col justify-center">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Total a Pagar</h4>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(data.totalAPagar || 0)}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Valor final da compra
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}