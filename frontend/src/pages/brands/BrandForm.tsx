import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { brandApi } from '../../services/api';
import { toast } from 'sonner';
import { Form } from '../../components/ui/form';

// Componente modular
import BrandGeneralSection from './components/BrandGeneralSection';

const formSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(2, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

const BrandForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      ativo: true,
    },
  });

  useEffect(() => {
    const fetchBrand = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const brand = await brandApi.getById(Number(id));
        form.reset({
          id: brand.id || 0,
          nome: brand.nome || '',
          descricao: brand.descricao || '',
          ativo: brand.ativo !== false,
        });
      } catch (error) {
        console.error('Erro ao carregar marca:', error);
        toast.error('Não foi possível carregar os dados da marca');
        navigate('/brands');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrand();
  }, [id, form, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const brandData = {
        ...data,
        descricao: data.descricao || undefined,
      };

      if (id) {
        await brandApi.update(Number(id), brandData);
        toast.success('Marca atualizada com sucesso!');
      } else {
        await brandApi.create(brandData);
        toast.success('Marca criada com sucesso!');
      }

      navigate('/brands');
    } catch (error: unknown) {
      console.error('Erro ao salvar marca:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as any)?.response?.data?.message || 'Erro ao salvar marca. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">        <div className="flex items-center space-x-4">
          <Link to="/brands">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {id ? 'Editar Marca' : 'Nova Marca'}
            </h1>
            <p className="text-muted-foreground">
              {id
                ? 'Edite as informações da marca abaixo'
                : 'Preencha as informações para criar uma nova marca'}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6">
            {/* Seção de Dados Gerais */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Dados Gerais
                </h3>
                <p className="text-sm text-muted-foreground">
                  Informações básicas da marca
                </p>
              </div>
              <div className="p-6 pt-0">
                <BrandGeneralSection
                  form={form}
                  isLoading={isLoading}
                  id={id}
                />
              </div>
            </div>
          </div>          <div className="flex justify-end space-x-4">
            <Link to="/brands">
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

export default BrandForm;
