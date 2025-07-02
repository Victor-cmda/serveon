import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Search, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { employeeApi, positionApi } from '@/services/api';
import { Position, CreatePositionDto } from '@/types/position';
import { Department } from '@/types/department';
import { SearchDialog } from '@/components/SearchDialog';
import DepartmentCreationDialog from '@/components/dialogs/DepartmentCreationDialog';

const formSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome do cargo é obrigatório e deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  departamentoId: z.number().optional(),
  ativo: z.boolean().default(true),
});

interface PositionCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (position: Position) => void;
  position?: Position | null; // Cargo para edição
}

const PositionCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  position,
}: PositionCreationDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);
  
  // Estados para o diálogo de criação de departamento
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState(false);
  const [departmentToEdit, setDepartmentToEdit] = useState<Department | null>(null);

  const isEditing = !!position;
  const dialogTitle = isEditing ? 'Editar Cargo' : 'Novo Cargo';
  const dialogDescription = isEditing
    ? 'Edite as informações do cargo'
    : 'Preencha as informações para criar um novo cargo';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      departamentoId: undefined,
      ativo: true,
    },
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (open && position) {
      form.reset({
        nome: position.nome,
        descricao: position.descricao || '',
        departamentoId: position.departamentoId,
        ativo: position.ativo,
      });

      // Definir departamento selecionado
      if (position.departamentoId) {
        const department = departments.find(d => d.id === position.departamentoId);
        setSelectedDepartment(department || null);
      }
    } else if (open) {
      form.reset({
        nome: '',
        descricao: '',
        departamentoId: undefined,
        ativo: true,
      });
      setSelectedDepartment(null);
    }
  }, [open, position, form, departments]);

  const loadDepartments = async () => {
    try {
      const data = await employeeApi.getActiveDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Erro ao carregar departamentos:', error);
      toast.error('Erro ao carregar departamentos');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      const submitData: CreatePositionDto = {
        nome: values.nome,
        descricao: values.descricao || undefined,
        departamentoId: values.departamentoId || undefined,
        ativo: values.ativo,
      };

      let result: Position;
      if (isEditing) {
        result = await positionApi.update(position.id, submitData);
      } else {
        result = await positionApi.create(submitData);
      }

      toast.success(isEditing ? 'Cargo atualizado com sucesso!' : 'Cargo criado com sucesso!');
      onSuccess(result);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar cargo:', error);
      toast.error('Erro ao salvar cargo');
    } finally {
      setLoading(false);
    }
  };

  const onSelectDepartment = (department: Department) => {
    setSelectedDepartment(department);
    form.setValue('departamentoId', department.id);
    setDepartmentSearchOpen(false);
  };

  const handleDepartmentCreated = async (department: Department) => {
    // Recarregar lista de departamentos
    await loadDepartments();
    
    // Selecionar o departamento criado/atualizado
    setSelectedDepartment(department);
    form.setValue('departamentoId', department.id);
    
    // Fechar o diálogo de departamento
    setDepartmentDialogOpen(false);
    setDepartmentToEdit(null);
    
    toast.success(departmentToEdit ? 'Departamento atualizado com sucesso!' : 'Departamento criado com sucesso!');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cargo *</FormLabel>
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
                      <FormControl>
                        <div className="flex w-full items-center gap-2">
                          <div className="relative flex-grow">
                            <Input
                              value={selectedDepartment?.nome || ''}
                              readOnly
                              placeholder="Selecione um departamento"
                              className="cursor-pointer h-10 text-base pl-9"
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
                            <Users className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setDepartmentSearchOpen(true)}
                            className="h-10 w-10"
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      {selectedDepartment && (
                        <div className="mt-1">
                          <Badge variant="outline">
                            {selectedDepartment.nome}
                          </Badge>
                        </div>
                      )}
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
                          placeholder="Descrição do cargo (opcional)"
                          className="resize-none"
                          {...field}
                          disabled={loading}
                        />
                      </FormControl>
                      <FormDescription>
                        Descrição detalhada sobre as responsabilidades do cargo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={loading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Cargo ativo</FormLabel>
                        <FormDescription>
                          Cargos ativos aparecem nas listas de seleção
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Salvar Alterações' : 'Criar Cargo'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de seleção de departamento */}
      <SearchDialog
        open={departmentSearchOpen}
        onOpenChange={setDepartmentSearchOpen}
        title="Selecionar Departamento"
        entities={departments}
        isLoading={loading}
        onSelect={onSelectDepartment}
        onCreateNew={() => {
          setDepartmentSearchOpen(false);
          setDepartmentToEdit(null);
          setDepartmentDialogOpen(true);
        }}
        onEdit={(department) => {
          setDepartmentSearchOpen(false);
          setDepartmentToEdit(department as Department);
          setDepartmentDialogOpen(true);
        }}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'descricao', header: 'Descrição' },
        ]}
        searchKeys={['nome', 'descricao']}
        entityType="departamentos"
        description={`Selecione um departamento para o cargo. ${departments.length} departamentos disponíveis.`}
      />

      {/* Diálogo de criação/edição de departamento */}
      <DepartmentCreationDialog
        open={departmentDialogOpen}
        onOpenChange={setDepartmentDialogOpen}
        onSuccess={handleDepartmentCreated}
        department={departmentToEdit}
      />
    </>
  );
};

export default PositionCreationDialog;
