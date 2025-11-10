import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DatePicker, stringToDate, dateToString } from '@/components/ui/date-picker';
import { ArrowLeft, Save, Loader2, Search, Hash, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, InputWithIcon } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supplierApi, paymentMethodApi, accountsPayableApi } from '@/services/api';
import { toast } from 'sonner';
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
import { Supplier } from '@/types/supplier';
import { PaymentMethod } from '@/types/payment-method';
import { AccountPayable } from '@/types/account-payable';
import AuditSection from '@/components/AuditSection';
import SupplierCreationDialog from '@/components/dialogs/SupplierCreationDialog';
import PaymentMethodCreationDialog from '@/components/dialogs/PaymentMethodCreationDialog';

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
  idFornecedor: z.string().min(1, 'Fornecedor é obrigatório'),
  dataEmissao: z.string().min(1, 'Data de emissão é obrigatória'),
  dataVencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  valorOriginal: z.string().min(1, 'Valor original é obrigatório'),
  valorDesconto: z.string().default('0,00'),
  valorJuros: z.string().default('0,00'),
  valorMulta: z.string().default('0,00'),
  idFormaPagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  compraNumeroPedido: z.string().optional(),
  compraModelo: z.string().optional(),
  compraSerie: z.string().optional(),
  compraFornecedorId: z.string().optional(),
  observacoes: z.string().optional(),
  ativo: z.boolean().default(true),
}).refine((data) => {
  // Validação: data de emissão não pode ser maior que a data atual
  const dataEmissao = new Date(data.dataEmissao);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas datas
  
  if (dataEmissao > hoje) {
    return false;
  }
  return true;
}, {
  message: 'Data de emissão não pode ser maior que a data atual',
  path: ['dataEmissao'],
}).refine((data) => {
  // Validação: data de vencimento não pode ser menor que a data de emissão
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

interface AccountsPayableFormProps {
  mode?: 'page' | 'dialog';
  accountId?: number;
  initialData?: Partial<AccountPayable>;
  onSuccess?: (account: AccountPayable) => void;
  onCancel?: () => void;
}

export function AccountsPayableForm({ 
  mode = 'page', 
  accountId,
  initialData,
  onSuccess,
  onCancel 
}: AccountsPayableFormProps) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const id = accountId || (paramId ? parseInt(paramId) : undefined);
  const isEditing = !!id;
  const [isLoading, setIsLoading] = useState(false);
  const [accountData, setAccountData] = useState<AccountPayable | null>(null);

  // Estados para entidades selecionadas
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);

  // Estados para controle dos modais
  const [supplierSearchOpen, setSupplierSearchOpen] = useState(false);
  const [paymentMethodSearchOpen, setPaymentMethodSearchOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);

  // Estados para edição
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [paymentMethodToEdit, setPaymentMethodToEdit] = useState<PaymentMethod | null>(null);

  // Listas de entidades
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numeroDocumento: '',
      tipoDocumento: 'FATURA',
      idFornecedor: '',
      dataEmissao: new Date().toISOString().split('T')[0],
      dataVencimento: new Date().toISOString().split('T')[0],
      valorOriginal: '0,00',
      valorDesconto: '0,00',
      valorJuros: '0,00',
      valorMulta: '0,00',
      idFormaPagamento: '',
      compraNumeroPedido: '',
      compraModelo: '',
      compraSerie: '',
      compraFornecedorId: '',
      observacoes: '',
      ativo: true,
    },
  });

  // Carrega dados da conta se estiver editando
  useEffect(() => {
    const loadAccount = async () => {
      if (!id && !initialData) return;

      try {
        setIsLoading(true);
        
        let data: AccountPayable;
        if (initialData) {
          data = initialData as AccountPayable;
        } else {
          data = await accountsPayableApi.getById(id!);
        }
        
        setAccountData(data);

        // Preenche o formulário
        form.reset({
          numeroDocumento: data.numeroDocumento,
          tipoDocumento: data.tipoDocumento as any,
          idFornecedor: data.fornecedorId?.toString() || '',
          dataEmissao: data.dataEmissao.split('T')[0],
          dataVencimento: data.dataVencimento.split('T')[0],
          valorOriginal: formatCurrency(Math.round(data.valorOriginal * 100)),
          valorDesconto: formatCurrency(Math.round((data.valorDesconto || 0) * 100)),
          valorJuros: formatCurrency(Math.round((data.valorJuros || 0) * 100)),
          valorMulta: formatCurrency(Math.round((data.valorMulta || 0) * 100)),
          idFormaPagamento: data.formaPagamentoId?.toString() || '',
          compraNumeroPedido: data.compraNumeroPedido || '',
          compraModelo: data.compraModelo || '',
          compraSerie: data.compraSerie || '',
          compraFornecedorId: data.compraFornecedorId?.toString() || '',
          observacoes: data.observacoes || '',
          ativo: data.ativo ?? true,
        });

        // Busca dados do fornecedor se existir
        if (data.fornecedorId) {
          const supplier = await supplierApi.getById(data.fornecedorId);
          setSelectedSupplier(supplier);
        }

        // Busca dados da forma de pagamento se existir
        if (data.formaPagamentoId) {
          const paymentMethod = await paymentMethodApi.getById(data.formaPagamentoId);
          setSelectedPaymentMethod(paymentMethod);
        }
      } catch (error) {
        console.error('Erro ao carregar conta:', error);
        toast.error('Erro ao carregar dados da conta');
      } finally {
        setIsLoading(false);
      }
    };

    loadAccount();
  }, [id, initialData]);

  // Carrega listas de entidades
  useEffect(() => {
    const loadData = async () => {
      try {
        const [suppliersData, paymentMethodsData] = await Promise.all([
          supplierApi.getAll(),
          paymentMethodApi.getAll(),
        ]);
        setSuppliers(suppliersData);
        setPaymentMethods(paymentMethodsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      }
    };
    loadData();
  }, []);

  // Função para selecionar fornecedor
  const onSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    form.setValue('idFornecedor', supplier.id.toString());
    setSupplierSearchOpen(false);
  };

  // Função para criar novo fornecedor
  const onCreateNewSupplier = () => {
    setSupplierToEdit(null);
    setSupplierDialogOpen(true);
  };

  // Função para editar fornecedor
  const handleEditSupplier = (supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setSupplierDialogOpen(true);
  };

  // Função chamada quando fornecedor é criado
  const handleSupplierCreated = (newSupplier: Supplier) => {
    setSuppliers((prev) => [...prev, newSupplier]);
    setSelectedSupplier(newSupplier);
    form.setValue('idFornecedor', newSupplier.id.toString());
    setSupplierDialogOpen(false);
    setSupplierSearchOpen(true);
    toast.success(`Fornecedor ${newSupplier.razaoSocial} criado com sucesso!`);
  };

  // Função chamada quando fornecedor é atualizado
  const handleSupplierUpdated = (updatedSupplier: Supplier) => {
    setSuppliers((prev) =>
      prev.map((supplier) =>
        supplier.id === updatedSupplier.id ? updatedSupplier : supplier,
      ),
    );

    if (selectedSupplier && selectedSupplier.id === updatedSupplier.id) {
      setSelectedSupplier(updatedSupplier);
    }

    setSupplierToEdit(null);
    setSupplierDialogOpen(false);
    setSupplierSearchOpen(true);
    toast.success(`Fornecedor ${updatedSupplier.razaoSocial} atualizado com sucesso!`);
  };

  // Função para selecionar forma de pagamento
  const onSelectPaymentMethod = (paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    form.setValue('idFormaPagamento', paymentMethod.id.toString());
    setPaymentMethodSearchOpen(false);
  };

  // Função para criar nova forma de pagamento
  const onCreateNewPaymentMethod = () => {
    setPaymentMethodToEdit(null);
    setPaymentMethodDialogOpen(true);
  };

  // Função para editar forma de pagamento
  const handleEditPaymentMethod = (paymentMethod: PaymentMethod) => {
    setPaymentMethodToEdit(paymentMethod);
    setPaymentMethodDialogOpen(true);
  };

  // Função chamada quando forma de pagamento é criada
  const handlePaymentMethodCreated = (newPaymentMethod: PaymentMethod) => {
    setPaymentMethods((prev) => [...prev, newPaymentMethod]);
    setSelectedPaymentMethod(newPaymentMethod);
    form.setValue('idFormaPagamento', newPaymentMethod.id.toString());
    setPaymentMethodDialogOpen(false);
    setPaymentMethodSearchOpen(true);
    toast.success(`Forma de pagamento ${newPaymentMethod.name} criada com sucesso!`);
  };

  // Função chamada quando forma de pagamento é atualizada
  const handlePaymentMethodUpdated = (updatedPaymentMethod: PaymentMethod) => {
    setPaymentMethods((prev) =>
      prev.map((pm) =>
        pm.id === updatedPaymentMethod.id ? updatedPaymentMethod : pm,
      ),
    );

    if (selectedPaymentMethod && selectedPaymentMethod.id === updatedPaymentMethod.id) {
      setSelectedPaymentMethod(updatedPaymentMethod);
    }

    setPaymentMethodToEdit(null);
    setPaymentMethodDialogOpen(false);
    setPaymentMethodSearchOpen(true);
    toast.success(`Forma de pagamento ${updatedPaymentMethod.name} atualizada com sucesso!`);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const payload = {
        numeroDocumento: data.numeroDocumento,
        tipoDocumento: data.tipoDocumento,
        fornecedorId: parseInt(data.idFornecedor),
        dataEmissao: data.dataEmissao,
        dataVencimento: data.dataVencimento,
        valorOriginal: parseCurrency(data.valorOriginal) / 100,
        valorDesconto: parseCurrency(data.valorDesconto) / 100,
        valorJuros: parseCurrency(data.valorJuros) / 100,
        valorMulta: parseCurrency(data.valorMulta) / 100,
        formaPagamentoId: data.idFormaPagamento ? parseInt(data.idFormaPagamento) : undefined,
        compraNumeroPedido: data.compraNumeroPedido || undefined,
        compraModelo: data.compraModelo || undefined,
        compraSerie: data.compraSerie || undefined,
        compraFornecedorId: data.compraFornecedorId ? parseInt(data.compraFornecedorId) : undefined,
        observacoes: data.observacoes || undefined,
      };

      let result: AccountPayable;
      if (isEditing) {
        result = await accountsPayableApi.update(id!, payload);
        toast.success('Conta atualizada com sucesso!');
      } else {
        result = await accountsPayableApi.create(payload);
        toast.success('Conta criada com sucesso!');
      }

      if (mode === 'dialog' && onSuccess) {
        onSuccess(result);
      } else {
        navigate('/accounts-payable');
      }
    } catch (error: any) {
      console.error('Erro ao salvar conta:', error);
      toast.error(error.response?.data?.message || 'Erro ao salvar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (mode === 'dialog' && onCancel) {
      onCancel();
    } else {
      navigate('/accounts-payable');
    }
  };

  const renderHeader = () => {
    if (mode === 'dialog') return null;

    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/accounts-payable">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isEditing ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? 'Edite as informações da conta abaixo'
                : 'Preencha as informações para registrar uma nova conta'}
            </p>
          </div>
        </div>

        {isEditing && accountData && (
          <AuditSection
            form={form}
            data={accountData}
            variant="header"
            isEditing={isEditing}
            statusFieldName="ativo"
          />
        )}
      </div>
    );
  };

  const renderActions = () => {
    return (
      <div className="flex justify-end gap-2 pt-4">
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
      </div>
    );
  };

  return (
    <div className={mode === 'dialog' ? '' : 'space-y-6'}>
      {renderHeader()}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados da Conta a Pagar */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Dados da Conta a Pagar
              </h3>
              <p className="text-sm text-muted-foreground">
                Preencha as informações da conta a pagar
              </p>
            </div>
            <div className="p-6 pt-0 space-y-4">
              {/* Número e Tipo */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="numeroDocumento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número do Documento *</FormLabel>
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

                <div className="col-span-6">
                  <FormField
                    control={form.control}
                    name="tipoDocumento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Documento *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
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
              </div>

              {/* Fornecedor */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="idFornecedor"
                    render={() => (
                      <FormItem>
                        <FormLabel>Cód. Fornecedor *</FormLabel>
                        <FormControl>
                          <div className="flex gap-1">
                            <Input
                              value={selectedSupplier?.id || ''}
                              readOnly
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setSupplierSearchOpen(true)}
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
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                      <Input
                        value={selectedSupplier?.razaoSocial || ''}
                        readOnly
                        disabled
                      />
                    </FormControl>
                  </FormItem>
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
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

                <div className="col-span-6">
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
          </div>

          {renderActions()}
        </form>
      </Form>

      {/* Search Dialogs */}
            <SearchDialog
        open={supplierSearchOpen}
        onOpenChange={setSupplierSearchOpen}
        title="Selecionar Fornecedor"
        description="Selecione o fornecedor da conta, crie um novo ou edite um existente."
        entities={suppliers}
        onSelect={(item) => onSelectSupplier(item as Supplier)}
        onCreateNew={onCreateNewSupplier}
        onEdit={(item) => handleEditSupplier(item as Supplier)}
        displayColumns={[
          { key: 'id', header: 'Código' },
          { key: 'razaoSocial', header: 'Razão Social' },
          { key: 'nomeFantasia', header: 'Nome Fantasia' },
          { key: 'cnpjCpf', header: 'CNPJ/CPF' },
        ]}
        searchKeys={['id', 'razaoSocial', 'nomeFantasia', 'cnpjCpf']}
        entityType="fornecedores"
      />

      <SearchDialog
        open={paymentMethodSearchOpen}
        onOpenChange={setPaymentMethodSearchOpen}
        title="Selecionar Forma de Pagamento"
        description="Selecione a forma de pagamento, crie uma nova ou edite uma existente."
        entities={paymentMethods}
        onSelect={(item) => onSelectPaymentMethod(item as PaymentMethod)}
        onCreateNew={onCreateNewPaymentMethod}
        onEdit={(item) => handleEditPaymentMethod(item as PaymentMethod)}
        displayColumns={[
          { key: 'id', header: 'Código' },
          { key: 'name', header: 'Descrição' },
        ]}
        searchKeys={['id', 'name']}
        entityType="formas-pagamento"
      />

      {/* Diálogo de criação/edição de fornecedor */}
      <SupplierCreationDialog
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
        onSuccess={
          supplierToEdit ? handleSupplierUpdated : handleSupplierCreated
        }
        supplier={supplierToEdit}
      />

      {/* Diálogo de criação/edição de forma de pagamento */}
      <PaymentMethodCreationDialog
        open={paymentMethodDialogOpen}
        onOpenChange={setPaymentMethodDialogOpen}
        onSuccess={
          paymentMethodToEdit ? handlePaymentMethodUpdated : handlePaymentMethodCreated
        }
        paymentMethod={paymentMethodToEdit}
      />
    </div>
  );
}

export default AccountsPayableForm;
