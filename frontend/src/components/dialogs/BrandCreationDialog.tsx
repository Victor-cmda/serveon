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
import { brandApi } from '@/services/api';
import { Brand } from '@/types/brand';

const formSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome da marca é obrigatório e deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
});

interface BrandCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (brand: Brand) => void;
  brand?: Brand | null; // Marca para edição
}

const BrandCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  brand,
}: BrandCreationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: brand?.nome || '',
      descricao: brand?.descricao || '',
    },
  });

  useEffect(() => {
    if (open) {
      if (brand) {
        // Preenche o formulário com os dados da marca para edição
        form.reset({
          nome: brand.nome || '',
          descricao: brand.descricao || '',
        });
      } else {
        // Reset para valores padrão quando estiver criando nova marca
        form.reset({
          nome: '',
          descricao: '',
        });
      }
    }
  }, [open, form, brand]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      let result: Brand;
      
      if (brand) {
        // Editando marca existente
        result = await brandApi.update(brand.id, values);
        toast.success('Marca atualizada com sucesso!');
      } else {
        // Criando nova marca
        result = await brandApi.create(values);
        toast.success('Marca criada com sucesso!');
      }
      
      onSuccess(result);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar marca:', error);
      toast.error(
        brand 
          ? 'Erro ao atualizar marca. Tente novamente.' 
          : 'Erro ao criar marca. Tente novamente.'
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
            {brand ? 'Editar Marca' : 'Nova Marca'}
          </DialogTitle>
          <DialogDescription>
            {brand 
              ? 'Edite os dados da marca selecionada.'
              : 'Preencha os dados para criar uma nova marca.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome da marca"
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
                      placeholder="Digite uma descrição para a marca (opcional)"
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
                {brand ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BrandCreationDialog;
