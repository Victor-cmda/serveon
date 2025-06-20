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
import { unitMeasureApi } from '@/services/api';
import { UnitMeasure } from '@/types/unit-measure';

const formSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome da unidade é obrigatório e deve ter pelo menos 2 caracteres'),
  sigla: z
    .string()
    .min(1, 'Sigla é obrigatória')
    .max(10, 'Sigla deve ter no máximo 10 caracteres'),
  descricao: z.string().optional(),
});

interface UnitMeasureCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (unitMeasure: UnitMeasure) => void;
  unitMeasure?: UnitMeasure | null; // Unidade para edição
}

const UnitMeasureCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  unitMeasure,
}: UnitMeasureCreationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: unitMeasure?.nome || '',
      sigla: unitMeasure?.sigla || '',
      descricao: unitMeasure?.descricao || '',
    },
  });

  useEffect(() => {
    if (open) {
      if (unitMeasure) {
        // Preenche o formulário com os dados da unidade para edição
        form.reset({
          nome: unitMeasure.nome || '',
          sigla: unitMeasure.sigla || '',
          descricao: unitMeasure.descricao || '',
        });
      } else {
        // Reset para valores padrão quando estiver criando nova unidade
        form.reset({
          nome: '',
          sigla: '',
          descricao: '',
        });
      }
    }
  }, [open, form, unitMeasure]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      let result: UnitMeasure;
      
      if (unitMeasure) {
        // Editando unidade existente
        result = await unitMeasureApi.update(unitMeasure.id, values);
        toast.success('Unidade de medida atualizada com sucesso!');
      } else {
        // Criando nova unidade
        result = await unitMeasureApi.create(values);
        toast.success('Unidade de medida criada com sucesso!');
      }
      
      onSuccess(result);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar unidade de medida:', error);
      toast.error(
        unitMeasure 
          ? 'Erro ao atualizar unidade de medida. Tente novamente.' 
          : 'Erro ao criar unidade de medida. Tente novamente.'
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
            {unitMeasure ? 'Editar Unidade de Medida' : 'Nova Unidade de Medida'}
          </DialogTitle>
          <DialogDescription>
            {unitMeasure 
              ? 'Edite os dados da unidade de medida selecionada.'
              : 'Preencha os dados para criar uma nova unidade de medida.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Quilograma"
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
                name="sigla"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sigla *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: KG"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite uma descrição para a unidade de medida (opcional)"
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
                {unitMeasure ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UnitMeasureCreationDialog;
