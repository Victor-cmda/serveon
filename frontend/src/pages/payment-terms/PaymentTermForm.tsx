import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Save, Plus, X, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paymentTermApi, paymentMethodApi } from '@/services/api';
import { PaymentMethod } from '@/types/payment-method';
import { CreatePaymentTermDto } from '@/types/payment-term';
import { toast } from 'sonner';
import { SearchDialog } from '@/components/SearchDialog';
import PaymentMethodCreationDialog from '@/components/dialogs/PaymentMethodCreationDialog';
import AuditSection from '@/components/AuditSection';

// Schema para validação das parcelas
const installmentSchema = z.object({
  installmentNumber: z.number().min(1, 'Número da parcela obrigatório'),
  paymentMethodId: z.number().min(1, 'Método de pagamento obrigatório'),
  daysToPayment: z
    .number()
    .min(0, 'Dias para pagamento deve ser maior ou igual a 0'),
  percentageValue: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .pipe(
      z
        .number()
        .min(0.01, 'Percentual obrigatório')
        .max(100, 'Percentual não pode ser maior que 100%'),
    ),
  ativo: z.boolean().default(true),
});

// Schema para validação do formulário principal
const formSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }).max(100),
  description: z.string().max(255).optional(),
  interestRate: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .pipe(z.number().min(0, 'Taxa de juros não pode ser negativa'))
    .default(0),
  fineRate: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .pipe(z.number().min(0, 'Taxa de multa não pode ser negativa'))
    .default(0),
  discountPercentage: z
    .union([z.number(), z.string()])
    .transform((val) => {
      if (typeof val === 'string') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? 0 : parsed;
      }
      return val;
    })
    .pipe(z.number().min(0, 'Percentual de desconto não pode ser negativo'))
    .default(0),
  ativo: z.boolean().default(true),
  installments: z
    .array(installmentSchema)
    .min(1, { message: 'Adicione pelo menos uma parcela' })
    .refine(
      (installments) => {
        const total = installments.reduce(
          (sum, installment) => sum + installment.percentageValue,
          0,
        );
        return Math.abs(total - 100) < 0.01;
      },
      { message: 'A soma dos percentuais das parcelas deve ser 100%' },
    ),
});

type FormValues = z.infer<typeof formSchema>;

const PaymentTermForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(id ? true : false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [paymentMethodSearchOpen, setPaymentMethodSearchOpen] = useState<
    number | null
  >(null);
  const [paymentMethodToEdit, setPaymentMethodToEdit] =
    useState<PaymentMethod | null>(null);
  const [paymentTermData, setPaymentTermData] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      interestRate: 0,
      fineRate: 0,
      discountPercentage: 0,
      ativo: true,
      installments: [
        {
          installmentNumber: 1,
          paymentMethodId: 0,
          daysToPayment: 0,
          percentageValue: 100,
          ativo: true,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'installments',
  });

  useEffect(() => {
    fetchPaymentMethods();
    if (id) {
      fetchPaymentTerm(id);
    }
  }, [id]);

  const fetchPaymentMethods = async () => {
    try {
      const methods = await paymentMethodApi.getAll();
      setPaymentMethods(methods.filter((method) => method.ativo));
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os métodos de pagamento.',
      });
    }
  };

  const fetchPaymentTerm = async (paymentTermId: string) => {
    setIsLoadingData(true);
    try {
      const data = await paymentTermApi.getById(Number(paymentTermId));
      setPaymentTermData(data);

      // Ordenar parcelas por número
      const sortedInstallments = [...data.installments].sort(
        (a, b) => a.installmentNumber - b.installmentNumber,
      );

      form.reset({
        name: data.name,
        description: data.description || '',
        interestRate: typeof data.interestRate === 'string'
          ? parseFloat(data.interestRate)
          : data.interestRate || 0,
        fineRate: typeof data.fineRate === 'string'
          ? parseFloat(data.fineRate)
          : data.fineRate || 0,
        discountPercentage: typeof data.discountPercentage === 'string'
          ? parseFloat(data.discountPercentage)
          : data.discountPercentage || 0,
        ativo: data.ativo,
        installments: sortedInstallments.map((inst) => ({
          installmentNumber: inst.installmentNumber,
          paymentMethodId: inst.paymentMethodId,
          daysToPayment: inst.daysToPayment,
          percentageValue:
            typeof inst.percentageValue === 'string'
              ? parseFloat(inst.percentageValue)
              : inst.percentageValue,
          ativo: inst.ativo,
        })),
      });
    } catch (error) {
      console.error('Erro ao buscar condição de pagamento:', error);
      toast.error('Erro', {
        description:
          'Não foi possível carregar os dados da condição de pagamento.',
      });
      navigate('/payment-terms');
    } finally {
      setIsLoadingData(false);
    }
  };

  const addInstallment = () => {
    const lastInstallment = form.getValues('installments').slice(-1)[0];
    const nextNumber = lastInstallment
      ? lastInstallment.installmentNumber + 1
      : 1;
    append({
      installmentNumber: nextNumber,
      paymentMethodId: 0,
      daysToPayment: lastInstallment ? lastInstallment.daysToPayment + 30 : 30,
      percentageValue: 0,
      ativo: true,
    });
  };

  // Função para distribuir percentuais automaticamente de forma igual
  const distributeEqualPercentages = () => {
    const installments = form.getValues('installments');
    const activeInstallments = installments.filter(inst => inst.ativo);
    
    if (activeInstallments.length === 0) return;
    
    const equalPercentage = parseFloat((100 / activeInstallments.length).toFixed(2));
    let remainingPercentage = 100;
    
    installments.forEach((installment, index) => {
      if (!installment.ativo) {
        form.setValue(`installments.${index}.percentageValue`, 0);
        return;
      }
      
      // Para a última parcela ativa, usar o percentual restante para evitar problemas de arredondamento
      const isLastActive = index === installments.map((inst, idx) => inst.ativo ? idx : -1).filter(idx => idx !== -1).slice(-1)[0];
      const percentage = isLastActive ? remainingPercentage : equalPercentage;
      
      form.setValue(`installments.${index}.percentageValue`, percentage);
      remainingPercentage -= percentage;
    });
    
    // Trigger validation
    form.trigger('installments');
  };

  // Função para distribuir percentuais com base em pesos personalizados
  const distributeWeightedPercentages = () => {
    const installments = form.getValues('installments');
    const activeInstallments = installments.filter(inst => inst.ativo);
    
    if (activeInstallments.length === 0) return;
    
    // Peso decrescente: primeira parcela maior, demais menores
    const weights = activeInstallments.map((_, index) => {
      if (index === 0) return 50; // Primeira parcela: 50%
      return 50 / (activeInstallments.length - 1); // Demais parcelas dividem os 50% restantes
    });
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let remainingPercentage = 100;
    let activeIndex = 0;
    
    installments.forEach((installment, index) => {
      if (!installment.ativo) {
        form.setValue(`installments.${index}.percentageValue`, 0);
        return;
      }
      
      // Para a última parcela ativa, usar o percentual restante
      const isLastActive = activeIndex === activeInstallments.length - 1;
      const percentage = isLastActive 
        ? remainingPercentage 
        : parseFloat(((weights[activeIndex] / totalWeight) * 100).toFixed(2));
      
      form.setValue(`installments.${index}.percentageValue`, percentage);
      remainingPercentage -= percentage;
      activeIndex++;
    });
    
    // Trigger validation
    form.trigger('installments');
  };

  // Função para zerar todos os percentuais
  const clearAllPercentages = () => {
    const installments = form.getValues('installments');
    installments.forEach((_, index) => {
      form.setValue(`installments.${index}.percentageValue`, 0);
    });
    form.trigger('installments');
  };

  // Função para calcular o total dos percentuais
  const calculateTotalPercentage = () => {
    const installments = form.watch('installments') || [];
    return installments
      .filter(inst => inst.ativo)
      .reduce((total, inst) => {
        const value = typeof inst.percentageValue === 'string' 
          ? parseFloat(inst.percentageValue) || 0 
          : inst.percentageValue || 0;
        return total + value;
      }, 0);
  };

  // Hook para monitorar mudanças nos percentuais
  const totalPercentage = calculateTotalPercentage();

  // Função para ajustar automaticamente pequenas diferenças de arredondamento
  const adjustPercentages = () => {
    const installments = form.getValues('installments');
    const activeInstallments = installments.filter(inst => inst.ativo);
    
    if (activeInstallments.length === 0) return;
    
    const currentTotal = calculateTotalPercentage();
    const difference = 100 - currentTotal;
    
    // Se a diferença for muito pequena (≤ 0.1%), ajustar a última parcela ativa
    if (Math.abs(difference) <= 0.1 && Math.abs(difference) > 0.01) {
      // Encontrar o índice da última parcela ativa
      let lastActiveIndex = -1;
      installments.forEach((inst, index) => {
        if (inst.ativo) lastActiveIndex = index;
      });
      
      if (lastActiveIndex !== -1) {
        const currentValue = installments[lastActiveIndex].percentageValue;
        const newValue = parseFloat((currentValue + difference).toFixed(2));
        form.setValue(`installments.${lastActiveIndex}.percentageValue`, newValue);
        form.trigger('installments');
      }
    }
  };

  // Função para aplicar template de condição à vista
  const applyTemplateAVista = () => {
    // Limpar parcelas existentes e criar uma parcela única
    while (fields.length > 1) {
      remove(fields.length - 1);
    }
    
    // Configurar a parcela única
    form.setValue('installments.0.installmentNumber', 1);
    form.setValue('installments.0.daysToPayment', 0);
    form.setValue('installments.0.percentageValue', 100);
    form.setValue('installments.0.ativo', true);
    
    // Configurar taxas típicas para à vista
    form.setValue('interestRate', 0);
    form.setValue('fineRate', 0);
    form.setValue('discountPercentage', 3); // 3% de desconto para à vista
    
    form.trigger();
  };

  // Função para aplicar template 30/60 dias
  const applyTemplate30_60 = () => {
    // Limpar parcelas existentes
    while (fields.length > 0) {
      remove(0);
    }
    
    // Adicionar duas parcelas
    append({
      installmentNumber: 1,
      paymentMethodId: 0,
      daysToPayment: 30,
      percentageValue: 50,
      ativo: true,
    });
    
    append({
      installmentNumber: 2,
      paymentMethodId: 0,
      daysToPayment: 60,
      percentageValue: 50,
      ativo: true,
    });
    
    // Configurar taxas típicas para 30/60
    form.setValue('interestRate', 2);
    form.setValue('fineRate', 2);
    form.setValue('discountPercentage', 0);
    
    form.trigger();
  };

  // Função para aplicar template entrada + 2 parcelas
  const applyTemplateEntrada2x = () => {
    // Limpar parcelas existentes
    while (fields.length > 0) {
      remove(0);
    }
    
    // Adicionar três parcelas (entrada + 2x)
    append({
      installmentNumber: 1,
      paymentMethodId: 0,
      daysToPayment: 0, // Entrada
      percentageValue: 40,
      ativo: true,
    });
    
    append({
      installmentNumber: 2,
      paymentMethodId: 0,
      daysToPayment: 30,
      percentageValue: 30,
      ativo: true,
    });
    
    append({
      installmentNumber: 3,
      paymentMethodId: 0,
      daysToPayment: 60,
      percentageValue: 30,
      ativo: true,
    });
    
    // Configurar taxas típicas
    form.setValue('interestRate', 1.5);
    form.setValue('fineRate', 2);
    form.setValue('discountPercentage', 0);
    
    form.trigger();
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const paymentTermData: CreatePaymentTermDto = {
        name: values.name,
        description: values.description,
        interestRate: values.interestRate,
        fineRate: values.fineRate,
        discountPercentage: values.discountPercentage,
        ativo: values.ativo,
        installments: values.installments.map((inst) => ({
          installmentNumber: inst.installmentNumber,
          paymentMethodId: inst.paymentMethodId,
          daysToPayment: inst.daysToPayment,
          percentageValue:
            typeof inst.percentageValue === 'string'
              ? parseFloat(inst.percentageValue)
              : inst.percentageValue,
          ativo: inst.ativo,
        })),
      }; 
      // Verifica se existe algum método de pagamento não selecionado
      const hasInvalidPaymentMethod = paymentTermData.installments.some(
        (inst) => !inst.paymentMethodId || inst.paymentMethodId <= 0,
      );

      if (hasInvalidPaymentMethod) {
        toast.error('Erro', {
          description:
            'Selecione um método de pagamento válido para todas as parcelas.',
        });
        setIsLoading(false);
        return;
      }
      if (id) {
        await paymentTermApi.update(Number(id), paymentTermData);
        toast.success('Sucesso', {
          description: 'Condição de pagamento atualizada com sucesso!',
        });
      } else {
        await paymentTermApi.create(paymentTermData);
        toast.success('Sucesso', {
          description: 'Condição de pagamento criada com sucesso!',
        });
      }

      // Check if we need to return to a parent form in a cascading scenario
      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate('/payment-terms');
      }
    } catch (error: unknown) {
      console.error('Erro ao salvar condição de pagamento:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao salvar a condição de pagamento.';
      toast.error('Erro', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentMethodCreated = (newPaymentMethod: PaymentMethod) => {
    setPaymentMethods((prev) => [...prev, newPaymentMethod]);

    // Se houver um índice de parcela ativo, atualize o método de pagamento para essa parcela
    if (paymentMethodSearchOpen !== null) {
      form.setValue(
        `installments.${paymentMethodSearchOpen}.paymentMethodId`,
        newPaymentMethod.id,
      );
    }

  };

  const handlePaymentMethodUpdated = (updatedPaymentMethod: PaymentMethod) => {
    // Atualiza o método de pagamento na lista
    setPaymentMethods((prev) =>
      prev.map((method) =>
        method.id === updatedPaymentMethod.id ? updatedPaymentMethod : method,
      ),
    );
    setPaymentMethodToEdit(null);
  };

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethodToEdit(method);
    setPaymentMethodDialogOpen(true);
  };

  const openPaymentMethodSearch = (index: number) => {
    setPaymentMethodSearchOpen(index);
  };

  if (isLoadingData) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/payment-terms">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {id
                ? 'Editar Condição de Pagamento'
                : 'Nova Condição de Pagamento'}
            </h1>
            <p className="text-muted-foreground">
              {id
                ? 'Edite as informações da condição de pagamento abaixo'
                : 'Preencha as informações para criar uma nova condição de pagamento'}
            </p>
          </div>
        </div>

        {/* AuditSection no header */}
        <AuditSection
          form={form}
          data={paymentTermData}
          variant="header"
          isEditing={!!id}
          statusFieldName="ativo" // Campo de status é 'ativo' para PaymentTerm
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Dados Gerais
                </h3>
                <p className="text-sm text-muted-foreground">
                  Informações básicas da condição de pagamento
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  {id && (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input value={id} disabled className="bg-muted" />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        Código único da condição de pagamento
                      </p>
                    </FormItem>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome da condição de pagamento"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <textarea
                            className="w-full min-h-[100px] px-3 py-2 text-sm border border-input rounded-md bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Descrição da condição de pagamento"
                            {...field}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="interestRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa de Juros (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (
                                  value === '' ||
                                  value === null ||
                                  value === undefined
                                ) {
                                  field.onChange(0);
                                } else {
                                  const parsed = parseFloat(value);
                                  field.onChange(isNaN(parsed) ? 0 : parsed);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fineRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa de Multa (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (
                                  value === '' ||
                                  value === null ||
                                  value === undefined
                                ) {
                                  field.onChange(0);
                                } else {
                                  const parsed = parseFloat(value);
                                  field.onChange(isNaN(parsed) ? 0 : parsed);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discountPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Desconto (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (
                                  value === '' ||
                                  value === null ||
                                  value === undefined
                                ) {
                                  field.onChange(0);
                                } else {
                                  const parsed = parseFloat(value);
                                  field.onChange(isNaN(parsed) ? 0 : parsed);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Parcelas
                </h3>
                <Button
                  type="button"
                  onClick={addInstallment}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Parcela
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure as parcelas da condição de pagamento
              </p>
              
              {/* Botões para cálculo automático */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Cálculo Automático
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={distributeEqualPercentages}
                      variant="secondary"
                      size="sm"
                      title="Distribui 100% igualmente entre todas as parcelas ativas"
                    >
                      Distribuir Igualmente
                    </Button>
                    <Button
                      type="button"
                      onClick={distributeWeightedPercentages}
                      variant="secondary"
                      size="sm"
                      title="Primeira parcela recebe 50%, demais dividem os 50% restantes"
                    >
                      Entrada + Parcelas
                    </Button>
                    <Button
                      type="button"
                      onClick={adjustPercentages}
                      variant="secondary"
                      size="sm"
                      title="Ajusta automaticamente pequenas diferenças de arredondamento"
                      disabled={Math.abs(totalPercentage - 100) > 0.1}
                    >
                      Ajustar
                    </Button>
                    <Button
                      type="button"
                      onClick={clearAllPercentages}
                      variant="outline"
                      size="sm"
                      title="Zera todos os percentuais das parcelas"
                    >
                      Zerar Tudo
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Templates Prontos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={applyTemplateAVista}
                      variant="outline"
                      size="sm"
                      title="À vista com 3% de desconto"
                    >
                      À Vista
                    </Button>
                    <Button
                      type="button"
                      onClick={applyTemplate30_60}
                      variant="outline"
                      size="sm"
                      title="2x (30 e 60 dias) com 2% de juros"
                    >
                      30/60 Dias
                    </Button>
                    <Button
                      type="button"
                      onClick={applyTemplateEntrada2x}
                      variant="outline"
                      size="sm"
                      title="Entrada (40%) + 2 parcelas (30% cada)"
                    >
                      Entrada + 2x
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Indicador do total de percentuais */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium">Total dos Percentuais:</span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${
                    Math.abs(totalPercentage - 100) < 0.01 
                      ? 'text-green-600' 
                      : totalPercentage > 100 
                        ? 'text-red-600' 
                        : 'text-orange-600'
                  }`}>
                    {totalPercentage.toFixed(2)}%
                  </span>
                  {Math.abs(totalPercentage - 100) < 0.01 ? (
                    <span className="text-green-600 text-xs">✓ Correto</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {totalPercentage > 100 
                        ? `Excesso: +${(totalPercentage - 100).toFixed(2)}%` 
                        : `Falta: ${(100 - totalPercentage).toFixed(2)}%`
                      }
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 pt-0">
              {form.formState.errors.installments?.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.installments.root.message}
                </p>
              )}

              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="text-lg">
                        Parcela {index + 1}
                      </CardTitle>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`installments.${index}.installmentNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número da Parcela</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`installments.${index}.paymentMethodId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Método de Pagamento</FormLabel>
                            <div className="flex gap-2">
                              <div className="w-full flex-1">
                                <Input
                                  value={
                                    paymentMethods.find(
                                      (m) => m.id === field.value,
                                    )?.description || ''
                                  }
                                  readOnly
                                  placeholder="Selecione um método de pagamento"
                                  className="cursor-pointer h-11 text-base"
                                  onClick={() => openPaymentMethodSearch(index)}
                                />
                                <input type="hidden" {...field} />
                              </div>
                              <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                onClick={() => openPaymentMethodSearch(index)}
                                disabled={isLoading}
                                className="h-11 w-11"
                              >
                                <Search className="h-5 w-5" />
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`installments.${index}.daysToPayment`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dias para Pagamento</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value) || 0)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`installments.${index}.percentageValue`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Percentual do Valor (%)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                min={0.01}
                                max={100}
                                {...field}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (
                                    value === '' ||
                                    value === null ||
                                    value === undefined
                                  ) {
                                    field.onChange(0);
                                  } else {
                                    const parsed = parseFloat(value);
                                    field.onChange(isNaN(parsed) ? 0 : parsed);
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`installments.${index}.ativo`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) =>
                                  field.onChange(e.target.checked)
                                }
                                className="h-4 w-4 text-primary border border-gray-300 rounded focus:ring-primary"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Ativa</FormLabel>
                              <FormDescription>
                                Indica se a parcela está ativa
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link to="/payment-terms">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {id ? 'Atualizar' : 'Salvar'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>

      {/* Diálogos */}
      <PaymentMethodCreationDialog
        open={paymentMethodDialogOpen}
        onOpenChange={setPaymentMethodDialogOpen}
        onSuccess={
          paymentMethodToEdit
            ? handlePaymentMethodUpdated
            : handlePaymentMethodCreated
        }
        paymentMethod={paymentMethodToEdit}
      />

      {paymentMethodSearchOpen !== null && (
        <SearchDialog
          open={paymentMethodSearchOpen !== null}
          onOpenChange={(open) => {
            if (!open) setPaymentMethodSearchOpen(null);
          }}
          title="Selecionar Método de Pagamento"
          description="Selecione um método de pagamento para associar à parcela, edite um existente ou cadastre um novo."
          entities={paymentMethods}
          isLoading={isLoading}
          onSelect={(method) => {
            if (paymentMethodSearchOpen !== null) {
              form.setValue(
                `installments.${paymentMethodSearchOpen}.paymentMethodId`,
                method.id,
              );
              setPaymentMethodSearchOpen(null);
            }
          }}
          onCreateNew={() => {
            setPaymentMethodSearchOpen(paymentMethodSearchOpen);
            setPaymentMethodDialogOpen(true);
          }}
          onEdit={handleEditPaymentMethod}
          displayColumns={[
            { key: 'description', header: 'Descrição' },
            { key: 'code', header: 'Código' },
            { key: 'type', header: 'Tipo' },
          ]}
          searchKeys={['description', 'code', 'type']}
          entityType="metodos-pagamento"
        />
      )}
    </div>
  );
};

export default PaymentTermForm;
