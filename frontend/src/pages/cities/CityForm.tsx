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
  FormDescription,
} from '@/components/ui/form';
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
  estadoId: z.string().uuid('Selecione um estado válido'),
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
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      codigoIbge: '',
      estadoId: '',
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

      setIsLoading(true);
      try {
        const city = await cityApi.getById(id);
        form.reset({
          nome: city.nome,
          codigoIbge: city.codigoIbge || '',
          estadoId: city.estadoId,
        });
      } catch (error) {
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
      form.setValue('estadoId', stateId);
    }
  }, [location.search, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const formattedData = {
        ...data,
        codigoIbge:
          data.codigoIbge && data.codigoIbge.trim() !== ''
            ? data.codigoIbge
            : undefined,
      };

      let createdOrUpdatedId: string;

      if (id) {
        await cityApi.update(id, formattedData as UpdateCityDto);
        toast.success('Cidade atualizada com sucesso!');
        createdOrUpdatedId = id;
      } else {
        const createdCity = await cityApi.create(
          formattedData as CreateCityDto,
        );
        toast.success('Cidade criada com sucesso!');
        createdOrUpdatedId = createdCity.id;
      }

      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        const returnWithParams = `${returnUrl}?createdEntity=city&createdId=${createdOrUpdatedId}`;
        navigate(returnWithParams);
      } else {
        navigate('/cities');
      }
    } catch (error: any) {
      console.error('Erro ao salvar cidade:', error);
      toast.error(error.message || 'Ocorreu um erro ao salvar a cidade.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStateCreated = (newState: State) => {
    setStates((prev) => [...prev, newState]);
    form.setValue('estadoId', newState.id);
    setStateDialogOpen(false);
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
        <h1 className="text-2xl font-bold tracking-tight">
          {id ? 'Editar Cidade' : 'Nova Cidade'}
        </h1>
        <Button variant="outline" asChild>
          <Link to="/cities">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>

      <div className="rounded-md border p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        className="cursor-pointer h-11 text-base"
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
                      className="h-11 w-11"
                    >
                      <Search className="h-5 w-5" />
                    </Button>
                  </div>
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
                    Nome da Cidade
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: São Paulo"
                      {...field}
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
                      className="h-11 text-base"
                    />
                  </FormControl>
                  <FormDescription className="text-sm">
                    Código de 7 dígitos do IBGE para o município
                  </FormDescription>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-6 text-base"
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                <Save className="mr-2 h-5 w-5" /> Salvar
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Dialogs */}
      <StateCreationDialog
        open={stateDialogOpen}
        onOpenChange={setStateDialogOpen}
        onSuccess={stateToEdit ? handleStateUpdated : handleStateCreated}
        selectedCountryId=""
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
