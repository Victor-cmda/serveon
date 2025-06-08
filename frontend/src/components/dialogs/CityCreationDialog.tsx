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
  FormDescription,
} from '@/components/ui/form';
import { cityApi, stateApi } from '@/services/api';
import { City, State } from '@/types/location';
import StateCreationDialog from './StateCreationDialog';
import { SearchDialog } from '@/components/SearchDialog';

const formSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome da cidade é obrigatório e deve ter pelo menos 2 caracteres'),
  codigoIbge: z
  .string()
    .optional()
    .refine((val) => !val || /^[0-9]{7}$/.test(val), {
      message: 'O código IBGE deve ter exatamente 7 dígitos numéricos',
    }),
  estadoId: z.number().min(1, 'Estado é obrigatório'),
});

interface CityCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (city: City) => void;
  selectedStateId?: number;
  city?: City | null; // Cidade para edição
}

const CityCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  selectedStateId,
  city,
}: CityCreationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [stateDialogOpen, setStateDialogOpen] = useState(false);
  const [stateSearchOpen, setStateSearchOpen] = useState(false);
  const [stateToEdit, setStateToEdit] = useState<State | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: city?.nome || '',
      codigoIbge: city?.codigoIbge || '',
      estadoId: city?.estadoId || selectedStateId || undefined,
    },
  });

  useEffect(() => {
    if (selectedStateId) {
      form.setValue('estadoId', selectedStateId);
    }
  }, [selectedStateId, form]);

  useEffect(() => {
    if (open) {      if (city) {
        // Preenche o formulário com os dados da cidade para edição
        form.reset({
          nome: city.nome || '',
          codigoIbge: city.codigoIbge || '',
          estadoId: city.estadoId || selectedStateId || undefined,
        });
      } else {
        // Reset para valores padrão quando estiver criando nova cidade
        form.reset({
          nome: '',
          codigoIbge: '',
          estadoId: selectedStateId || undefined,
        });
      }
    }
  }, [open, form, selectedStateId, city]);

  useEffect(() => {
    if (open) {
      const loadStates = async () => {
        try {
          const statesData = await stateApi.getAll();
          setStates(statesData);
        } catch (error) {
          console.error('Error loading states:', error);
          toast.error('Não foi possível carregar a lista de estados');
        }
      };

      loadStates();
    }
  }, [open]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const formData = {
        nome: data.nome,
        codigoIbge:
          data.codigoIbge && data.codigoIbge.trim() !== ''
            ? data.codigoIbge
            : undefined,
        estadoId: data.estadoId,
      };

      let savedCity;      if (city) {
        // Edição de cidade existente
        savedCity = await cityApi.update(city.id, formData);
        toast.success(`Cidade ${data.nome} atualizada com sucesso!`);      } else {
        // Criação de nova cidade
        savedCity = await cityApi.create(formData);
        toast.success(`Cidade ${data.nome} criada com sucesso!`);
      }      
      // Return the saved city to the parent component and close dialog.
      // This enables proper cascading form behavior where the created city 
      // is passed back to the parent form without redirecting to a list view.
      onSuccess(savedCity);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar cidade:', error);
      toast.error(error.message || 'Ocorreu um erro ao salvar a cidade.');
    } finally {
      setIsLoading(false);
    }
  };  const handleStateCreated = (newState: State) => {
    setStates((prevStates) => [...prevStates, newState]);
    setStateDialogOpen(false);
    toast.success(`Estado ${newState.nome} criado com sucesso! Selecione-o na lista.`);
  };

  const handleStateUpdated = (updatedState: State) => {
    // Atualiza o estado na lista de estados
    setStates((prev) =>
      prev.map((state) =>
        state.id === updatedState.id ? updatedState : state
      )
    );
    setStateToEdit(null);
  };
  const handleEditState = (state: State) => {
    setStateToEdit(state);
    setStateDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[65vw] 2xl:max-w-[55vw] max-h-[95vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {city ? 'Editar cidade' : 'Adicionar nova cidade'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {city
                ? 'Altere os campos abaixo para atualizar a cidade.'
                : 'Preencha os campos abaixo para cadastrar uma nova cidade.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              <FormField
                control={form.control}
                name="estadoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Estado
                    </FormLabel>
                    <div className="flex gap-2">
                      <div className="w-full flex-1">
                        <Input
                          value={
                            states.find((s) => s.id === field.value)?.nome || ''
                          }
                          readOnly
                          placeholder="Selecione um estado"
                          className="cursor-pointer h-12 text-base"
                          onClick={() => setStateSearchOpen(true)}
                        />
                        <input type="hidden" {...field} />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => setStateSearchOpen(true)}
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
                        Nome da Cidade
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
                  name="codigoIbge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Código IBGE (opcional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: 3550308"
                          {...field}
                          maxLength={7}
                          disabled={isLoading}
                          className="h-12 text-base"
                        />
                      </FormControl>
                      <FormDescription className="text-sm">
                        Código de 7 dígitos do IBGE para o município
                      </FormDescription>
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
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>      <StateCreationDialog
        open={stateDialogOpen}
        onOpenChange={setStateDialogOpen}
        onSuccess={stateToEdit ? handleStateUpdated : handleStateCreated}
        selectedCountryId={undefined}
        state={stateToEdit}
      />

      <SearchDialog
        open={stateSearchOpen}
        onOpenChange={setStateSearchOpen}
        title="Selecionar Estado"
        entities={states}
        isLoading={isLoading}
        onSelect={(state) => {
          form.setValue('estadoId', state.id);
          setStateSearchOpen(false);
        }}        onCreateNew={() => {
          setStateDialogOpen(true);
        }}
        onEdit={handleEditState}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'uf', header: 'UF' },
          { key: 'paisNome', header: 'País' },
        ]}
        searchKeys={['nome', 'uf', 'paisNome']}
        entityType="estados"
        description="Selecione um estado para associar à cidade ou edite um estado existente."
      />
    </>
  );
};

export default CityCreationDialog;
