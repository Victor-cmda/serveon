import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Save, X } from 'lucide-react';
import { departmentApi } from '../../services/api';
import { toast } from '../../lib/toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';

const departmentSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  ativo: z.boolean().default(true),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

const defaultValues: DepartmentFormData = {
  nome: '',
  descricao: '',
  ativo: true,
};

const DepartmentForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues,
  });

  useEffect(() => {
    if (id) {
      loadDepartment();
    }
  }, [id]);

  const loadDepartment = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await departmentApi.getById(parseInt(id));
      
      form.reset({
        nome: data.nome,
        descricao: data.descricao || '',
        ativo: data.ativo,
      });
    } catch (error) {
      console.error('Erro ao carregar departamento:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os dados do departamento',
      });
      navigate('/departments');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      setLoading(true);
      
      const submitData = {
        ...data,
        descricao: data.descricao || undefined,
      };

      if (id) {
        await departmentApi.update(parseInt(id), submitData);
        toast.success('Sucesso', {
          description: 'Departamento atualizado com sucesso',
        });
      } else {
        await departmentApi.create(submitData);
        toast.success('Sucesso', {
          description: 'Departamento criado com sucesso',
        });
      }
      
      navigate('/departments');
    } catch (error: any) {
      console.error('Erro ao salvar departamento:', error);
      
      let errorMessage = 'Erro ao salvar departamento';
      if (error?.message?.includes('nome')) {
        errorMessage = 'Este nome já está em uso';
      }
      
      toast.error('Erro', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {id ? 'Editar Departamento' : 'Novo Departamento'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {id ? 'Edite as informações do departamento' : 'Adicione um novo departamento ao sistema'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="border rounded-lg p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Informações do Departamento</h3>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Digite o nome do departamento" 
                            {...field} 
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Digite uma descrição opcional para o departamento"
                            className="resize-none"
                            {...field}
                            disabled={loading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />                  <FormField
                    control={form.control}
                    name="ativo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Departamento Ativo</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Indica se o departamento está ativo no sistema
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 mt-2 border-t space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/departments')}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DepartmentForm;
