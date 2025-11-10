import { useEffect, useState } from 'react';
import PrintLayout from './PrintLayout';
import { AccountPayable } from '@/types/account-payable';
import { accountsPayableApi } from '@/services/api';

interface AccountPayablePrintViewProps {
  accountId: number;
  onClose?: () => void;
}

const AccountPayablePrintView = ({
  accountId,
  onClose,
}: AccountPayablePrintViewProps) => {
  const [account, setAccount] = useState<AccountPayable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccount = async () => {
      try {
        const data = await accountsPayableApi.getById(accountId);
        setAccount(data);
      } catch (error) {
        console.error('Erro ao carregar conta a pagar:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [accountId]);

  useEffect(() => {
    // Auto print quando os dados estiverem carregados
    if (account && !loading) {
      setTimeout(() => {
        window.print();
        if (onClose) {
          onClose();
        }
      }, 500);
    }
  }, [account, loading, onClose]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg">Carregando dados da conta a pagar...</p>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Conta a pagar não encontrada</p>
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
      ABERTO: 'Em Aberto',
      PAGO: 'Pago',
      PARCIAL: 'Pago Parcialmente',
      VENCIDO: 'Vencido',
      CANCELADO: 'Cancelado',
    };
    return labels[status] || status;
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

  const isVencido =
    account.status !== 'PAGO' &&
    account.status !== 'CANCELADO' &&
    new Date(account.dataVencimento) < new Date();

  return (
    <PrintLayout
      title="Boleto/Comprovante"
      documentType={getTipoDocumentoLabel(account.tipoDocumento)}
      documentNumber={account.numeroDocumento}
    >
      {/* Cedente / Fornecedor */}
      <div className="print-section">
        <div className="print-section-header">Cedente / Beneficiário</div>
        <div className="print-section-content">
          <div className="info-grid">
            <div className="info-item" style={{ gridColumn: 'span 2' }}>
              <span className="info-label">Nome / Razão Social</span>
              <span className="info-value">{account.fornecedorNome}</span>
            </div>
            <div className="info-item">
              <span className="info-label">CNPJ/CPF</span>
              <span className="info-value">{account.fornecedorCnpjCpf || 'Não informado'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Código</span>
              <span className="info-value">#{account.fornecedorId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dados do Documento */}
      <div className="print-section">
        <div className="print-section-header">Dados do Documento</div>
        <div className="print-section-content">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Número do Documento</span>
              <span className="info-value font-bold">{account.numeroDocumento}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tipo de Documento</span>
              <span className="info-value">{getTipoDocumentoLabel(account.tipoDocumento)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Data de Emissão</span>
              <span className="info-value">{formatDate(account.dataEmissao)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Data de Vencimento</span>
              <span className="info-value font-bold" style={{ color: isVencido ? '#dc2626' : '#000' }}>
                {formatDate(account.dataVencimento)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className={`status-badge status-${account.status.toLowerCase()}`}>
                {getStatusLabel(account.status)}
              </span>
            </div>
            {account.dataPagamento && (
              <div className="info-item">
                <span className="info-label">Data de Pagamento</span>
                <span className="info-value">{formatDate(account.dataPagamento)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Valores do Documento */}
      <div className="print-section">
        <div className="print-section-header">Discriminação dos Valores</div>
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: '60%' }}>Descrição</th>
              <th style={{ width: '40%' }} className="text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-bold">Valor Original do Documento</td>
              <td className="text-right font-bold">{formatCurrency(account.valorOriginal)}</td>
            </tr>
            {account.valorDesconto > 0 && (
              <tr>
                <td>(-) Desconto Concedido</td>
                <td className="text-right" style={{ color: '#10b981' }}>
                  - {formatCurrency(account.valorDesconto)}
                </td>
              </tr>
            )}
            {account.valorJuros > 0 && (
              <tr>
                <td>(+) Juros de Mora</td>
                <td className="text-right" style={{ color: '#ef4444' }}>
                  + {formatCurrency(account.valorJuros)}
                </td>
              </tr>
            )}
            {account.valorMulta > 0 && (
              <tr>
                <td>(+) Multa por Atraso</td>
                <td className="text-right" style={{ color: '#ef4444' }}>
                  + {formatCurrency(account.valorMulta)}
                </td>
              </tr>
            )}
            {account.status !== 'ABERTO' && (
              <tr>
                <td>(-) Valor Já Pago</td>
                <td className="text-right" style={{ color: '#10b981' }}>
                  - {formatCurrency(account.valorPago)}
                </td>
              </tr>
            )}
            <tr style={{ background: '#f0f0f0', fontWeight: 'bold' }}>
              <td className="font-bold">SALDO A PAGAR</td>
              <td className="text-right font-bold" style={{ 
                fontSize: '9pt',
                color: account.valorSaldo > 0 ? '#ef4444' : '#10b981' 
              }}>
                {formatCurrency(account.valorSaldo)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Referência da Compra */}
      {(account.compraNumeroPedido || account.compraModelo || account.compraSerie) && (
        <div className="print-section">
          <div className="print-section-header">Referência da Compra</div>
          <div className="print-section-content">
            <div className="info-grid">
              {account.compraNumeroPedido && (
                <div className="info-item">
                  <span className="info-label">Nº Pedido</span>
                  <span className="info-value">{account.compraNumeroPedido}</span>
                </div>
              )}
              {account.compraModelo && account.compraSerie && (
                <div className="info-item">
                  <span className="info-label">Modelo/Série</span>
                  <span className="info-value">{account.compraModelo}/{account.compraSerie}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instruções / Observações */}
      <div className="print-section">
        <div className="print-section-header">Instruções / Mensagens</div>
        <div className="print-section-content">
          <div style={{ fontSize: '7pt', minHeight: '15mm', lineHeight: '1.4' }}>
            {isVencido && (
              <div style={{ 
                color: '#dc2626', 
                fontWeight: 'bold', 
                marginBottom: '2mm',
                padding: '1mm',
                background: '#fee2e2',
                border: '1px solid #dc2626'
              }}>
                ⚠️ DOCUMENTO VENCIDO - Sujeito a juros e multa conforme contrato
              </div>
            )}
            {account.observacoes || 'Pagar preferencialmente até a data de vencimento.'}
            <br /><br />
            Após o vencimento, cobrar multa de 2% e juros de mora de 1% ao mês.
            {account.formaPagamentoNome && (
              <>
                <br />
                <strong>Forma de Pagamento:</strong> {account.formaPagamentoNome}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Informações de Pagamento */}
      {account.status === 'PAGO' && (
        <div className="print-section">
          <div className="print-section-header">Comprovante de Pagamento</div>
          <div className="print-section-content">
            <div className="info-grid">
              {account.dataPagamento && (
                <div className="info-item">
                  <span className="info-label">Data do Pagamento</span>
                  <span className="info-value">{formatDate(account.dataPagamento)}</span>
                </div>
              )}
              <div className="info-item">
                <span className="info-label">Valor Pago</span>
                <span className="info-value font-bold">{formatCurrency(account.valorPago)}</span>
              </div>
              {account.pagoPorNome && (
                <div className="info-item">
                  <span className="info-label">Responsável</span>
                  <span className="info-value">{account.pagoPorNome}</span>
                </div>
              )}
              {account.formaPagamentoNome && (
                <div className="info-item">
                  <span className="info-label">Forma de Pagamento</span>
                  <span className="info-value">{account.formaPagamentoNome}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resumo Final */}
      <div className="print-totals">
        <div className="print-total-row">
          <span>Valor Original:</span>
          <span>{formatCurrency(account.valorOriginal)}</span>
        </div>
        {account.valorDesconto > 0 && (
          <div className="print-total-row">
            <span>(-) Desconto:</span>
            <span style={{ color: '#10b981' }}>- {formatCurrency(account.valorDesconto)}</span>
          </div>
        )}
        {account.valorJuros > 0 && (
          <div className="print-total-row">
            <span>(+) Juros:</span>
            <span style={{ color: '#ef4444' }}>+ {formatCurrency(account.valorJuros)}</span>
          </div>
        )}
        {account.valorMulta > 0 && (
          <div className="print-total-row">
            <span>(+) Multa:</span>
            <span style={{ color: '#ef4444' }}>+ {formatCurrency(account.valorMulta)}</span>
          </div>
        )}
        {account.status !== 'ABERTO' && (
          <div className="print-total-row">
            <span>(-) Valor Pago:</span>
            <span style={{ color: '#10b981' }}>- {formatCurrency(account.valorPago)}</span>
          </div>
        )}
        <div className="print-total-row highlight">
          <span>SALDO {account.status === 'PAGO' ? 'QUITADO' : 'A PAGAR'}:</span>
          <span style={{ color: account.valorSaldo > 0 ? '#ef4444' : '#10b981' }}>
            {formatCurrency(account.valorSaldo)}
          </span>
        </div>
      </div>
    </PrintLayout>
  );
};

export default AccountPayablePrintView;
