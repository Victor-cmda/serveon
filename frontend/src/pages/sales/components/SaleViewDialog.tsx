import React from 'react';
import { X } from 'lucide-react';
import { Sale } from '../../../types/sale';

interface SaleViewDialogProps {
  sale: Sale;
  onClose: () => void;
}

const SaleViewDialog: React.FC<SaleViewDialogProps> = ({ sale, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Formata valores que já vêm em reais do backend (DECIMAL)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'APROVADO':
        return 'bg-blue-100 text-blue-800';
      case 'ENVIADO':
        return 'bg-blue-100 text-blue-800';
      case 'ENTREGUE':
        return 'bg-green-100 text-green-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Visualizar Venda</h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Gerais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Informações Gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Número da Nota</label>
                <p className="text-base font-medium">{sale.numeroSequencial || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Modelo</label>
                <p className="text-base font-medium">{sale.modelo || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Série</label>
                <p className="text-base font-medium">{sale.serie || '-'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(sale.status)}`}
                  >
                    {sale.status}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Emissão</label>
                <p className="text-base font-medium">{formatDate(sale.dataEmissao)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Entrega</label>
                <p className="text-base font-medium">{sale.dataEntrega ? formatDate(sale.dataEntrega) : '-'}</p>
              </div>
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome do Cliente</label>
                <p className="text-base font-medium">{sale.clienteNome || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID do Cliente</label>
                <p className="text-base font-medium">{sale.clienteId || '-'}</p>
              </div>
            </div>
          </div>

          {/* Informações de Pagamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Condição de Pagamento</label>
                <p className="text-base font-medium">{sale.condicaoPagamentoNome || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Funcionário Responsável</label>
                <p className="text-base font-medium">{sale.funcionarioNome || '-'}</p>
              </div>
            </div>
          </div>

          {/* Informações de Frete e Transporte */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Frete e Transporte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo de Frete</label>
                <p className="text-base font-medium">{sale.tipoFrete || '-'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Valor do Frete</label>
                <p className="text-base font-medium">{formatCurrency(sale.valorFrete)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Transportadora</label>
                <p className="text-base font-medium">
                  {sale.transportadoraNome || '-'}
                  {sale.transportadoraId && (
                    <span className="text-xs text-muted-foreground ml-2">
                      (Cód: {sale.transportadoraId})
                    </span>
                  )}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Valor do Seguro</label>
                <p className="text-base font-medium">{formatCurrency(sale.valorSeguro)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Outras Despesas</label>
                <p className="text-base font-medium">{formatCurrency(sale.outrasDespesas)}</p>
              </div>
            </div>
          </div>

          {/* Valores Totais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Valores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total dos Produtos</label>
                <p className="text-base font-medium">{formatCurrency(sale.totalProdutos || 0)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Valor de Desconto</label>
                <p className="text-base font-medium text-green-600">{formatCurrency(sale.valorDesconto)}</p>
              </div>

              <div className="md:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium text-muted-foreground">Total a Pagar</label>
                <p className="text-xl font-bold text-primary">{formatCurrency(sale.totalAPagar || 0)}</p>
              </div>
            </div>
          </div>

          {/* Produtos/Itens da Venda */}
          {sale.itens && sale.itens.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Produtos da Venda</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border px-4 py-2 text-left text-sm font-medium">Produto</th>
                      <th className="border px-4 py-2 text-left text-sm font-medium">Quantidade</th>
                      <th className="border px-4 py-2 text-left text-sm font-medium">Unidade</th>
                      <th className="border px-4 py-2 text-right text-sm font-medium">Preço Unit.</th>
                      <th className="border px-4 py-2 text-right text-sm font-medium">Desconto Un.</th>
                      <th className="border px-4 py-2 text-right text-sm font-medium">Total Líquido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.itens.map((item: any, index: number) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="border px-4 py-2 text-sm">{item.produto || '-'}</td>
                        <td className="border px-4 py-2 text-sm">{item.quantidade}</td>
                        <td className="border px-4 py-2 text-sm">{item.unidade || '-'}</td>
                        <td className="border px-4 py-2 text-sm text-right">{formatCurrency(item.preco_un || 0)}</td>
                        <td className="border px-4 py-2 text-sm text-right">{formatCurrency(item.desc_un || 0)}</td>
                        <td className="border px-4 py-2 text-sm text-right font-medium">{formatCurrency(item.total || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Parcelas de Pagamento */}
          {sale.parcelas && sale.parcelas.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Parcelas de Pagamento</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border px-4 py-2 text-left text-sm font-medium">Parcela</th>
                      <th className="border px-4 py-2 text-left text-sm font-medium">Data de Vencimento</th>
                      <th className="border px-4 py-2 text-left text-sm font-medium">Forma de Pagamento</th>
                      <th className="border px-4 py-2 text-right text-sm font-medium">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.parcelas.map((parcela: any, index: number) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="border px-4 py-2 text-sm">{parcela.parcela || index + 1}</td>
                        <td className="border px-4 py-2 text-sm">{formatDate(parcela.data_vencimento)}</td>
                        <td className="border px-4 py-2 text-sm">{parcela.forma_pagamento || '-'}</td>
                        <td className="border px-4 py-2 text-sm text-right font-medium">{formatCurrency(parcela.valor_parcela || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Observações */}
          {sale.observacoes && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Observações</h3>
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm whitespace-pre-wrap">{sale.observacoes}</p>
              </div>
            </div>
          )}

          {/* Informações de Auditoria */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Informações do Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Data de Criação</label>
                <p className="text-sm">{formatDate(sale.createdAt)}</p>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground">Última Atualização</label>
                <p className="text-sm">{formatDate(sale.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-background border-t px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleViewDialog;
