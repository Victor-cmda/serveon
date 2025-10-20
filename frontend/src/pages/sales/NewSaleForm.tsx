import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { SearchDialog } from '@/components/SearchDialog';
import { salesApi, customerApi, paymentTermApi, employeeApi } from '@/services/api';
import { Customer } from '@/types/customer';
import { PaymentTerm } from '@/types/payment-term';
import { Employee } from '@/types/employee';
import { CreateSaleDto } from '@/types/sale';

export default function NewSaleForm() {
  const navigate = useNavigate();

  // Estados principais
  const [clienteId, setClienteId] = useState<number>(0);
  const [condicaoPagamentoId, setCondicaoPagamentoId] = useState<number>(0);
  const [funcionarioId, setFuncionarioId] = useState<number>(1);
  const [dataVenda, setDataVenda] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dataVencimento, setDataVencimento] = useState<string>('');
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [valorDesconto, setValorDesconto] = useState<number>(0);
  const [status, setStatus] = useState<string>('ORCAMENTO');
  const [transportadoraId, setTransportadoraId] = useState<number>(0);
  const [observacoes, setObservacoes] = useState<string>('');

  // Estados de dados carregados
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Estados de seleção
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<PaymentTerm | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Estados de dialogs
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [paymentTermSearchOpen, setPaymentTermSearchOpen] = useState(false);
  const [employeeSearchOpen, setEmployeeSearchOpen] = useState(false);

  // Estados de loading
  const [isLoading, setIsLoading] = useState(false);

  // Carrega dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [customersData, paymentTermsData, employeesData] = await Promise.all([
          customerApi.getAll(),
          paymentTermApi.getAll(),
          employeeApi.getAll(),
        ]);
        
        setCustomers(customersData);
        setPaymentTerms(paymentTermsData);
        setEmployees(employeesData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados necessários');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handlers para seleção de entidades
  const onSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setClienteId(customer.id);
    setCustomerSearchOpen(false);
  };

  const onSelectPaymentTerm = (paymentTerm: PaymentTerm) => {
    setSelectedPaymentTerm(paymentTerm);
    setCondicaoPagamentoId(paymentTerm.id);
    setPaymentTermSearchOpen(false);
  };

  const onSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFuncionarioId(employee.id);
    setEmployeeSearchOpen(false);
  };

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clienteId || !dataVenda || !valorTotal) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validação: desconto não pode ser maior que o valor total
    if (valorDesconto > valorTotal) {
      toast.error('O desconto não pode ser maior que o valor total da venda');
      return;
    }

    try {
      const saleData: CreateSaleDto = {
        clienteId,
        condicaoPagamentoId,
        funcionarioId,
        dataVenda: new Date(dataVenda),
        dataVencimento: new Date(dataVencimento),
        valorTotal,
        valorDesconto,
        status: status as any,
        transportadoraId: transportadoraId || undefined,
        observacoes: observacoes || undefined,
      };

      await salesApi.create(saleData);
      toast.success('Venda criada com sucesso!');
      navigate('/sales');
    } catch (error) {
      console.error('Erro ao criar venda:', error);
      toast.error('Erro ao criar venda');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Nova Venda</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate('/sales')}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar</Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cabeçalho da Venda */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              {/* Linha 1 */}
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente *</Label>
                <div className="flex space-x-2">
                  <Input
                    value={selectedCustomer ? selectedCustomer.razaoSocial : ''}
                    placeholder="Selecione um cliente..."
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomerSearchOpen(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataVenda">Data da Venda *</Label>
                <Input
                  id="dataVenda"
                  type="date"
                  value={dataVenda}
                  onChange={(e) => setDataVenda(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                <Input
                  id="dataVencimento"
                  type="date"
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condicaoPagamento">Condição Pagamento</Label>
                <div className="flex space-x-2">
                  <Input
                    value={selectedPaymentTerm ? selectedPaymentTerm.name : ''}
                    placeholder="Selecione uma condição..."
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentTermSearchOpen(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="funcionario">Vendedor</Label>
                <div className="flex space-x-2">
                  <Input
                    value={selectedEmployee ? selectedEmployee.nome : ''}
                    placeholder="Selecione um vendedor..."
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEmployeeSearchOpen(true)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="ORCAMENTO">Orçamento</option>
                  <option value="CONFIRMADA">Confirmada</option>
                  <option value="CANCELADA">Cancelada</option>
                  <option value="ENTREGUE">Entregue</option>
                  <option value="FATURADA">Faturada</option>
                </select>
              </div>

              {/* Linha 2 - Valores */}
              <div className="space-y-2">
                <Label htmlFor="valorTotal">Valor Total *</Label>
                <Input
                  id="valorTotal"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorDesconto">Valor Desconto</Label>
                <Input
                  id="valorDesconto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorDesconto}
                  onChange={(e) => setValorDesconto(parseFloat(e.target.value) || 0)}
                  className={
                    valorDesconto > valorTotal
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : ''
                  }
                />
                {valorDesconto > valorTotal && (
                  <p className="text-xs text-red-500 mt-1">
                    Desconto não pode ser maior que o valor total
                  </p>
                )}
              </div>

              <div className="col-span-4 space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações sobre a venda..."
                  className="min-h-[60px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Dialogs de Busca */}
      <SearchDialog
        isOpen={customerSearchOpen}
        onClose={() => setCustomerSearchOpen(false)}
        title="Selecionar Cliente"
        data={customers}
        onSelect={onSelectCustomer}
        displayField={(customer: Customer) => customer.razaoSocial}
        searchFields={['razaoSocial', 'nomeFantasia', 'cpfCnpj']}
      />

      <SearchDialog
        isOpen={paymentTermSearchOpen}
        onClose={() => setPaymentTermSearchOpen(false)}
        title="Selecionar Condição de Pagamento"
        data={paymentTerms}
        onSelect={onSelectPaymentTerm}
        displayField={(term: PaymentTerm) => term.name}
        searchFields={['name', 'description']}
      />

      <SearchDialog
        isOpen={employeeSearchOpen}
        onClose={() => setEmployeeSearchOpen(false)}
        title="Selecionar Vendedor"
        data={employees}
        onSelect={onSelectEmployee}
        displayField={(employee: Employee) => employee.nome}
        searchFields={['nome', 'email']}
      />
    </div>
  );
}