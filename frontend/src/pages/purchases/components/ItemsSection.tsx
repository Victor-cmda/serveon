import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Search } from "lucide-react";
import { 
  formatCurrency, 
  parseNumber,
  calculateItemTotal,
  calculateItemCusto
} from "../utils/validationUtils";
import type { PurchaseItem, Purchase } from "@/types/purchase";

interface ItemsSectionProps {
  data: Partial<Purchase>;
  items: PurchaseItem[];
  onUpdateItems: (items: PurchaseItem[]) => void;
  onUpdateTotals: (field: string, value: number) => void;
  products: Array<{ id: number; nome: string; codigo?: string; preco?: number }>;
  isLoading?: boolean;
}

export function ItemsSection({
  data,
  items,
  onUpdateItems,
  onUpdateTotals,
  products,
  isLoading = false,
}: ItemsSectionProps) {
  const addItem = () => {
    const newItem: PurchaseItem = {
      id: 0,
      produtoId: 0,
      codigo: '',
      produto: '',
      unidade: '',
      quantidade: 0,
      precoUN: 0,
      descUN: 0,
      liquidoUN: 0,
      total: 0,
      rateio: 0,
      custoFinalUN: 0,
      custoFinal: 0,
    };
    
    onUpdateItems([...items, newItem]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onUpdateItems(newItems);
    updateTotalProdutos(newItems);
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    if (field === 'produtoId') {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        item.produtoId = product.id;
        item.produto = product.nome;
        item.codigo = product.codigo || '';
        if (product.preco && !item.precoUN) {
          item.precoUN = product.preco;
        }
      }
    } else if (field === 'quantidade' || field === 'precoUN' || field === 'descUN') {
      (item as any)[field] = typeof value === 'string' ? parseNumber(value) : value;
    } else {
      (item as any)[field] = value;
    }

    // Recalcular valores quando quantidade, preço ou desconto mudam
    if (field === 'quantidade' || field === 'precoUN' || field === 'descUN') {
      const totals = calculateItemTotal(item.quantidade, item.precoUN, item.descUn);
      item.liquidoUN = totals.liquidoUN;
      item.total = totals.total;
    }

    newItems[index] = item;
    onUpdateItems(newItems);
    
    // Atualizar total de produtos
    updateTotalProdutos(newItems);
  };

  const updateTotalProdutos = (itemsList: PurchaseItem[]) => {
    const total = itemsList.reduce((sum, item) => sum + (item.total || 0), 0);
    onUpdateTotals('totalProdutos', total);
  };

  const updateRateios = () => {
    const totalProdutos = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const despesasAdicionais = (data.valorFrete || 0) + (data.valorSeguro || 0) + (data.outrasDespesas || 0);
    
    if (totalProdutos <= 0 || despesasAdicionais <= 0) {
      return;
    }

    const newItems = items.map(item => {
      const percentual = item.total / totalProdutos;
      const rateio = despesasAdicionais * percentual;
      const custos = calculateItemCusto(item.liquidoUN, item.quantidade, rateio);
      
      return {
        ...item,
        rateio,
        custoFinalUN: custos.custoFinalUN,
        custoFinal: custos.custoFinal,
      };
    });

    onUpdateItems(newItems);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Itens da Compra</CardTitle>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={updateRateios}
            disabled={isLoading || items.length === 0}
          >
            Calcular Rateios
          </Button>
          <Button 
            type="button" 
            onClick={addItem}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum item adicionado. Clique em "Adicionar Item" para começar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Produto</TableHead>
                  <TableHead className="w-[100px]">Código</TableHead>
                  <TableHead className="w-[100px]">Qtd</TableHead>
                  <TableHead className="w-[120px]">Preço UN</TableHead>
                  <TableHead className="w-[120px]">Desc. UN</TableHead>
                  <TableHead className="w-[120px]">Líquido UN</TableHead>
                  <TableHead className="w-[120px]">Total</TableHead>
                  <TableHead className="w-[120px]">Rateio</TableHead>
                  <TableHead className="w-[120px]">Custo Final UN</TableHead>
                  <TableHead className="w-[120px]">Custo Final</TableHead>
                  <TableHead className="w-[50px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex gap-2">
                        <select
                          value={item.produtoId || ''}
                          onChange={(e) => updateItem(index, 'produtoId', e.target.value)}
                          className="flex-1 p-2 border rounded text-sm"
                          disabled={isLoading}
                        >
                          <option value="">Selecione...</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.codigo ? `${product.codigo} - ${product.nome}` : product.nome}
                            </option>
                          ))}
                        </select>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="button"
                          disabled={isLoading}
                        >
                          <Search className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.codigo || ''}
                        onChange={(e) => updateItem(index, 'codigo', e.target.value)}
                        className="text-sm"
                        disabled={isLoading}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantidade || ''}
                        onChange={(e) => updateItem(index, 'quantidade', e.target.value)}
                        className="text-sm"
                        step="0.001"
                        min="0"
                        disabled={isLoading}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.precoUN || ''}
                        onChange={(e) => updateItem(index, 'precoUN', e.target.value)}
                        className="text-sm"
                        step="0.01"
                        min="0"
                        disabled={isLoading}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.descUn || ''}
                        onChange={(e) => updateItem(index, 'descUN', e.target.value)}
                        className="text-sm"
                        step="0.01"
                        min="0"
                        disabled={isLoading}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatCurrency(item.liquidoUN)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatCurrency(item.total)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatCurrency(item.rateio)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatCurrency(item.custoFinalUN)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatCurrency(item.custoFinal)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
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
        )}

        {/* Resumo dos totais */}
        {items.length > 0 && (
          <div className="mt-4 flex justify-end">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-right font-medium">Total de Produtos:</div>
                <div className="text-right font-bold">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.total || 0), 0))}
                </div>
                <div className="text-right font-medium">Total de Rateios:</div>
                <div className="text-right">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.rateio || 0), 0))}
                </div>
                <div className="text-right font-medium">Custo Total Final:</div>
                <div className="text-right font-bold text-blue-600">
                  {formatCurrency(items.reduce((sum, item) => sum + (item.custoFinal || 0), 0))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}