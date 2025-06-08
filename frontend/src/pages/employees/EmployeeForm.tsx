import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Save, X } from 'lucide-react';
import { employeeApi } from '../../services/api';
import { toast } from '../../lib/toast';
import type { Department } from '../../types/department';
import type { Position } from '../../types/position';
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
import { Switch } from '../../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const employeeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter exatamente 11 dígitos'),
  email: z.string().email('Email inválido').max(100, 'Email deve ter no máximo 100 caracteres'),
  telefone: z.string().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  cargoId: z.number().optional(),
  departamentoId: z.number().optional(),
  dataAdmissao: z.string().min(1, 'Data de admissão é obrigatória'),
  dataDemissao: z.string().optional(),
  ativo: z.boolean().default(true),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

const defaultValues: EmployeeFormData = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  cargoId: undefined,
  departamentoId: undefined,
  dataAdmissao: '',
  dataDemissao: '',
  ativo: true,
};

// Predefined options for cargo and departamento - Removido, agora carregamos do banco
// const cargos = [...] - Removido
// const departamentos = [...] - Removido

const EmployeeForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>();

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues,
  });

  useEffect(() => {
    loadDepartments();
    loadPositions();
    if (id) {
      loadEmployee();
    }
  }, [id]);

  useEffect(() => {
    // Filtrar cargos quando departamento é selecionado
    if (selectedDepartmentId) {
      loadPositionsByDepartment(selectedDepartmentId);
    } else {
      loadPositions();
    }
  }, [selectedDepartmentId]);  const loadDepartments = async () => {
    try {
      const data = await employeeApi.getActiveDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os departamentos',
      });
    }
  };

  const loadPositions = async () => {
    try {
      const data = await employeeApi.getActivePositions();
      setPositions(data);
    } catch (error) {
      console.error('Erro ao carregar cargos:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os cargos',
      });
    }
  };

  const loadPositionsByDepartment = async (departmentId: number) => {
    try {
      const data = await employeeApi.getPositionsByDepartment(departmentId);
      setPositions(data);
    } catch (error) {
      console.error('Erro ao carregar cargos do departamento:', error);
      // Fallback para todos os cargos
      loadPositions();
    }
  };
  const loadEmployee = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await employeeApi.getById(parseInt(id));
      
      // Format dates for input fields
      const dataAdmissao = data.dataAdmissao ? new Date(data.dataAdmissao).toISOString().split('T')[0] : '';
      const dataDemissao = data.dataDemissao ? new Date(data.dataDemissao).toISOString().split('T')[0] : '';
      
      // Definir departamento selecionado para filtrar cargos
      if (data.departamentoId) {
        setSelectedDepartmentId(data.departamentoId);
      }

      form.reset({
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        telefone: data.telefone || '',
        cargoId: data.cargoId,
        departamentoId: data.departamentoId,
        dataAdmissao,
        dataDemissao,
        ativo: data.ativo,
      });
    } catch (error) {
      console.error('Erro ao carregar funcionário:', error);
      toast.error('Erro', {
        description: 'Não foi possível carregar os dados do funcionário',
      });
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setLoading(true);
      
      const submitData = {
        ...data,
        telefone: data.telefone || undefined,
        dataDemissao: data.dataDemissao || undefined,
      };

      if (id) {
        await employeeApi.update(parseInt(id), submitData);        toast.success('Sucesso', {
          description: 'Funcionário atualizado com sucesso',
        });
      } else {
        await employeeApi.create(submitData);        toast.success('Sucesso', {
          description: 'Funcionário criado com sucesso',
        });
      }
      
      navigate('/employees');
    } catch (error: any) {
      console.error('Erro ao salvar funcionário:', error);
      
      let errorMessage = 'Erro ao salvar funcionário';
      if (error?.message?.includes('CPF')) {
        errorMessage = 'Este CPF já está cadastrado';
      } else if (error?.message?.includes('email')) {
        errorMessage = 'Este email já está cadastrado';
      }
        toast.error('Erro', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };

  const formatPhone = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6" />
            {id ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {id ? 'Edite as informações do funcionário' : 'Adicione um novo funcionário ao sistema'}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="border rounded-lg p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Informações Pessoais</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Digite o nome completo" 
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
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="12345678901"
                              {...field}
                              disabled={loading || !!id} // CPF não pode ser editado
                              onChange={(e) => field.onChange(formatCPF(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="funcionario@empresa.com"
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
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="11987654321"
                              {...field}
                              disabled={loading}
                              onChange={(e) => field.onChange(formatPhone(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Informações Profissionais</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departamentoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento *</FormLabel>
                          <Select 
                            onValueChange={(value) => {
                              const numValue = value ? parseInt(value) : undefined;
                              field.onChange(numValue);
                              setSelectedDepartmentId(numValue);
                              // Limpar cargo quando departamento muda
                              form.setValue('cargoId', undefined);
                            }} 
                            value={field.value?.toString()} 
                            disabled={loading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o departamento" />
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
                      name="cargoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo *</FormLabel>
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
                                <SelectValue placeholder="Selecione o cargo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {positions.map((position) => (
                                <SelectItem key={position.id} value={position.id.toString()}>
                                  {position.nome}
                                  {position.departamentoNome && ` (${position.departamentoNome})`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dataAdmissao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Admissão *</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              disabled={loading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {id && (
                      <FormField
                        control={form.control}
                        name="dataDemissao"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Demissão</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                disabled={loading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>                  <FormField
                    control={form.control}
                    name="ativo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Funcionário Ativo</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Indica se o funcionário está ativo no sistema
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
                  onClick={() => navigate('/employees')}
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

export default EmployeeForm;
