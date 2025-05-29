import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { countryApi } from '@/services/api';
import { Country, CreateCountryDto } from '@/types/location';

const formSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome do país é obrigatório e deve ter pelo menos 2 caracteres'),
  sigla: z
    .string()
    .length(2, 'Sigla deve ter exatamente 2 caracteres')
    .toUpperCase(),
  codigo: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(3, 'Código deve ter no máximo 3 caracteres')
    .regex(/^[0-9]+$/, 'Código deve conter apenas números'),
});

interface CountryCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (country: Country) => void;
  country?: Country | null; // País para edição
}

const CountryCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  country,
}: CountryCreationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      sigla: '',
      codigo: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (country) {
        // Preenche o formulário com os dados do país para edição
        form.reset({
          nome: country.nome || '',
          sigla: country.sigla || '',
          codigo: country.codigo || '',
        });
      } else {
        // Reset para valores padrão quando estiver criando novo país
        form.reset({
          nome: '',
          sigla: '',
          codigo: '',
        });
      }
    }
  }, [open, form, country]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const formData: CreateCountryDto = {
        nome: data.nome,
        sigla: data.sigla,
        codigo: data.codigo,
      };

      let savedCountry;

      if (country) {
        // Edição de país existente
        savedCountry = await countryApi.update(country.id, formData);
        toast.success(`País ${data.nome} atualizado com sucesso!`);
      } else {
        // Criação de novo país
        savedCountry = await countryApi.create(formData);
        toast.success(`País ${data.nome} criado com sucesso!`);
      }      // Return the saved country to the parent component and close dialog
      onSuccess(savedCountry);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar país:', error);
      toast.error(error.message || 'Ocorreu um erro ao salvar o país.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] max-h-[90vh] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {country ? 'Editar país' : 'Adicionar novo país'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {country
              ? 'Altere os campos abaixo para atualizar o país.'
              : 'Preencha os campos abaixo para cadastrar um novo país.'}
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
                    Nome do País
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Brasil"
                      {...field}
                      disabled={isLoading}
                      className="h-11 text-base"
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="sigla"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Sigla (2 caracteres)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: BR"
                        {...field}
                        maxLength={2}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        disabled={isLoading}
                        className="h-11 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Código
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: 55"
                        {...field}
                        maxLength={3}
                        disabled={isLoading}
                        className="h-11 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="h-11 px-6 text-base"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-6 text-base"
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CountryCreationDialog;
