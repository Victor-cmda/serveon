import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
import { departmentApi } from '@/services/api';
import { Department, CreateDepartmentDto } from '@/types/department';

const formSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome do departamento é obrigatório e deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  ativo: z.boolean().default(true),
});

interface DepartmentCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (department: Department) => void;
  department?: Department | null; // Departamento para edição
}

const DepartmentCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  department,
}: DepartmentCreationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      ativo: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (department) {
        // Preenche o formulário com os dados do departamento para edição
        form.reset({
          nome: department.nome || '',
          descricao: department.descricao || '',
          ativo: department.ativo,
        });
      } else {
        // Reset para valores padrão quando estiver criando novo departamento
        form.reset({
          nome: '',
          descricao: '',
          ativo: true,
        });
      }
    }
  }, [open, form, department]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const formData: CreateDepartmentDto = {
        nome: data.nome,
        descricao: data.descricao || undefined,
        ativo: data.ativo,
      };

      let savedDepartment;

      if (department) {
        // Edição de departamento existente
        savedDepartment = await departmentApi.update(department.id, formData);
        toast.success(`Departamento ${data.nome} atualizado com sucesso!`);
      } else {
        // Criação de novo departamento
        savedDepartment = await departmentApi.create(formData);
        toast.success(`Departamento ${data.nome} criado com sucesso!`);
      }

      // Return the saved department to the parent component and close dialog.
      // This enables proper cascading form behavior where the created department
      // is passed back to the parent form without redirecting to a list view.
      onSuccess(savedDepartment);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar departamento:', error);
      toast.error(error.message || 'Ocorreu um erro ao salvar o departamento.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[65vw] 2xl:max-w-[55vw] max-h-[95vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {department ? 'Editar departamento' : 'Adicionar novo departamento'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {department
              ? 'Altere os campos abaixo para atualizar o departamento.'
              : 'Preencha os campos abaixo para cadastrar um novo departamento.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Nome do Departamento
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Tecnologia da Informação"
                      {...field}
                      disabled={isLoading}
                      className="h-12 text-base"
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
                    Descrição (opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Departamento responsável pela infraestrutura e desenvolvimento de sistemas"
                      className="resize-none min-h-[100px]"
                      {...field}
                      value={field.value || ''}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription className="text-sm">
                    Descrição detalhada das responsabilidades do departamento
                  </FormDescription>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-medium">
                      Departamento Ativo
                    </FormLabel>
                    <FormDescription>
                      Indica se o departamento está disponível para uso no sistema
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="h-12 px-6 text-base"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-12 px-6 text-base"
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                )}
                {department ? 'Salvar alterações' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentCreationDialog;