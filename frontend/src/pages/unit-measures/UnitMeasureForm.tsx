import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { unitMeasureApi } from '../../services/api';
import { toast } from 'sonner';
import { Form } from '../../components/ui/form';
import AuditSection from '../../components/AuditSection';

// Componente modular
import UnitMeasureGeneralSection from './components/UnitMeasureGeneralSection';

const formSchema = z.object({
  id: z.number().optional(),
  nome: z.string().min(2, 'Nome é obrigatório'),
  sigla: z.string().min(1, 'Sigla é obrigatória'),
  ativo: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

const UnitMeasureForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [unitMeasureData, setUnitMeasureData] = useState<any>(null); // Estado para dados da unidade de medida

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      sigla: '',
      ativo: true,
    },
  });

  useEffect(() => {
    const fetchUnitMeasure = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const unitMeasure = await unitMeasureApi.getById(Number(id));
        setUnitMeasureData(unitMeasure); // Armazenar dados para AuditSection
        form.reset({
          id: unitMeasure.id || 0,
          nome: unitMeasure.nome || '',
          sigla: unitMeasure.sigla || '',
          ativo: unitMeasure.ativo !== false,
        });
      } catch (error) {
        console.error('Erro ao carregar unidade de medida:', error);
        toast.error('Não foi possível carregar os dados da unidade de medida');
        navigate('/unit-measures');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUnitMeasure();
  }, [id, form, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      const unitMeasureData = {
        ...data,
      };

      if (id) {
        await unitMeasureApi.update(Number(id), unitMeasureData);
        toast.success('Unidade de medida atualizada com sucesso!');
      } else {
        await unitMeasureApi.create(unitMeasureData);
        toast.success('Unidade de medida criada com sucesso!');
      }

      navigate('/unit-measures');
    } catch (error: unknown) {
      console.error('Erro ao salvar unidade de medida:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as any)?.response?.data?.message || 'Erro ao salvar unidade de medida. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">        <div className="flex items-center space-x-4">
          <Link to="/unit-measures">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {id ? 'Editar Unidade de Medida' : 'Nova Unidade de Medida'}
            </h1>
            <p className="text-muted-foreground">
              {id
                ? 'Edite as informações da unidade de medida abaixo'
                : 'Preencha as informações para criar uma nova unidade de medida'}
            </p>
          </div>
        </div>
        
        {/* AuditSection no header */}
        <AuditSection 
          form={form} 
          data={unitMeasureData}
          variant="header" 
          isEditing={!!id}
          statusFieldName="ativo" // Campo de status é 'ativo' para UnitMeasure
        />
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
                  Informações básicas da unidade de medida
                </p>
              </div>
              <div className="p-6 pt-0">
                <UnitMeasureGeneralSection
                  form={form}
                  isLoading={isLoading}
                  id={id}
                />
              </div>
            </div>
          </div>          <div className="flex justify-end space-x-4">
            <Link to="/unit-measures">
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

export default UnitMeasureForm;
