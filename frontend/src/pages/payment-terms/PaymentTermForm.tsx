import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Save, Plus, X } from 'lucide-react';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { paymentTermApi, paymentMethodApi } from '@/services/api';
import { PaymentMethod } from '@/types/payment-method';
import { CreatePaymentTermDto } from '@/types/payment-term';
import { toast } from 'sonner';

// Schema para validação das parcelas
const installmentSchema = z.object({
  installmentNumber: z.number().min(1, 'Número da parcela obrigatório'),
  paymentMethodId: z.number().min(1, 'Método de pagamento obrigatório'),
  daysToPayment: z
    .number()
    .min(0, 'Dias para pagamento deve ser maior ou igual a 0'),
  percentageValue: z
    .number()
    .min(0.01, 'Percentual obrigatório')
    .max(100, 'Percentual não pode ser maior que 100%'),
  interestRate: z
    .number()
    .min(0, 'Taxa de juros não pode ser negativa')
    .default(0),
  isActive: z.boolean().default(true),
});

// Schema para validação do formulário principal
const formSchema = z.object({
  name: z.string().min(1, { message: 'O nome é obrigatório' }).max(100),
  description: z.string().max(255).optional(),
  isActive: z.boolean().default(true),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      installments: [
        {
          installmentNumber: 1,
          paymentMethodId: 0,
          daysToPayment: 0,
          percentageValue: 100,
          interestRate: 0,
          isActive: true,
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
      fetchPaymentTerm(parseInt(id));
    }
  }, [id]);

  const fetchPaymentMethods = async () => {
    try {
      const methods = await paymentMethodApi.getAll();
      setPaymentMethods(methods.filter((method) => method.active));
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os métodos de pagamento.',
      });
    }
  };

  const fetchPaymentTerm = async (paymentTermId: number) => {
    setIsLoadingData(true);
    try {
      const data = await paymentTermApi.getById(paymentTermId);

      // Ordenar parcelas por número
      const sortedInstallments = [...data.installments].sort(
        (a, b) => a.installmentNumber - b.installmentNumber,
      );

      form.reset({
        name: data.name,
        description: data.description || '',
        isActive: data.isActive,
        installments: sortedInstallments.map((inst) => ({
          installmentNumber: inst.installmentNumber,
          paymentMethodId: inst.paymentMethodId,
          daysToPayment: inst.daysToPayment,
          percentageValue: inst.percentageValue,
          interestRate: inst.interestRate,
          isActive: inst.isActive,
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
      interestRate: 0,
      isActive: true,
    });
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const paymentTermData: CreatePaymentTermDto = {
        name: values.name,
        description: values.description,
        isActive: values.isActive,
        installments: values.installments.map((inst) => ({
          installmentNumber: inst.installmentNumber,
          paymentMethodId: inst.paymentMethodId,
          daysToPayment: inst.daysToPayment,
          percentageValue: inst.percentageValue,
          interestRate: inst.interestRate,
          isActive: inst.isActive,
        })),
      };

      if (id) {
        await paymentTermApi.update(parseInt(id), paymentTermData);
        toast.success('Sucesso', {
          description: 'Condição de pagamento atualizada com sucesso!',
        });
      } else {
        await paymentTermApi.create(paymentTermData);
        toast.success('Sucesso', {
          description: 'Condição de pagamento criada com sucesso!',
        });
      }
      navigate('/payment-terms');
    } catch (error: any) {
      console.error('Erro ao salvar condição de pagamento:', error);
      toast.error('Erro', {
        description:
          error.message || 'Ocorreu um erro ao salvar a condição de pagamento.',
      });
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/payment-terms')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {id ? 'Editar' : 'Nova'} Condição de Pagamento
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 30/60/90 dias" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nome da condição de pagamento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Ativa</FormLabel>
                    <FormDescription>
                      Indica se a condição de pagamento está disponível para uso
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descrição detalhada da condição de pagamento"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  Detalhes adicionais sobre esta condição de pagamento
                  (opcional)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Parcelas</h2>
              <Button type="button" onClick={addInstallment} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Parcela
              </Button>
            </div>

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
                          <Select
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                            value={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um método" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentMethods.map((method) => (
                                <SelectItem key={method.id} value={method.id}>
                                  {method.description}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`installments.${index}.interestRate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa de Juros (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`installments.${index}.isActive`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
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

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/payment-terms')}
              type="button"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PaymentTermForm;
