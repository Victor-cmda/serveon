import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { cityApi, stateApi } from '@/services/api';
import { CreateCityDto, UpdateCityDto, State } from '@/types/location';
import { toast } from 'sonner';
import StateCreationDialog from '@/components/dialogs/StateCreationDialog';
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
  estadoId: z.number().optional(),
  ativo: z.boolean().default(true),
});

const CityForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);

  const [stateDialogOpen, setStateDialogOpen] = useState(false);
  const [stateSearchOpen, setStateSearchOpen] = useState(false);
  const [stateToEdit, setStateToEdit] = useState<State | null>(null);

  const location = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),    defaultValues: {
      nome: '',
      codigoIbge: '',
      estadoId: undefined,
      ativo: true,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statesData = await stateApi.getAll();
        setStates(statesData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Não foi possível carregar a lista de estados.');
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCity = async () => {
      if (!id) return;

      setIsLoading(true);      try {
        const city = await cityApi.getById(Number(id));
        form.reset({
          nome: city.nome,
          codigoIbge: city.codigoIbge || '',
          estadoId: city.estadoId,
          ativo: city.ativo !== false,
        });
      }catch (error) {
        console.error('Erro ao buscar cidade:', error);
        toast.error('Não foi possível carregar os dados da cidade.');
        navigate('/cities');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCity();
    }
  }, [id, navigate, form]);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stateId = params.get('stateId');

    if (stateId) {
      const stateIdNumber = parseInt(stateId, 10);
      if (!isNaN(stateIdNumber)) {
        form.setValue('estadoId', stateIdNumber);
      }
    }
  }, [location.search, form]);
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!data.estadoId) {
      toast.error('Por favor, selecione um estado antes de salvar');
      return;
    }

    setIsLoading(true);

    try {
      const formattedData = {
        ...data,
        codigoIbge:
          data.codigoIbge && data.codigoIbge.trim() !== ''
            ? data.codigoIbge
            : undefined,
      };      let createdOrUpdatedId: number;

      if (id) {
        await cityApi.update(Number(id), formattedData as UpdateCityDto);
        toast.success('Cidade atualizada com sucesso!');
        createdOrUpdatedId = parseInt(id, 10);
      } else {
        const createdCity = await cityApi.create(
          formattedData as CreateCityDto,
        );
        toast.success('Cidade criada com sucesso!');
        createdOrUpdatedId = createdCity.id;
      }

      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        // Handle cascading form returns, pass the created/updated entity ID back to the parent form
        const returnWithParams = `${returnUrl}?createdEntity=city&createdId=${createdOrUpdatedId}`;
        navigate(returnWithParams);
      } else {
        // Only navigate to list view if not part of a cascading form
        navigate('/cities');
      }
    } catch (error: unknown) {
      console.error('Erro ao salvar cidade:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao salvar a cidade.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };  const handleStateCreated = (newState: State) => {
    setStates((prev) => [...prev, newState]);
    setStateDialogOpen(false);
    setStateSearchOpen(true);
    toast.success(`Estado ${newState.nome} criado com sucesso! Selecione-o na lista.`);
  };

  const handleStateUpdated = (updatedState: State) => {
    // Atualiza o estado na lista de estados
    setStates((prev) =>
      prev.map((state) =>
        state.id === updatedState.id ? updatedState : state,
      ),
    );
    setStateToEdit(null);
  };

  const handleEditState = (state: State) => {
    setStateToEdit(state);
    setStateSearchOpen(false);
    setStateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/cities">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {id ? 'Editar Cidade' : 'Nova Cidade'}
            </h1>
            <p className="text-muted-foreground">
              {id
                ? 'Edite as informações da cidade abaixo'
                : 'Preencha as informações para criar uma nova cidade'}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">
                  Dados Gerais
                </h3>
                <p className="text-sm text-muted-foreground">
                  Informações básicas da cidade
                </p>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="estadoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <div className="flex gap-2">
                          <div className="w-full flex-1">
                            <Input
                              value={
                                states.find((s) => s.id === field.value)?.nome || ''
                              }
                              readOnly
                              placeholder="Selecione um estado"
                              className="cursor-pointer"
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
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Cidade *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome da cidade"
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
                    name="codigoIbge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código IBGE</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Código de 7 dígitos"
                            {...field}
                            maxLength={7}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {id && (
                    <FormField
                      control={form.control}
                      name="ativo"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-base font-medium">
                              Cidade Ativa
                            </FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Desative para ocultar a cidade das listagens
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link to="/cities">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {id ? 'Atualizar' : 'Salvar'}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>

      {/* Dialogs */}      <StateCreationDialog
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
        }}
        onCreateNew={() => {
          setStateSearchOpen(false);
          setStateDialogOpen(true);
        }}
        onEdit={(state) => handleEditState(state)}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'uf', header: 'UF' },
          { key: 'paisNome', header: 'País' },
        ]}
        searchKeys={['nome', 'uf', 'paisNome']}
      />
    </div>
  );
};

export default CityForm;
