import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
import { CreatePaymentMethodDto, UpdatePaymentMethodDto } from '@/types/payment-method';
import AuditSection from '@/components/AuditSection';

// Schema para validação do formulário
const formSchema = z.object({
  description: z.string().min(1, { message: 'A descrição é obrigatória' }).max(100),
  code: z.string().max(20).optional(),
  type: z.string().max(30).optional(),
  ativo: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

const PaymentMethodForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(id ? true : false);
  const [paymentMethodData, setPaymentMethodData] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      code: '',
      type: '',
      ativo: true,
    },
  });

  const fetchPaymentMethod = useCallback(async (paymentMethodId: string) => {
    setIsLoadingData(true);
    try {
      const data = await paymentMethodApi.getById(Number(paymentMethodId));
      setPaymentMethodData(data);
      form.reset({
        description: data.description,
        code: data.code || '',
        type: data.type || '',
        ativo: data.ativo,
      });
    } catch (error) {
      console.error('Erro ao buscar método de pagamento:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os dados do método de pagamento.',
      });
      navigate('/payment-methods');
    } finally {
      setIsLoadingData(false);
    }
  }, [form, navigate]);

  useEffect(() => {
    if (id) {
      fetchPaymentMethod(id);
    }
  }, [id, fetchPaymentMethod]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const paymentMethodData: CreatePaymentMethodDto | UpdatePaymentMethodDto = {
        description: values.description,
        ativo: values.ativo
      };
      
      // Somente incluir código e tipo se não estiverem vazios
      if (values.code && values.code.trim() !== '') {
        paymentMethodData.code = values.code;
      }
      
      if (values.type && values.type.trim() !== '') {
        paymentMethodData.type = values.type;
      }      if (id) {
        await paymentMethodApi.update(Number(id), paymentMethodData);
        toast.success('Sucesso', {
          description: 'Método de pagamento atualizado com sucesso!',
        });
      } else {
        await paymentMethodApi.create(paymentMethodData as CreatePaymentMethodDto);
        toast.success('Sucesso', {
          description: 'Método de pagamento criado com sucesso!',
        });
      }
      
      // Check if we need to return to a parent form in a cascading scenario
      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate('/payment-methods');
      }
    } catch (error: unknown) {
      console.error('Erro ao salvar método de pagamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao salvar o método de pagamento.';
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
                  {id && (
                    <FormItem>
                      <FormLabel>ID</FormLabel>
                      <FormControl>
                        <Input value={id} disabled className="bg-muted" />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        ID único do método de pagamento
                      </p>
                    </FormItem>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do método de pagamento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input placeholder="Código identificador" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
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

          <div className="flex justify-end space-x-4">
            <Link to="/payment-methods">
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
    </div>
  );
};

export default PaymentMethodForm;