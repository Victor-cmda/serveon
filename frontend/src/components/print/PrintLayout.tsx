import React, { useEffect, useState } from 'react';
import { companySettingsApi } from '@/services/api';
import { CompanySettings } from '@/types/company-settings';

interface PrintLayoutProps {
  children: React.ReactNode;
  title: string;
  documentNumber?: string;
  documentType?: string;
}

const PrintLayout = ({
  children,
  title,
  documentNumber,
  documentType,
}: PrintLayoutProps) => {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanySettings = async () => {
      try {
        const data = await companySettingsApi.get();
        setCompanySettings(data);
      } catch (error) {
        console.error('Erro ao carregar configurações da empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanySettings();
  }, []);

  // Formata o endereço completo
  const getFullAddress = () => {
    if (!companySettings) return '';
    const parts = [];
    if (companySettings.endereco) parts.push(companySettings.endereco);
    if (companySettings.numero) parts.push(`nº ${companySettings.numero}`);
    if (companySettings.complemento) parts.push(companySettings.complemento);
    if (companySettings.bairro) parts.push(companySettings.bairro);
    if (companySettings.cidade) parts.push(companySettings.cidade);
    if (companySettings.estado) parts.push(companySettings.estado);
    if (companySettings.cep) parts.push(`CEP: ${companySettings.cep}`);
    return parts.join(' - ');
  };

  // Formata os contatos
  const getContactInfo = () => {
    if (!companySettings) return '';
    const parts = [];
    if (companySettings.cnpj) parts.push(`CNPJ: ${companySettings.cnpj}`);
    if (companySettings.inscricaoEstadual) parts.push(`IE: ${companySettings.inscricaoEstadual}`);
    return parts.join(' | ');
  };

  const getSecondaryContact = () => {
    if (!companySettings) return '';
    const parts = [];
    if (companySettings.telefone) parts.push(`Tel: ${companySettings.telefone}`);
    if (companySettings.email) parts.push(companySettings.email);
    return parts.join(' | ');
  };

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 5mm;
            }
            
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
              margin: 0;
              padding: 0;
            }
            
            .no-print {
              display: none !important;
            }
            
            .print-page-break {
              page-break-after: always;
            }
            
            .print-avoid-break {
              page-break-inside: avoid;
            }
          }
          
          @media screen {
            .print-container {
              max-width: 210mm;
              min-height: 297mm;
              margin: 10px auto;
              background: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          .print-container {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 8pt;
            line-height: 1.2;
            color: #000;
            padding: 3mm;
          }
          
          /* Cabeçalho DANFE */
          .danfe-header {
            display: grid;
            grid-template-columns: 80px 1fr 140px;
            border: 1px solid #000;
            margin-bottom: 2mm;
          }
          
          .danfe-logo {
            border-right: 1px solid #000;
            padding: 3mm;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          
          .danfe-logo img {
            max-width: 100%;
            max-height: 60px;
            object-fit: contain;
          }
          
          .danfe-emitente {
            border-right: 1px solid #000;
            padding: 2mm 3mm;
          }
          
          .danfe-emitente-nome {
            font-size: 10pt;
            font-weight: bold;
            margin-bottom: 1mm;
          }
          
          .danfe-emitente-info {
            font-size: 7pt;
            line-height: 1.3;
          }
          
          .danfe-nf {
            padding: 2mm;
            text-align: center;
          }
          
          .danfe-nf-title {
            font-size: 9pt;
            font-weight: bold;
            margin-bottom: 2mm;
          }
          
          .danfe-nf-number {
            font-size: 11pt;
            font-weight: bold;
            margin: 2mm 0;
          }
          
          .danfe-nf-serie {
            font-size: 8pt;
            margin-bottom: 1mm;
          }
          
          /* Seções */
          .print-section {
            border: 1px solid #000;
            margin-bottom: 2mm;
            page-break-inside: avoid;
          }
          
          .print-section-header {
            background: #f0f0f0;
            padding: 1mm 2mm;
            border-bottom: 1px solid #000;
            font-weight: bold;
            font-size: 7pt;
            text-transform: uppercase;
          }
          
          .print-section-content {
            padding: 2mm;
          }
          
          /* Grid de Informações */
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 2mm;
          }
          
          .info-item {
            display: flex;
            flex-direction: column;
          }
          
          .info-label {
            font-size: 6pt;
            color: #666;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 0.5mm;
          }
          
          .info-value {
            font-size: 8pt;
            color: #000;
            font-weight: normal;
          }
          
          /* Tabelas */
          .print-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7pt;
          }
          
          .print-table th {
            background: #f0f0f0;
            font-weight: bold;
            text-align: left;
            padding: 1.5mm 2mm;
            border: 1px solid #000;
            font-size: 6pt;
            text-transform: uppercase;
          }
          
          .print-table td {
            padding: 1mm 2mm;
            border: 1px solid #000;
            font-size: 7pt;
          }
          
          /* Totalizadores */
          .print-totals {
            border: 1px solid #000;
            margin-top: 2mm;
          }
          
          .print-total-row {
            display: flex;
            justify-content: space-between;
            padding: 1.5mm 2mm;
            font-size: 8pt;
            border-bottom: 1px solid #e0e0e0;
          }
          
          .print-total-row:last-child {
            border-bottom: none;
          }
          
          .print-total-row.highlight {
            background: #f0f0f0;
            font-size: 9pt;
            font-weight: bold;
            border-top: 2px solid #000;
          }
          
          /* Observações */
          .print-obs {
            border: 1px solid #000;
            padding: 2mm;
            margin-top: 2mm;
            min-height: 15mm;
            font-size: 7pt;
          }
          
          .print-obs-title {
            font-weight: bold;
            font-size: 7pt;
            margin-bottom: 1mm;
            text-transform: uppercase;
          }
          
          /* Rodapé */
          .print-footer {
            margin-top: 3mm;
            padding-top: 2mm;
            border-top: 1px solid #000;
            font-size: 6pt;
            color: #666;
            text-align: center;
          }
          
          /* Utilitários */
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .font-bold {
            font-weight: bold;
          }
          
          .border-box {
            border: 1px solid #000;
            padding: 2mm;
          }
          
          /* Status Badge */
          .status-badge {
            display: inline-block;
            padding: 1mm 3mm;
            border-radius: 2mm;
            font-size: 7pt;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .status-aprovado { background: #d1fae5; color: #065f46; }
          .status-pendente { background: #fef3c7; color: #92400e; }
          .status-cancelado { background: #fee2e2; color: #991b1b; }
          .status-pago { background: #d1fae5; color: #065f46; }
          .status-vencido { background: #fee2e2; color: #991b1b; }
          .status-aberto { background: #fef3c7; color: #92400e; }
        `}
      </style>

      <div className="print-container">
        {/* Cabeçalho DANFE */}
        <div className="danfe-header">
          <div className="danfe-logo">
            {companySettings?.logoBase64 ? (
              <img src={companySettings.logoBase64} alt="Logo" />
            ) : (
              <div style={{ fontWeight: 'bold', fontSize: '14pt', color: '#999' }}>LOGO</div>
            )}
          </div>
          
          <div className="danfe-emitente">
            <div className="danfe-emitente-nome">
              {companySettings?.razaoSocial || companySettings?.nomeFantasia || 'ServeOn Ltda'}
            </div>
            <div className="danfe-emitente-info">
              {getFullAddress() || 'Rua Exemplo, 123 - Centro - São Paulo/SP - CEP: 01000-000'}
              <br />
              {getContactInfo() || 'CNPJ: 00.000.000/0001-00 | IE: 000.000.000.000'}
              <br />
              {getSecondaryContact() || 'Tel: (11) 1234-5678 | contato@serveon.com.br'}
            </div>
          </div>
          
          <div className="danfe-nf">
            <div className="danfe-nf-title">{documentType || title}</div>
            {documentNumber && (
              <>
                <div className="danfe-nf-number">Nº {documentNumber}</div>
                <div className="danfe-nf-serie">SÉRIE 1</div>
              </>
            )}
          </div>
        </div>

        {/* Conteúdo */}
        {children}

        {/* Rodapé */}
        <div className="print-footer">
          Documento gerado eletronicamente em {new Date().toLocaleString('pt-BR')} - ServeOn Sistema de Gestão
        </div>
      </div>
    </>
  );
};

export default PrintLayout;
