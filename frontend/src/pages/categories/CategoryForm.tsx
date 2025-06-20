import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { categoryApi } from '../../services/api';
import { toast } from 'sonner';
import { Form } from '../../components/ui/form';

// Componente modular
import CategoryGeneralSection from './components/CategoryGeneralSection';

const formSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(2, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  ativo: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

const CategoryForm = () => {
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
    const fetchCategory = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const category = await categoryApi.getById(Number(id));
        form.reset({
          id: category.id || 0,
          nome: category.nome || '',
          descricao: category.descricao || '',
          ativo: category.ativo !== false,
        });
      } catch (error) {
        console.error('Erro ao carregar categoria:', error);
        toast.error('Não foi possível carregar os dados da categoria');
        navigate('/categories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [id, form, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const categoryData = {
        ...data,
        descricao: data.descricao || undefined,
      };

      if (id) {
        await categoryApi.update(Number(id), categoryData);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await categoryApi.create(categoryData);
        toast.success('Categoria criada com sucesso!');
      }

      navigate('/categories');
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      toast.error(
        error?.response?.data?.message ||
          'Erro ao salvar categoria. Tente novamente.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">        <div className="flex items-center space-x-4">
          <Link to="/categories">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {id ? 'Editar Categoria' : 'Nova Categoria'}
            </h1>
            <p className="text-muted-foreground">
              {id
                ? 'Edite as informações da categoria abaixo'
                : 'Preencha as informações para criar uma nova categoria'}
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
                  Informações básicas da categoria
                </p>
              </div>
              <div className="p-6 pt-0">
                <CategoryGeneralSection
                  form={form}
                  isLoading={isLoading}
                  id={id}
                />
              </div>
            </div>
          </div>          <div className="flex justify-end space-x-4">
            <Link to="/categories">
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

export default CategoryForm;
