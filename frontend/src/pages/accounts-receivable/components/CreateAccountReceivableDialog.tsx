import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DatePicker, stringToDate, dateToString } from '@/components/ui/date-picker';
import { Save, Loader2, Search, Hash, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, InputWithIcon } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { customerApi, paymentMethodApi, accountsReceivableApi } from '@/services/api';
import { toast } from '@/lib/toast';
import { SearchDialog } from '@/components/SearchDialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Customer } from '@/types/customer';
import { PaymentMethod } from '@/types/payment-method';

// Funções para formatar e desformatar moeda (trabalha em centavos)
const formatCurrency = (valueInCents: number): string => {
  const number = Number(valueInCents) / 100;
  if (isNaN(number)) return '0,00';
  return number.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const parseCurrency = (valueString: string | number): number => {
  if (typeof valueString !== 'string') {
    valueString = String(valueString || '0');
  }
  const digitsOnly = valueString.replace(/\D/g, '');
  return parseInt(digitsOnly, 10) || 0;
};

const formSchema = z.object({
  numeroDocumento: z.string().min(1, 'Número do documento é obrigatório'),
  tipoDocumento: z.enum(['FATURA', 'DUPLICATA', 'BOLETO', 'NOTA_FISCAL']).default('FATURA'),
  idCliente: z.string().min(1, 'Cliente é obrigatório'),
  dataEmissao: z.string().min(1, 'Data de emissão é obrigatória'),
  dataVencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  valorOriginal: z.string().min(1, 'Valor original é obrigatório'),
  valorDesconto: z.string().default('0,00'),
  valorJuros: z.string().default('0,00'),
  valorMulta: z.string().default('0,00'),
  idFormaPagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  vendaNumeroPedido: z.string().optional(),
  vendaModelo: z.string().optional(),
  vendaSerie: z.string().optional(),
  vendaClienteId: z.string().optional(),
  parcela: z.string().optional(),
  observacoes: z.string().optional(),
}).refine((data) => {
  const dataEmissao = new Date(data.dataEmissao);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  if (dataEmissao > hoje) {
    return false;
  }
  return true;
}, {
  message: 'Data de emissão não pode ser maior que a data atual',
  path: ['dataEmissao'],
}).refine((data) => {
  const dataEmissao = new Date(data.dataEmissao);
  const dataVencimento = new Date(data.dataVencimento);
  
  if (dataVencimento < dataEmissao) {
    return false;
  }
  return true;
}, {
  message: 'Data de vencimento não pode ser menor que a data de emissão',
  path: ['dataVencimento'],
});

type FormData = z.infer<typeof formSchema>;

interface CreateAccountReceivableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAccountReceivableDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAccountReceivableDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Estados para entidades selecionadas
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  // Estados para controle dos modais
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [paymentMethodSearchOpen, setPaymentMethodSearchOpen] = useState(false);

  // Listas de entidades
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numeroDocumento: '',
      tipoDocumento: 'FATURA',
      idCliente: '',
      dataEmissao: new Date().toISOString().split('T')[0],
      dataVencimento: new Date().toISOString().split('T')[0],
      valorOriginal: '0,00',
      valorDesconto: '0,00',
      valorJuros: '0,00',
      valorMulta: '0,00',
      idFormaPagamento: '',
      vendaNumeroPedido: '',
      vendaModelo: '',
      vendaSerie: '',
      vendaClienteId: '',
      parcela: '',
      observacoes: '',
    },
  });

  // Carrega listas de entidades
  useEffect(() => {
    const loadData = async () => {
      try {
        const [customersData, paymentMethodsData] = await Promise.all([
          customerApi.getAll(),
          paymentMethodApi.getAll(),
        ]);
        setCustomers(customersData);
        setPaymentMethods(paymentMethodsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };
    if (open) {
      loadData();
    }
  }, [open]);

  // Função para selecionar cliente
  const onSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    form.setValue('idCliente', customer.id.toString());
    setCustomerSearchOpen(false);
  };

  // Função para selecionar forma de pagamento
  const onSelectPaymentMethod = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    form.setValue('idFormaPagamento', paymentMethod.id.toString());
    setPaymentMethodSearchOpen(false);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const payload = {
        numeroDocumento: data.numeroDocumento,
        tipoDocumento: data.tipoDocumento,
        clienteId: parseInt(data.idCliente),
        dataEmissao: data.dataEmissao,
        dataVencimento: data.dataVencimento,
        valorOriginal: parseCurrency(data.valorOriginal) / 100,
        valorDesconto: parseCurrency(data.valorDesconto) / 100,
        valorJuros: parseCurrency(data.valorJuros) / 100,
        valorMulta: parseCurrency(data.valorMulta) / 100,
        formaPagamentoId: data.idFormaPagamento ? parseInt(data.idFormaPagamento) : undefined,
        vendaNumeroPedido: data.vendaNumeroPedido || undefined,
        vendaModelo: data.vendaModelo || undefined,
        vendaSerie: data.vendaSerie || undefined,
        vendaClienteId: data.vendaClienteId ? parseInt(data.vendaClienteId) : undefined,
        parcela: data.parcela || undefined,
        observacoes: data.observacoes || undefined,
      };

      await accountsReceivableApi.create(payload);
      toast.success('Conta a receber criada com sucesso!');
      
      form.reset();
      setSelectedCustomer(null);
      setSelectedPaymentMethod(null);
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    setSelectedCustomer(null);
    setSelectedPaymentMethod(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Conta a Receber</DialogTitle>
            <DialogDescription>
              Preencha as informações para registrar uma nova conta a receber
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados da Conta */}
              <div className="space-y-4">
                {/* Modelo, Série, Número e Cliente */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="vendaModelo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modelo</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isLoading}
                              placeholder="Ex: 55"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="vendaSerie"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Série</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isLoading}
                              placeholder="Ex: 001"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="numeroDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número *</FormLabel>
                          <FormControl>
                            <InputWithIcon
                              icon={<Hash className="h-4 w-4" />}
                              {...field}
                              disabled={isLoading}
                              placeholder="Ex: 12345"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="parcela"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parcela</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isLoading}
                              placeholder="1/3"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="idCliente"
                      render={() => (
                        <FormItem>
                          <FormLabel>Cód. Cliente *</FormLabel>
                          <FormControl>
                            <div className="flex gap-1">
                              <Input
                                value={selectedCustomer?.id || ''}
                                readOnly
                                disabled={isLoading}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setCustomerSearchOpen(true)}
                                disabled={isLoading}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <FormControl>
                        <Input
                          value={selectedCustomer?.razaoSocial || ''}
                          readOnly
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>

                {/* Tipo e Datas */}
                <div className="grid grid-cols-11 gap-4">
                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="tipoDocumento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FATURA">Fatura</SelectItem>
                              <SelectItem value="DUPLICATA">Duplicata</SelectItem>
                              <SelectItem value="BOLETO">Boleto</SelectItem>
                              <SelectItem value="NOTA_FISCAL">Nota Fiscal</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name="dataEmissao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Emissão *</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={stringToDate(field.value)}
                              onSelect={(date) => {
                                field.onChange(dateToString(date || new Date()));
                              }}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name="dataVencimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Vencimento *</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={stringToDate(field.value)}
                              onSelect={(date) => {
                                field.onChange(dateToString(date || new Date()));
                              }}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Valores */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="valorOriginal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Original *</FormLabel>
                          <FormControl>
                            <InputWithIcon
                              icon={<DollarSign className="h-4 w-4" />}
                              {...field}
                              placeholder="0,00"
                              disabled={isLoading}
                              onChange={(e) => {
                                const value = parseCurrency(e.target.value);
                                field.onChange(formatCurrency(value));
                              }}
                              className="text-right"
                            />
                          </FormControl>
                          <FormDescription>Digite apenas números</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="valorDesconto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desconto</FormLabel>
                          <FormControl>
                            <InputWithIcon
                              icon={<DollarSign className="h-4 w-4" />}
                              {...field}
                              placeholder="0,00"
                              disabled={isLoading}
                              onChange={(e) => {
                                const value = parseCurrency(e.target.value);
                                field.onChange(formatCurrency(value));
                              }}
                              className="text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="valorJuros"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Juros</FormLabel>
                          <FormControl>
                            <InputWithIcon
                              icon={<DollarSign className="h-4 w-4" />}
                              {...field}
                              placeholder="0,00"
                              disabled={isLoading}
                              onChange={(e) => {
                                const value = parseCurrency(e.target.value);
                                field.onChange(formatCurrency(value));
                              }}
                              className="text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name="valorMulta"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Multa</FormLabel>
                          <FormControl>
                            <InputWithIcon
                              icon={<DollarSign className="h-4 w-4" />}
                              {...field}
                              placeholder="0,00"
                              disabled={isLoading}
                              onChange={(e) => {
                                const value = parseCurrency(e.target.value);
                                field.onChange(formatCurrency(value));
                              }}
                              className="text-right"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name="idFormaPagamento"
                      render={() => (
                        <FormItem>
                          <FormLabel>Cód. Forma Pagto *</FormLabel>
                          <FormControl>
                            <div className="flex gap-1">
                              <Input
                                value={selectedPaymentMethod?.id || ''}
                                readOnly
                                disabled={isLoading}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setPaymentMethodSearchOpen(true)}
                                disabled={isLoading}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-10">
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <FormControl>
                        <Input
                          value={selectedPaymentMethod?.name || ''}
                          readOnly
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>

                {/* Observações */}
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Observações sobre a conta..."
                          disabled={isLoading}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Search Dialogs */}
      <SearchDialog
        open={customerSearchOpen}
        onOpenChange={setCustomerSearchOpen}
        title="Selecionar Cliente"
        description="Selecione o cliente da conta."
        entities={customers}
        onSelect={(item) => onSelectCustomer(item as Customer)}
        displayColumns={[
          { key: 'id', header: 'Código' },
          { key: 'razaoSocial', header: 'Razão Social' },
          { key: 'nomeFantasia', header: 'Nome Fantasia' },
          { key: 'cnpjCpf', header: 'CNPJ/CPF' },
        ]}
        searchKeys={['id', 'razaoSocial', 'nomeFantasia', 'cnpjCpf']}
        entityType="clientes"
      />

      <SearchDialog
        open={paymentMethodSearchOpen}
        onOpenChange={setPaymentMethodSearchOpen}
        title="Selecionar Forma de Pagamento"
        description="Selecione a forma de pagamento."
        entities={paymentMethods}
        onSelect={(item) => onSelectPaymentMethod(item as PaymentMethod)}
        displayColumns={[
          { key: 'id', header: 'Código' },
          { key: 'name', header: 'Descrição' },
        ]}
        searchKeys={['id', 'name']}
        entityType="formas-pagamento"
      />
    </>
  );
}
