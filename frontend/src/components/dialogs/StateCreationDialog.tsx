import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Search } from 'lucide-react';
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
import { stateApi, countryApi } from '@/services/api';
import { Country, CreateStateDto, State } from '@/types/location';
import { SearchDialog } from '@/components/SearchDialog';
import CountryCreationDialog from './CountryCreationDialog';

const formSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome do estado é obrigatório e deve ter pelo menos 2 caracteres'),
  uf: z.string().length(2, 'UF deve ter exatamente 2 caracteres').toUpperCase(),
  paisId: z.number().min(1, 'Selecione um país válido'),
});

interface StateCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (state: State) => void;
  selectedCountryId?: number;
  state?: State | null; // Estado para edição
}

const StateCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  selectedCountryId,
  state, // Adicionado para edição de estado
}: StateCreationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [countryToEdit, setCountryToEdit] = useState<Country | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: state?.nome || '',
      uf: state?.uf || '',
      paisId: state?.paisId || selectedCountryId || undefined,
    },
  });
  useEffect(() => {
    if (selectedCountryId) {
      form.setValue('paisId', selectedCountryId);
    }
  }, [selectedCountryId, form]);

  useEffect(() => {
    if (open) {      if (state) {
        // Preenche o formulário com os dados do estado para edição
        form.reset({
          nome: state.nome || '',
          uf: state.uf || '',
          paisId: state.paisId || selectedCountryId || undefined,
        });
      } else {
        // Reset para valores padrão quando estiver criando novo estado
        form.reset({
          nome: '',
          uf: '',
          paisId: selectedCountryId || undefined,
        });
      }
    }
  }, [open, form, selectedCountryId, state]);

  useEffect(() => {
    if (open) {
      const loadCountries = async () => {
        try {
          const countriesData = await countryApi.getAll();
          setCountries(countriesData);
        } catch (error) {
          console.error('Error loading countries:', error);
          toast.error('Não foi possível carregar a lista de países');
        }
      };

      loadCountries();
    }
  }, [open]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const createData: CreateStateDto = {
        nome: data.nome,
        uf: data.uf,
        paisId: data.paisId,
      };      let newState;
      if (state) {
        // Edição de estado existente
        newState = await stateApi.update(state.id.toString(), createData);
        toast.success(`Estado ${data.nome} atualizado com sucesso!`);      } else {
        // Criação de novo estado
        newState = await stateApi.create(createData);
        toast.success(`Estado ${data.nome} criado com sucesso!`);
      }      
      // Return the new state to the parent component and close dialog.
      // This enables proper cascading form behavior where the created state
      // is passed back to the parent form without redirecting to a list view.
      onSuccess(newState);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar estado:', error);
      toast.error(error.message || 'Ocorreu um erro ao salvar o estado.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryCreated = (newCountry: Country) => {
    setCountries((prevCountries) => [...prevCountries, newCountry]);
    form.setValue('paisId', newCountry.id);
    setCountryDialogOpen(false);
  };

  const handleCountryUpdated = (updatedCountry: Country) => {
    // Atualiza o país na lista de países
    setCountries((prev) =>
      prev.map((country) =>
        country.id === updatedCountry.id ? updatedCountry : country
      )
    );
    setCountryToEdit(null);
  };

  const handleEditCountry = (country: Country) => {
    setCountryToEdit(country);
    setCountrySearchOpen(false);
    setCountryDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[80vw] xl:max-w-[70vw] 2xl:max-w-[60vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {state ? 'Editar estado' : 'Adicionar novo estado'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {state
                ? 'Altere os campos abaixo para atualizar o estado.'
                : 'Preencha os campos abaixo para cadastrar um novo estado.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              <FormField
                control={form.control}
                name="paisId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      País
                    </FormLabel>
                    <div className="flex gap-2">
                      <div className="w-full flex-1">                        <Input
                          value={
                            countries.find((c) => c.id === field.value)?.nome ||
                            ''
                          }
                          readOnly
                          placeholder="Selecione um país"
                          className="cursor-pointer h-12 text-base"
                          onClick={() => setCountrySearchOpen(true)}
                        />
                        <input type="hidden" {...field} />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setCountrySearchOpen(true)}
                        disabled={isLoading}
                        className="h-12 w-12"
                      >
                        <Search className="h-5 w-5" />
                      </Button>
                    </div>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Nome do Estado
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: São Paulo"
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
                  name="uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        UF (2 caracteres)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: SP"
                          {...field}
                          maxLength={2}
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
                          disabled={isLoading}
                          className="h-12 text-base"
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
                  {state ? 'Salvar alterações' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CountryCreationDialog
        open={countryDialogOpen}
        onOpenChange={setCountryDialogOpen}
        onSuccess={countryToEdit ? handleCountryUpdated : handleCountryCreated}
        country={countryToEdit}
      />

      <SearchDialog
        open={countrySearchOpen}
        onOpenChange={setCountrySearchOpen}
        title="Selecionar País"
        entities={countries}
        isLoading={isLoading}
        onSelect={(country) => {
          form.setValue('paisId', country.id);
          setCountrySearchOpen(false);
        }}
        onCreateNew={() => {
          setCountrySearchOpen(false);
          setCountryDialogOpen(true);
        }}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'sigla', header: 'Sigla' },
          { key: 'codigo', header: 'Código' },
        ]}
        searchKeys={['nome', 'sigla', 'codigo']}
        entityType="paises"
        description="Selecione um país para associar ao estado ou cadastre um novo país."
        onEdit={handleEditCountry} // Adicionando a função de edição
      />
    </>
  );
};

export default StateCreationDialog;
