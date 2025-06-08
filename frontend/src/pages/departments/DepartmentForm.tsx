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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            {id ? 'Editar Departamento' : 'Novo Departamento'}
          </h1>
          <p className="text-muted-foreground">
            {id ? 'Edite as informações do departamento' : 'Adicione um novo departamento ao sistema'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="rounded-lg border p-6 space-y-4">
                <h3 className="text-lg font-medium">Informações do Departamento</h3>
                
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
                />

                <FormField
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
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          disabled={loading}
                          className="h-4 w-4"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
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
            </form>
          </Form>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border p-6 space-y-4">
            <h3 className="text-lg font-medium">Informações</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• O nome deve ser único no sistema</p>
              <p>• Todos os campos com * são obrigatórios</p>
              <p>• A descrição é opcional</p>
              <p>• Departamentos inativos não aparecerão na seleção de funcionários</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentForm;
