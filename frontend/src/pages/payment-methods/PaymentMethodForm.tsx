import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { paymentMethodApi } from '@/services/api';
import { toast } from 'sonner';
import {
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto,
  PaymentMethod,
} from '@/types/payment-method';
import AuditSection from '@/components/AuditSection';

// Schema para validação do formulário
const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'O nome é obrigatório' })
    .max(100),
  type: z
    .string()
    .min(1, { message: 'O tipo é obrigatório' })
    .max(30),
  ativo: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentMethodFormProps {
  mode?: 'page' | 'dialog';
  paymentMethodId?: number;
  initialData?: Partial<PaymentMethod>;
  onSuccess?: (paymentMethod: PaymentMethod) => void;
  onCancel?: () => void;
}

const PaymentMethodForm = ({
  mode = 'page',
  paymentMethodId,
  initialData,
  onSuccess,
  onCancel
}: PaymentMethodFormProps) => {
  const { id: paramId } = useParams();
  const id = mode === 'dialog' ? paymentMethodId : paramId ? Number(paramId) : undefined;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(id ? true : false);
  const [paymentMethodData, setPaymentMethodData] = useState<any>(null);
  const location = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      type: '',
      ativo: true,
    },
  });

  const fetchPaymentMethod = useCallback(
    async (paymentMethodId: number) => {
      setIsLoadingData(true);
      try {
        const data = await paymentMethodApi.getById(paymentMethodId);
        setPaymentMethodData(data);
        form.reset({
          name: data.name,
          type: data.type || '',
          ativo: data.ativo,
        });
      } catch (error) {
        console.error('Erro ao buscar método de pagamento:', error);
        toast.error('Erro', {
          description:
            'Não foi possível carregar os dados do método de pagamento.',
        });
        if (mode === 'page') {
          navigate('/payment-methods');
        }
      } finally {
        setIsLoadingData(false);
      }
    },
    [form, navigate, mode],
  );

  useEffect(() => {
    if (id) {
      fetchPaymentMethod(id);
    } else if (mode === 'dialog') {
      // Limpa o formulário quando abre o dialog para criação
      form.reset({
        name: initialData?.name || '',
        type: initialData?.type || '',
        ativo: initialData?.ativo ?? true,
      });
    }
  }, [id, fetchPaymentMethod, mode, initialData, form]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      let savedPaymentMethod: PaymentMethod;
      
      const paymentMethodData: CreatePaymentMethodDto | UpdatePaymentMethodDto =
        {
          name: values.name,
          type: values.type,
          ativo: values.ativo,
        };
      
      if (id) {
        savedPaymentMethod = await paymentMethodApi.update(id, paymentMethodData);
        toast.success('Sucesso', {
          description: 'Método de pagamento atualizado com sucesso!',
        });
      } else {
        savedPaymentMethod = await paymentMethodApi.create(
          paymentMethodData as CreatePaymentMethodDto,
        );
        toast.success('Sucesso', {
          description: 'Método de pagamento criado com sucesso!',
        });
      }

      // Se está em modo dialog, chama o callback de sucesso
      if (mode === 'dialog' && onSuccess) {
        onSuccess(savedPaymentMethod);
        return;
      }

      // Modo page: navega conforme returnUrl ou vai para lista
      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate('/payment-methods');
      }
    } catch (error: unknown) {
      console.error('Erro ao salvar método de pagamento:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao salvar o método de pagamento.';
      toast.error('Erro', {
        description: errorMessage,
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
      {mode === 'page' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/payment-methods">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {id ? 'Editar Método de Pagamento' : 'Novo Método de Pagamento'}
              </h1>
              <p className="text-muted-foreground">
                {id
                  ? 'Edite as informações do método de pagamento abaixo'
                  : 'Preencha as informações para criar um novo método de pagamento'}
              </p>
            </div>
          </div>

          {/* AuditSection no header */}
          <AuditSection
            form={form}
            data={paymentMethodData}
            variant="header"
            isEditing={!!id}
            statusFieldName="ativo" // Campo de status é 'ativo' para PaymentMethod
          />
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Dados Gerais
                </h3>
                <p className="text-sm text-muted-foreground">
                  Informações básicas do método de pagamento
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input
                          value={id || 'Novo'}
                          disabled
                          className="bg-muted"
                        />
                      </FormControl>
                    </FormItem>

                    <div className="md:col-span-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Forma de Pagamento *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nome da forma de pagamento"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Tipo do método" {...field} />
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
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                if (mode === 'dialog' && onCancel) {
                  onCancel();
                } else {
                  navigate('/payment-methods');
                }
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {id ? 'Atualizar' : 'Salvar'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PaymentMethodForm;
