import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Save, X } from 'lucide-react';
import { positionApi, departmentApi } from '../../services/api';
import { toast } from '../../lib/toast';
import { Department } from '../../types/department';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const positionSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  departamentoId: z.number().optional(),
  ativo: z.boolean().default(true),
});

type PositionFormData = z.infer<typeof positionSchema>;

const defaultValues: PositionFormData = {
  nome: '',
  descricao: '',
  departamentoId: undefined,
  ativo: true,
};

const PositionForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);

  const form = useForm<PositionFormData>({
    resolver: zodResolver(positionSchema),
    defaultValues,
  });

  useEffect(() => {
    loadDepartments();
    if (id) {
      loadPosition();
    }
  }, [id]);

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data.filter(dept => dept.ativo));
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os departamentos',
      });
    }
  };

  const loadPosition = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await positionApi.getById(parseInt(id));
      
      form.reset({
        nome: data.nome,
        descricao: data.descricao || '',
        departamentoId: data.departamentoId,
        ativo: data.ativo,
      });
    } catch (error) {
      console.error('Erro ao carregar cargo:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os dados do cargo',
      });
      navigate('/positions');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PositionFormData) => {
    try {
      setLoading(true);
      
      const submitData = {
        ...data,
        descricao: data.descricao || undefined,
        departamentoId: data.departamentoId || undefined,
      };

      if (id) {
        await positionApi.update(parseInt(id), submitData);
        toast.success('Sucesso', {
          description: 'Cargo atualizado com sucesso',
        });
      } else {
        await positionApi.create(submitData);
        toast.success('Sucesso', {
          description: 'Cargo criado com sucesso',
        });
      }
      
      navigate('/positions');
    } catch (error: any) {
      console.error('Erro ao salvar cargo:', error);
      
      let errorMessage = 'Erro ao salvar cargo';
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
            <Briefcase className="h-6 w-6" />
            {id ? 'Editar Cargo' : 'Novo Cargo'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {id ? 'Edite as informações do cargo' : 'Adicione um novo cargo ao sistema'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="border rounded-lg p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Informações do Cargo</h3>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Digite o nome do cargo" 
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
                    name="departamentoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            const numValue = value ? parseInt(value) : undefined;
                            field.onChange(numValue);
                          }} 
                          value={field.value?.toString()} 
                          disabled={loading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o departamento (opcional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem key={department.id} value={department.id.toString()}>
                                {department.nome}
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
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Digite uma descrição opcional para o cargo"
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
                          <FormLabel>Cargo Ativo</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Indica se o cargo está ativo no sistema
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
                  onClick={() => navigate('/positions')}
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

export default PositionForm;
