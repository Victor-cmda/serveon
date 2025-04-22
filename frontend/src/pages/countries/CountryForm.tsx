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
import { CreateCountryDto, UpdateCountryDto } from '@/types/location';
import { toast } from 'sonner';

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
});

const CountryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      sigla: '',
      codigo: '',
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
        const country = await countryApi.getById(id);
        form.reset({
          nome: country.nome,
          sigla: country.sigla,
          codigo: country.codigo,
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
  }, [id, navigate, toast, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      let createdOrUpdatedId: string;

      // Format the data to handle empty strings
      const formattedData = {
        nome: data.nome.trim(),
        sigla: data.sigla.trim(),
        codigo: data.codigo.trim()
      };

      if (id) {
        await countryApi.update(id, formattedData);
        toast.success('Sucesso', {
          description: 'País atualizado com sucesso!',
        });
        createdOrUpdatedId = id;
      } else {
        const createdCountry = await countryApi.create(formattedData);
        toast.success('Sucesso', {
          description: 'País criado com sucesso!',
        });
        createdOrUpdatedId = createdCountry.id;
      }

      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        const returnWithParams = `${returnUrl}?createdEntity=country&createdId=${createdOrUpdatedId}`;
        navigate(returnWithParams);
      } else {
        navigate('/countries');
      }
    } catch (error: any) {
      console.error('Erro ao salvar país:', error);
      toast.error('Erro', {
        description: error.message || 'Ocorreu um erro ao salvar o país.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {id ? 'Editar País' : 'Novo País'}
        </h1>
        <Button variant="outline" asChild>
          <Link to="/countries">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="rounded-md border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Nome do País
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Brasil"
                      {...field}
                      disabled={isLoading}
                      className="h-11 text-base"
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="sigla"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Sigla (2 caracteres)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: BR"
                        {...field}
                        maxLength={2}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        disabled={isLoading}
                        className="h-11 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Código
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 55"
                        {...field}
                        maxLength={3}
                        disabled={isLoading}
                        className="h-11 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-6 text-base"
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                <Save className="mr-2 h-5 w-5" /> Salvar
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CountryForm;
