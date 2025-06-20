import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
} from '@/components/ui/form';
import { categoryApi } from '@/services/api';
import { Category } from '@/types/category';

const formSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome da categoria é obrigatório e deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
});

interface CategoryCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (category: Category) => void;
  category?: Category | null; // Categoria para edição
}

const CategoryCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  category,
}: CategoryCreationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: category?.nome || '',
      descricao: category?.descricao || '',
    },
  });

  useEffect(() => {
    if (open) {      if (category) {
        // Preenche o formulário com os dados da categoria para edição
        form.reset({
          nome: category.nome || '',
          descricao: category.descricao || '',
        });
      } else {
        // Reset para valores padrão quando estiver criando nova categoria
        form.reset({
          nome: '',
          descricao: '',
        });
      }
    }
  }, [open, form, category]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      let result: Category;
      
      if (category) {
        // Editando categoria existente
        result = await categoryApi.update(category.id, values);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        // Criando nova categoria
        result = await categoryApi.create(values);
        toast.success('Categoria criada com sucesso!');
      }
      
      onSuccess(result);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error(
        category 
          ? 'Erro ao atualizar categoria. Tente novamente.' 
          : 'Erro ao criar categoria. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {category 
              ? 'Edite os dados da categoria selecionada.'
              : 'Preencha os dados para criar uma nova categoria.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome da categoria"
                      {...field}
                      disabled={isLoading}
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
                      placeholder="Digite uma descrição para a categoria (opcional)"
                      {...field}
                      disabled={isLoading}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {category ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryCreationDialog;
