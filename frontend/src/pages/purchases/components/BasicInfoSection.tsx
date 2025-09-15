import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  formatCode,
  formatSerie,
  formatModelo,
} from '../utils/validationUtils';
import type { Purchase } from '@/types/purchase';

interface BasicInfoSectionProps {
  data: Partial<Purchase>;
  onUpdate: (field: string, value: any) => void;
  suppliers: Array<{ id: number; nome: string; codigo?: string }>;
  paymentMethods: Array<{ id: number; nome: string }>;
  employees: Array<{ id: number; nome: string }>;
  isLoading?: boolean;
  errors?: Record<string, string>;
}

export function BasicInfoSection({
  data,
  onUpdate,
  suppliers,
  paymentMethods,
  employees,
  isLoading = false,
  errors = {},
}: BasicInfoSectionProps) {
  const handleInputChange = (field: string, value: string) => {
    onUpdate(field, value);
  };

  const handleDateChange = (field: string, value: string) => {
    onUpdate(field, value);
  };

  const handleSelectChange = (field: string, value: string) => {
    onUpdate(field, parseInt(value));
  };

  const handleCodeChange = (field: string, value: string) => {
    onUpdate(field, formatCode(value));
  };

  const handleSerieChange = (value: string) => {
    onUpdate('serie', formatSerie(value));
  };

  const handleModeloChange = (value: string) => {
    onUpdate('modelo', formatModelo(value));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primeira linha - Fornecedor e Datas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="fornecedor">Fornecedor *</Label>
            <div className="flex gap-2">
              <Select
                value={data.fornecedorId?.toString() || ''}
                onValueChange={(value) =>
                  handleSelectChange('fornecedorId', value)
                }
                disabled={isLoading}
              >
                <SelectTrigger
                  className={errors.fornecedorId ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Selecione o fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem
                      key={supplier.id}
                      value={supplier.id.toString()}
                    >
                      {supplier.codigo
                        ? `${supplier.codigo} - ${supplier.nome}`
                        : supplier.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" type="button">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            {errors.fornecedorId && (
              <p className="text-sm text-red-600 mt-1">{errors.fornecedorId}</p>
            )}
          </div>

          <div>
            <Label htmlFor="dataEmissao">Data de Emissão *</Label>
            <Input
              id="dataEmissao"
              type="date"
              value={data.dataEmissao || ''}
              onChange={(e) => handleDateChange('dataEmissao', e.target.value)}
              className={errors.dataEmissao ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.dataEmissao && (
              <p className="text-sm text-red-600 mt-1">{errors.dataEmissao}</p>
            )}
          </div>

          <div>
            <Label htmlFor="dataChegada">Data de Chegada *</Label>
            <Input
              id="dataChegada"
              type="date"
              value={data.dataChegada || ''}
              onChange={(e) => handleDateChange('dataChegada', e.target.value)}
              className={errors.dataChegada ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.dataChegada && (
              <p className="text-sm text-red-600 mt-1">{errors.dataChegada}</p>
            )}
          </div>
        </div>

        {/* Segunda linha - Nota Fiscal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="codigo">Código</Label>
            <Input
              id="codigo"
              value={data.codigo || ''}
              onChange={(e) => handleCodeChange('codigo', e.target.value)}
              placeholder="Código da nota"
              maxLength={50}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="serie">Série</Label>
            <Input
              id="serie"
              value={data.serie || ''}
              onChange={(e) => handleSerieChange(e.target.value)}
              placeholder="Série"
              maxLength={10}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="modelo">Modelo</Label>
            <Input
              id="modelo"
              value={data.modelo || ''}
              onChange={(e) => handleModeloChange(e.target.value)}
              placeholder="Modelo"
              maxLength={10}
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="codigoFornecedor">Código Fornecedor</Label>
            <Input
              id="codigoFornecedor"
              value={data.codigoFornecedor || ''}
              onChange={(e) =>
                handleCodeChange('codigoFornecedor', e.target.value)
              }
              placeholder="Código do fornecedor"
              maxLength={50}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Terceira linha - Condições */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="condicaoPagamento">Condição de Pagamento *</Label>
            <Select
              value={data.condicaoPagamentoId?.toString() || ''}
              onValueChange={(value) =>
                handleSelectChange('condicaoPagamentoId', value)
              }
              disabled={isLoading}
            >
              <SelectTrigger
                className={errors.condicaoPagamentoId ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Selecione a condição" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id.toString()}>
                    {method.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.condicaoPagamentoId && (
              <p className="text-sm text-red-600 mt-1">
                {errors.condicaoPagamentoId}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="funcionario">Funcionário Responsável *</Label>
            <Select
              value={data.funcionarioId?.toString() || ''}
              onValueChange={(value) =>
                handleSelectChange('funcionarioId', value)
              }
              disabled={isLoading}
            >
              <SelectTrigger
                className={errors.funcionarioId ? 'border-red-500' : ''}
              >
                <SelectValue placeholder="Selecione o funcionário" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id.toString()}>
                    {employee.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.funcionarioId && (
              <p className="text-sm text-red-600 mt-1">
                {errors.funcionarioId}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="tipoFrete">Tipo de Frete</Label>
            <Select
              value={data.tipoFrete || ''}
              onValueChange={(value) => handleInputChange('tipoFrete', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CIF">CIF - Por conta do vendedor</SelectItem>
                <SelectItem value="FOB">
                  FOB - Por conta do comprador
                </SelectItem>
                <SelectItem value="TERCEIROS">Terceiros</SelectItem>
                <SelectItem value="PROPRIO_REMETENTE">
                  Próprio por conta do remetente
                </SelectItem>
                <SelectItem value="PROPRIO_DESTINATARIO">
                  Próprio por conta do destinatário
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Observações */}
        <div>
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea
            id="observacoes"
            value={data.observacoes || ''}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            placeholder="Observações gerais sobre a compra"
            rows={3}
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
