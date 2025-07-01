import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { countryApi } from '@/services/api';
import { toast } from 'sonner';
import AuditSection from '@/components/AuditSection';

const formSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome do país é obrigatório e deve ter pelo menos 2 caracteres'),
  sigla: z
    .string()
    .length(2, 'Sigla deve ter exatamente 2 caracteres')
    .toUpperCase(),
  codigo: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(3, 'Código deve ter no máximo 3 caracteres')
    .regex(/^[0-9]+$/, 'Código deve conter apenas números'),
  ativo: z.boolean().default(true),
});

const CountryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [countryData, setCountryData] = useState<any>(null);
  const location = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      sigla: '',
      codigo: '',
      ativo: true,
    },
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const fetchCountry = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const country = await countryApi.getById(Number(id));
        setCountryData(country);
        form.reset({
          nome: country.nome,
          sigla: country.sigla,
          codigo: country.codigo,
          ativo: country.ativo,
        });
      } catch (error) {
        console.error('Erro ao buscar país:', error);
        toast.error('Erro', {
          description: 'Não foi possível carregar os dados do país.',
        });
        navigate('/countries');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountry();
  }, [id, navigate, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      let createdOrUpdatedId: string;

      // Format the data to handle empty strings
      const formattedData = {
        nome: data.nome.trim(),
        sigla: data.sigla.trim(),
        codigo: data.codigo.trim(),
        ativo: data.ativo
      };

      if (id) {
        await countryApi.update(Number(id), formattedData);
        toast.success('Sucesso', {
          description: 'País atualizado com sucesso!',
        });
        createdOrUpdatedId = id;
      } else {
        const createdCountry = await countryApi.create(formattedData);
        toast.success('Sucesso', {
          description: 'País criado com sucesso!',
        });
        createdOrUpdatedId = String(createdCountry.id);
      }

      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        const returnWithParams = `${returnUrl}?createdEntity=country&createdId=${createdOrUpdatedId}`;
        navigate(returnWithParams);
      } else {
        navigate('/countries');
      }
    } catch (error: unknown) {
      console.error('Erro ao salvar país:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao salvar o país.';
      toast.error('Erro', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/countries">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {id ? 'Editar País' : 'Novo País'}
            </h1>
            <p className="text-muted-foreground">
              {id
                ? 'Edite as informações do país abaixo'
                : 'Preencha as informações para criar um novo país'}
            </p>
          </div>
        </div>
        
        {/* AuditSection no header */}
        <AuditSection 
          form={form} 
          data={countryData}
          variant="header" 
          isEditing={!!id}
          statusFieldName="ativo" // Campo de status é 'ativo' para Country
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
                  Informações básicas do país
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormItem>
                      <FormLabel>ID</FormLabel>
                      <FormControl>
                        <Input value={id || 'Novo'} disabled className="bg-muted" />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        {id ? 'ID' : 'Automático'}
                      </p>
                    </FormItem>
                    
                    <div className="md:col-span-3">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do País *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nome do país"
                                {...field}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="sigla"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sigla *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: BR"
                              {...field}
                              maxLength={2}
                              onChange={(e) =>
                                field.onChange(e.target.value.toUpperCase())
                              }
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="codigo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: 55"
                              {...field}
                              maxLength={3}
                              disabled={isLoading}
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

          <div className="flex justify-end space-x-4">
            <Link to="/countries">
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

export default CountryForm;
