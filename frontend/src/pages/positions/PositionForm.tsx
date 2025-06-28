import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase, Save, Search, ArrowLeft, Loader2 } from 'lucide-react';
import { positionApi, departmentApi } from '../../services/api';
import { toast } from '../../lib/toast';
import { Department } from '../../types/department';
import { SearchDialog } from '../../components/SearchDialog';
import DepartmentCreationDialog from '../../components/dialogs/DepartmentCreationDialog';
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
import { Badge } from '../../components/ui/badge';

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
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  // Estados para os diálogos
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);
  const [newDepartmentDialogOpen, setNewDepartmentDialogOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);

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

  // Verificar se há um departamento pré-selecionado via URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const departmentId = params.get('departmentId');
    
    if (departmentId) {
      const departmentIdNumber = parseInt(departmentId, 10);
      if (!isNaN(departmentIdNumber)) {
        form.setValue('departamentoId', departmentIdNumber);
        // Buscar o departamento para mostrar no campo
        const dept = departments.find(d => d.id === departmentIdNumber);
        if (dept) {
          setSelectedDepartment(dept);
        }
      }
    }
  }, [location.search, form, departments]);

  const loadDepartments = async () => {
    try {
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      toast.error('Não foi possível carregar a lista de departamentos');
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

      // Buscar o departamento selecionado
      if (data.departamentoId) {
        const dept = departments.find(d => d.id === data.departamentoId);
        if (dept) {
          setSelectedDepartment(dept);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar cargo:', error);
      toast.error('Não foi possível carregar os dados do cargo');
      navigate('/positions');
    } finally {
      setLoading(false);
    }
  };

  const onSelectDepartment = (department: Department) => {
    if (!department || !department.id) {
      toast.error('Departamento inválido selecionado');
      return;
    }

    try {
      form.setValue('departamentoId', department.id, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      setSelectedDepartment(department);
      setDepartmentSearchOpen(false);
    } catch (error) {
      console.error('Erro ao selecionar departamento:', error);
      toast.error('Ocorreu um erro ao selecionar o departamento');
    }
  };

  const onCreateNewDepartment = () => {
    setNewDepartmentDialogOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setDepartmentToEdit(department);
    setDepartmentSearchOpen(false);
    setNewDepartmentDialogOpen(true);
  };

  const handleDepartmentCreated = (newDepartment: Department) => {
    setDepartments((prev) => [...prev, newDepartment]);
    setNewDepartmentDialogOpen(false);
    setDepartmentSearchOpen(true);
    toast.success(`Departamento ${newDepartment.nome} criado com sucesso! Selecione-o na lista.`);
  };

  const handleDepartmentUpdated = (updatedDepartment: Department) => {
    setDepartments((prev) =>
      prev.map((dept) => (dept.id === updatedDepartment.id ? updatedDepartment : dept)),
    );

    if (selectedDepartment && selectedDepartment.id === updatedDepartment.id) {
      setSelectedDepartment(updatedDepartment);
    }

    setDepartmentToEdit(null);
  };

  const onSubmit = async (data: PositionFormData) => {
    try {
      setLoading(true);
      
      const submitData = {
        ...data,
        descricao: data.descricao || undefined,
        departamentoId: data.departamentoId || undefined,
      };

      let createdOrUpdatedId: number;

      if (id) {
        await positionApi.update(parseInt(id), submitData);
        toast.success('Cargo atualizado com sucesso!');
        createdOrUpdatedId = parseInt(id);
      } else {
        const createdPosition = await positionApi.create(submitData);
        toast.success('Cargo criado com sucesso!');
        createdOrUpdatedId = createdPosition.id;
      }

      // Verificar se precisamos retornar para um formulário pai em um cenário de cascata
      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        // Passar o ID da entidade criada/atualizada de volta para o formulário pai
        const returnWithParams = `${returnUrl}?createdEntity=position&createdId=${createdOrUpdatedId}`;
        navigate(returnWithParams);
      } else {
        // Navegar apenas para a view de lista se não for parte de um formulário cascateado
        navigate('/positions');
      }
    } catch (error: any) {
      console.error('Erro ao salvar cargo:', error);
      
      let errorMessage = 'Erro ao salvar cargo';
      if (error?.message?.includes('nome')) {
        errorMessage = 'Este nome já está em uso';
      }
      
      toast.error(error.message || errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {id ? 'Editar Cargo' : 'Novo Cargo'}
        </h1>
        <Button variant="outline" asChild>
          <Link to="/positions">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="rounded-md border p-6">        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {id && (
              <FormItem>
                <FormLabel className="text-base font-medium">Código</FormLabel>
                <FormControl>
                  <Input value={id} disabled className="bg-muted h-11 text-base" />
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Código único do cargo
                </p>
              </FormItem>
            )}
            
            <FormField
              control={form.control}
              name="departamentoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Departamento
                  </FormLabel>
                  <div className="flex gap-2">
                    <div className="relative flex-grow">
                      <Input
                        value={selectedDepartment ? selectedDepartment.nome : ''}
                        readOnly
                        placeholder="Selecione um departamento"
                        className="cursor-pointer h-11 text-base pl-9"
                        onClick={() => setDepartmentSearchOpen(true)}
                      />
                      <input
                        type="hidden"
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        ref={field.ref}
                        onBlur={field.onBlur}
                      />
                      <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setDepartmentSearchOpen(true)}
                      className="h-11 w-11"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
                  {selectedDepartment && (
                    <div className="mt-1 flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {selectedDepartment.nome}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDepartment(null);
                          form.setValue('departamentoId', undefined);
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        Remover
                      </Button>
                    </div>
                  )}
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Nome do Cargo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Analista de Sistemas"
                      {...field}
                      disabled={loading}
                      className="h-11 text-base"
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Descrição
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição opcional do cargo..."
                      {...field}
                      disabled={loading}
                      className="text-base min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Cargo Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Indica se o cargo está disponível para uso no sistema
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

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="h-11 px-6 text-base"
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                <Save className="mr-2 h-5 w-5" /> Salvar
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Diálogos */}
      <DepartmentCreationDialog
        open={newDepartmentDialogOpen}
        onOpenChange={setNewDepartmentDialogOpen}
        onSuccess={departmentToEdit ? handleDepartmentUpdated : handleDepartmentCreated}
        department={departmentToEdit}
      />

      <SearchDialog
        open={departmentSearchOpen}
        onOpenChange={setDepartmentSearchOpen}
        title="Selecionar Departamento"
        entities={departments}
        isLoading={loading}
        onSelect={onSelectDepartment}
        onCreateNew={onCreateNewDepartment}
        onEdit={handleEditDepartment}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'descricao', header: 'Descrição' },
          {
            key: (dept) => dept.ativo ? 'Ativo' : 'Inativo',
            header: 'Status',
          },
        ]}
        searchKeys={['nome', 'descricao']}
        entityType="departamentos"
        description="Selecione um departamento para associar ao cargo ou edite um departamento existente."
      />
    </div>
  );
};

export default PositionForm;
