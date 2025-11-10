import { useEffect, useState } from 'react';
import PrintLayout from './PrintLayout';
import { Purchase } from '@/types/purchase';
import { purchaseApi } from '@/services/api';

interface PurchasePrintViewProps {
  purchaseId: number;
  onClose?: () => void;
}

const PurchasePrintView = ({
  purchaseId,
  onClose,
}: PurchasePrintViewProps) => {
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPurchase = async () => {
      try {
        const data = await purchaseApi.getById(purchaseId);
        setPurchase(data);
      } catch (error) {
        console.error('Erro ao carregar compra:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchase();
  }, [purchaseId]);

  useEffect(() => {
    // Auto print quando os dados estiverem carregados
    if (purchase && !loading) {
      setTimeout(() => {
        window.print();
        if (onClose) {
          onClose();
        }
      }, 500);
    }
  }, [purchase, loading, onClose]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Carregando dados da compra...</p>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Compra não encontrada</p>
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
      RECEBIDO: 'Recebido',
      CANCELADO: 'Cancelado',
    };
    return labels[status] || status;
  };

  return (
    <PrintLayout
      title="Nota Fiscal de Entrada"
      documentType="NF-e ENTRADA"
      documentNumber={
        purchase.numeroSequencial
          ? String(purchase.numeroSequencial).padStart(6, '0')
          : purchase.numeroPedido || String(purchase.id)
      }
    >
      {/* Remetente / Fornecedor */}
      <div className="print-section">
        <div className="print-section-header">Remetente / Fornecedor</div>
        <div className="print-section-content">
          <div className="info-grid">
            <div className="info-item" style={{ gridColumn: 'span 2' }}>
              <span className="info-label">Nome / Razão Social</span>
              <span className="info-value">{purchase.fornecedorNome}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Código</span>
              <span className="info-value">#{purchase.fornecedorId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Data de Emissão</span>
              <span className="info-value">{formatDate(purchase.dataEmissao)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dados da Nota Fiscal */}
      <div className="print-section">
        <div className="print-section-header">Dados da Nota Fiscal de Entrada</div>
        <div className="print-section-content">
          <div className="info-grid">
            {purchase.numeroPedido && (
              <div className="info-item">
                <span className="info-label">Nº Pedido</span>
                <span className="info-value">{purchase.numeroPedido}</span>
              </div>
            )}
            {purchase.numeroNota && (
              <div className="info-item">
                <span className="info-label">Nº Nota Fiscal</span>
                <span className="info-value">{purchase.numeroNota}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Data Emissão</span>
              <span className="info-value">{formatDate(purchase.dataEmissao)}</span>
            </div>
            {purchase.dataChegada && (
              <div className="info-item">
                <span className="info-label">Data Chegada</span>
                <span className="info-value">{formatDate(purchase.dataChegada)}</span>
              </div>
            )}
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className={`status-badge status-${purchase.status.toLowerCase()}`}>
                {getStatusLabel(purchase.status)}
              </span>
            </div>
            {purchase.funcionarioNome && (
              <div className="info-item">
                <span className="info-label">Comprador</span>
                <span className="info-value">{purchase.funcionarioNome}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Produtos / Serviços */}
      {purchase.itens && purchase.itens.length > 0 && (
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
              {purchase.itens.map((item: any, index: number) => (
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
              <span className="info-value">{formatCurrency(purchase.totalProdutos || 0)}</span>
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
              <span className="info-value font-bold">{formatCurrency(purchase.totalProdutos || 0)}</span>
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
              <span className="info-value">{purchase.transportadoraNome || 'Não informado'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Frete por Conta</span>
              <span className="info-value">{purchase.tipoFrete}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Valor Frete</span>
              <span className="info-value">{formatCurrency(purchase.valorFrete)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Valor Seguro</span>
              <span className="info-value">{formatCurrency(purchase.valorSeguro)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Outras Despesas</span>
              <span className="info-value">{formatCurrency(purchase.outrasDespesas)}</span>
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
              {purchase.observacoes || 'Sem observações'}
              <br /><br />
              <strong>Condição de Pagamento:</strong> {purchase.condicaoPagamentoNome || `#${purchase.condicaoPagamentoId}`}
              {purchase.parcelas && purchase.parcelas.length > 0 && (
                <>
                  <br />
                  <strong>Parcelas:</strong> {purchase.parcelas.map((p: any) => 
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
          <span>{formatCurrency(purchase.totalProdutos || 0)}</span>
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
          <span className="font-bold">{formatCurrency(purchase.totalProdutos || 0)}</span>
        </div>
        <div className="print-total-row">
          <span>Valor do Frete:</span>
          <span>{formatCurrency(purchase.valorFrete)}</span>
        </div>
        <div className="print-total-row">
          <span>Valor do Seguro:</span>
          <span>{formatCurrency(purchase.valorSeguro)}</span>
        </div>
        <div className="print-total-row">
          <span>Outras Despesas Acessórias:</span>
          <span>{formatCurrency(purchase.outrasDespesas)}</span>
        </div>
        {purchase.valorDesconto > 0 && (
          <div className="print-total-row">
            <span>Valor Total do Desconto:</span>
            <span>{formatCurrency(purchase.valorDesconto)}</span>
          </div>
        )}
        <div className="print-total-row highlight">
          <span>VALOR TOTAL DA NOTA:</span>
          <span>{formatCurrency(purchase.totalAPagar || 0)}</span>
        </div>
      </div>
    </PrintLayout>
  );
};

export default PurchasePrintView;
