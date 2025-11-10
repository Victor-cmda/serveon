import { useEffect, useState } from 'react';
import PrintLayout from './PrintLayout';
import { Sale } from '@/types/sale';
import { salesApi } from '@/services/api';

interface SalePrintViewProps {
  saleId: number;
  onClose?: () => void;
}

const SalePrintView = ({ saleId, onClose }: SalePrintViewProps) => {
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSale = async () => {
      try {
        const data = await salesApi.getById(saleId);
        setSale(data);
      } catch (error) {
        console.error('Erro ao carregar venda:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSale();
  }, [saleId]);

  useEffect(() => {
    // Auto print quando os dados estiverem carregados
    if (sale && !loading) {
      setTimeout(() => {
        window.print();
        if (onClose) {
          onClose();
        }
      }, 500);
    }
  }, [sale, loading, onClose]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Carregando dados da venda...</p>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Venda não encontrada</p>
      </div>
    );
  }

  const formatCurrency = (value: number = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDENTE: 'Pendente',
      APROVADO: 'Aprovado',
      ENVIADO: 'Enviado',
      ENTREGUE: 'Entregue',
      CANCELADO: 'Cancelado',
    };
    return labels[status] || status;
  };

  return (
    <PrintLayout
      title="Nota Fiscal de Venda"
      documentType="NF-e"
      documentNumber={
        sale.numeroSequencial
          ? String(sale.numeroSequencial).padStart(6, '0')
          : sale.numeroPedido || String(sale.id)
      }
    >
      {/* Destinatário / Cliente */}
      <div className="print-section">
        <div className="print-section-header">Destinatário / Remetente</div>
        <div className="print-section-content">
          <div className="info-grid">
            <div className="info-item" style={{ gridColumn: 'span 2' }}>
              <span className="info-label">Nome / Razão Social</span>
              <span className="info-value">{sale.clienteNome}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Código</span>
              <span className="info-value">#{sale.clienteId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Data de Emissão</span>
              <span className="info-value">{formatDate(sale.dataEmissao)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dados da Nota Fiscal */}
      <div className="print-section">
        <div className="print-section-header">Dados da Nota Fiscal</div>
        <div className="print-section-content">
          <div className="info-grid">
            {sale.numeroPedido && (
              <div className="info-item">
                <span className="info-label">Nº Pedido</span>
                <span className="info-value">{sale.numeroPedido}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Data Emissão</span>
              <span className="info-value">{formatDate(sale.dataEmissao)}</span>
            </div>
            {sale.dataEntrega && (
              <div className="info-item">
                <span className="info-label">Data Entrega</span>
                <span className="info-value">{formatDate(sale.dataEntrega)}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className={`status-badge status-${sale.status.toLowerCase()}`}>
                {getStatusLabel(sale.status)}
              </span>
            </div>
            {sale.funcionarioNome && (
              <div className="info-item">
                <span className="info-label">Vendedor</span>
                <span className="info-value">{sale.funcionarioNome}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Produtos / Serviços */}
      {sale.itens && sale.itens.length > 0 && (
        <div className="print-section">
          <div className="print-section-header">Dados dos Produtos / Serviços</div>
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '8%' }}>Cód</th>
                <th style={{ width: '40%' }}>Descrição</th>
                <th style={{ width: '10%' }} className="text-center">Qtd</th>
                <th style={{ width: '13%' }} className="text-right">Un</th>
                <th style={{ width: '13%' }} className="text-right">V. Unit</th>
                <th style={{ width: '16%' }} className="text-right">V. Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.itens.map((item: any, index: number) => (
                <tr key={index}>
                  <td>{item.produtoId}</td>
                  <td>{item.produtoNome || `Produto #${item.produtoId}`}</td>
                  <td className="text-center">{item.quantidade}</td>
                  <td className="text-right">UN</td>
                  <td className="text-right">{formatCurrency(item.precoUn)}</td>
                  <td className="text-right font-bold">
                    {formatCurrency(item.total || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cálculo do Imposto */}
      <div className="print-section">
        <div className="print-section-header">Cálculo do Imposto</div>
        <div className="print-section-content">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Base de Cálculo ICMS</span>
              <span className="info-value">{formatCurrency(sale.totalProdutos || 0)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Valor do ICMS</span>
              <span className="info-value">R$ 0,00</span>
            </div>
            <div className="info-item">
              <span className="info-label">Base de Cálculo ICMS ST</span>
              <span className="info-value">R$ 0,00</span>
            </div>
            <div className="info-item">
              <span className="info-label">Valor ICMS Subst.</span>
              <span className="info-value">R$ 0,00</span>
            </div>
            <div className="info-item">
              <span className="info-label">Valor Total dos Produtos</span>
              <span className="info-value font-bold">{formatCurrency(sale.totalProdutos || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transportador / Volumes Transportados */}
      <div className="print-section">
        <div className="print-section-header">Transportador / Volumes Transportados</div>
        <div className="print-section-content">
          <div className="info-grid">
            <div className="info-item" style={{ gridColumn: 'span 2' }}>
              <span className="info-label">Razão Social</span>
              <span className="info-value">{sale.transportadoraNome || 'Não informado'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Frete por Conta</span>
              <span className="info-value">{sale.tipoFrete}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Valor Frete</span>
              <span className="info-value">{formatCurrency(sale.valorFrete)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Valor Seguro</span>
              <span className="info-value">{formatCurrency(sale.valorSeguro)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Outras Despesas</span>
              <span className="info-value">{formatCurrency(sale.outrasDespesas)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dados Adicionais */}
      <div className="print-section">
        <div className="print-section-header">Dados Adicionais</div>
        <div className="print-section-content">
          <div className="info-item">
            <span className="info-label">Informações Complementares</span>
            <div style={{ fontSize: '7pt', marginTop: '1mm', minHeight: '10mm' }}>
              {sale.observacoes || 'Sem observações'}
              <br /><br />
              <strong>Condição de Pagamento:</strong> {sale.condicaoPagamentoNome || `#${sale.condicaoPagamentoId}`}
              {sale.parcelas && sale.parcelas.length > 0 && (
                <>
                  <br />
                  <strong>Parcelas:</strong> {sale.parcelas.map((p: any) => 
                    `${p.parcela}ª parc: ${formatCurrency(p.valorParcela)} - Venc: ${formatDate(p.dataVencimento)}`
                  ).join(' | ')}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Totais */}
      <div className="print-totals">
        <div className="print-total-row">
          <span>Base de Cálculo ICMS:</span>
          <span>{formatCurrency(sale.totalProdutos || 0)}</span>
        </div>
        <div className="print-total-row">
          <span>Valor do ICMS:</span>
          <span>R$ 0,00</span>
        </div>
        <div className="print-total-row">
          <span>Base de Cálculo ICMS ST:</span>
          <span>R$ 0,00</span>
        </div>
        <div className="print-total-row">
          <span>Valor do ICMS Subst.:</span>
          <span>R$ 0,00</span>
        </div>
        <div className="print-total-row">
          <span>Valor Total dos Produtos:</span>
          <span className="font-bold">{formatCurrency(sale.totalProdutos || 0)}</span>
        </div>
        <div className="print-total-row">
          <span>Valor do Frete:</span>
          <span>{formatCurrency(sale.valorFrete)}</span>
        </div>
        <div className="print-total-row">
          <span>Valor do Seguro:</span>
          <span>{formatCurrency(sale.valorSeguro)}</span>
        </div>
        <div className="print-total-row">
          <span>Outras Despesas Acessórias:</span>
          <span>{formatCurrency(sale.outrasDespesas)}</span>
        </div>
        {sale.valorDesconto > 0 && (
          <div className="print-total-row">
            <span>Valor Total do Desconto:</span>
            <span>{formatCurrency(sale.valorDesconto)}</span>
          </div>
        )}
        <div className="print-total-row highlight">
          <span>VALOR TOTAL DA NOTA:</span>
          <span>{formatCurrency(sale.totalAPagar || 0)}</span>
        </div>
      </div>
    </PrintLayout>
  );
};

export default SalePrintView;
