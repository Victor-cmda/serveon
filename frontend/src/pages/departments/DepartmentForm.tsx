import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
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
import AuditSection from '../../components/AuditSection';
import { Department } from '../../types/department';

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

interface DepartmentFormProps {
  mode?: 'page' | 'dialog';
  departmentId?: number;
  initialData?: Partial<Department>;
  onSuccess?: (department: Department) => void;
  onCancel?: () => void;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  mode = 'page',
  departmentId,
  initialData,
  onSuccess,
  onCancel,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: paramId } = useParams<{ id: string }>();
  const id = mode === 'dialog' ? departmentId : paramId ? Number(paramId) : undefined;
  const [loading, setLoading] = useState(false);
  const [departmentData, setDepartmentData] = useState<any>(null);

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: initialData || defaultValues,
  });

  const loadDepartment = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await departmentApi.getById(id);
      
      setDepartmentData(data);
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
      if (mode === 'page') {
        navigate('/departments');
      }
    } finally {
      setLoading(false);
    }
  }, [id, form, navigate, mode]);

  useEffect(() => {
    if (id) {
      loadDepartment();
    } else if (mode === 'dialog') {
      // Limpa o formulário quando abre o dialog para criação
      form.reset({
        nome: initialData?.nome || '',
        descricao: initialData?.descricao || '',
        ativo: initialData?.ativo ?? true,
      });
    }
  }, [id, loadDepartment, mode, initialData, form]);

  const onSubmit = async (data: DepartmentFormData) => {
    try {
      setLoading(true);
      
      let savedDepartment: Department;
      
      const submitData = {
        ...data,
        descricao: data.descricao || undefined,
      };

      if (id) {
        savedDepartment = await departmentApi.update(id, submitData);
        toast.success('Sucesso', {
          description: 'Departamento atualizado com sucesso',
        });
      } else {
        savedDepartment = await departmentApi.create(submitData);
        toast.success('Sucesso', {
          description: 'Departamento criado com sucesso',
        });
      }

      // Se está em modo dialog, chama o callback de sucesso
      if (mode === 'dialog' && onSuccess) {
        onSuccess(savedDepartment);
        return;
      }
      
      // Modo page: navega conforme returnUrl ou vai para lista
      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate('/departments');
      }
    } catch (error: unknown) {
      console.error('Erro ao salvar departamento:', error);
      
      let errorMessage = 'Erro ao salvar departamento';
      if (error instanceof Error && error.message.includes('nome')) {
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
      {mode === 'page' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/departments">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {id ? 'Editar Departamento' : 'Novo Departamento'}
              </h1>
              <p className="text-muted-foreground">
                {id
                  ? 'Edite as informações do departamento abaixo'
                  : 'Preencha as informações para criar um novo departamento'}
              </p>
            </div>
          </div>
          
          {/* AuditSection no header */}
          <AuditSection 
            form={form} 
            data={departmentData}
            variant="header" 
            isEditing={!!id}
            statusFieldName="ativo" // Campo de status é 'ativo' para Department
          />
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold leading-none tracking-tight">
                      Dados Gerais
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Informações básicas do departamento
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input value={id || 'Novo'} disabled className="bg-muted" />
                      </FormControl>
                      
                    </FormItem>
                    
                    <div className="md:col-span-3">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Departamento *</FormLabel>
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
                    </div>
                  </div>

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
                  navigate('/departments');
                }
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {id ? 'Atualizar' : 'Salvar'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DepartmentForm;
