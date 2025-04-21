// src/pages/customers/CustomerForm.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormState } from '@/contexts/FormStateContext';
import { customerApi, cityApi, stateApi, countryApi } from '@/services/api';
import { Country, State, City } from '@/types/location';
import { Customer } from '@/types/customer';
import { toast } from 'sonner';
import { SearchDialog } from '@/components/SearchDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// Importar os componentes de diálogo
import StateCreationDialog from '@/components/dialogs/StateCreationDialog';
import CityCreationDialog from '@/components/dialogs/CityCreationDialog';

// Define the schema
const formSchema = z.object({
  // Customer form fields
  cnpjCpf: z.string().min(1, 'Documento é obrigatório'),
  tipo: z.enum(['F', 'J']),
  isEstrangeiro: z.boolean().default(false),
  razaoSocial: z.string().min(2, 'Nome/Razão Social é obrigatório'),
  nomeFantasia: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
  inscricaoMunicipal: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cep: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),

  // Reference field - only city is needed directly
  cidadeId: z.string().uuid('Cidade é obrigatória'),

  // System fields
  ativo: z.boolean().default(true),
});

const CustomerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { saveFormState, getFormState } = useFormState();
  const formId = id ? `customer-${id}` : 'customer-new';

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);

  // Reference dialogs
  const [stateSearchOpen, setStateSearchOpen] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);

  // New dialogs for entity creation
  const [newCityDialogOpen, setNewCityDialogOpen] = useState(false);
  const [newStateDialogOpen, setNewStateDialogOpen] = useState(false);

  // Selected reference values
  const [selectedStateId, setSelectedStateId] = useState<string>('');

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cnpjCpf: '',
      tipo: 'J',
      isEstrangeiro: false,
      razaoSocial: '',
      nomeFantasia: '',
      inscricaoEstadual: '',
      inscricaoMunicipal: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cep: '',
      telefone: '',
      email: '',
      cidadeId: '',
      ativo: true,
    },
  });

  // Watch values for conditional rendering
  const watchTipo = form.watch('tipo');
  const watchIsEstrangeiro = form.watch('isEstrangeiro');
  const watchCidadeId = form.watch('cidadeId');

  // Load all cities
  const fetchCities = async () => {
    try {
      setIsLoading(true);
      const citiesData = await cityApi.getAll();
      setCities(citiesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      toast.error('Não foi possível carregar a lista de cidades');
    } finally {
      setIsLoading(false);
    }
  };

  // Load cities for a specific state
  const loadCitiesForState = async (stateId: string) => {
    try {
      setIsLoading(true);
      const citiesData = await cityApi.getByState(stateId);
      setCities(citiesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      toast.error('Não foi possível carregar a lista de cidades');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra as cidades por estado quando o diálogo é aberto
  useEffect(() => {
    if (citySearchOpen && selectedStateId) {
      loadCitiesForState(selectedStateId);
    }
  }, [citySearchOpen, selectedStateId]);

  // Load saved form state if available
  useEffect(() => {
    const savedState = getFormState(formId);
    if (savedState) {
      form.reset(savedState);

      // If there's a selected city in the form, find its data
      if (savedState.cidadeId) {
        const cityId = savedState.cidadeId;

        // Load the city data
        const loadCityData = async () => {
          try {
            const city = await cityApi.getById(cityId);
            setSelectedCity(city);

            // Load state data
            if (city.estadoId) {
              setSelectedStateId(city.estadoId);

              // Load cities for the city's state
              const citiesData = await cityApi.getByState(city.estadoId);
              setCities(citiesData);

              // Load all states for reference
              const statesData = await stateApi.getAll();
              setStates(statesData);
            }
          } catch (error) {
            console.error('Error loading saved city data:', error);
          }
        };

        loadCityData();
      }
    }
  }, [formId, getFormState, form]);

  // Save form state when values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      saveFormState(formId, value);
    });
    return () => subscription.unsubscribe();
  }, [form, formId, saveFormState]);

  // Load all countries initially
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countriesData = await countryApi.getAll();
        setCountries(countriesData);
      } catch (error) {
        console.error('Erro ao carregar países:', error);
        toast.error('Não foi possível carregar a lista de países');
      }
    };

    loadCountries();
  }, []);

  // Load all states initially
  useEffect(() => {
    const loadStates = async () => {
      try {
        const statesData = await stateApi.getAll();
        setStates(statesData);
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
        toast.error('Não foi possível carregar a lista de estados');
      }
    };

    loadStates();
  }, []);

  // Load cities when state is selected
  useEffect(() => {
    if (selectedStateId) {
      const loadCities = async () => {
        try {
          const citiesData = await cityApi.getByState(selectedStateId);
          setCities(citiesData);

          // Clear city if state changes and current city doesn't belong to this state
          const currentCityId = form.getValues('cidadeId');
          if (
            currentCityId &&
            !citiesData.some((city) => city.id === currentCityId)
          ) {
            form.setValue('cidadeId', '');
            setSelectedCity(null);
          }
        } catch (error) {
          console.error('Erro ao carregar cidades:', error);
          toast.error('Não foi possível carregar a lista de cidades');
        }
      };

      loadCities();
    } else {
      // If no state is selected, clear cities
      setCities([]);
      setSelectedCity(null);
      form.setValue('cidadeId', '');
    }
  }, [selectedStateId, form]);

  // Load customer data if editing
  useEffect(() => {
    if (!id) return;

    const loadCustomer = async () => {
      setIsLoading(true);
      try {
        const customer = await customerApi.getById(id);

        // Load city data to get state and country
        if (customer.cidadeId) {
          try {
            const city = await cityApi.getById(customer.cidadeId);
            setSelectedCity(city);

            if (city.estadoId) {
              setSelectedStateId(city.estadoId);

              // Load states
              const statesData = await stateApi.getAll();
              setStates(statesData);

              // Find the state to get its country
              const state = statesData.find((s) => s.id === city.estadoId);
              if (state && state.paisId) {
                form.setValue('cidadeId', city.id);
              }
            }
          } catch (error) {
            console.error('Error loading city data:', error);
          }
        }

        // Set form data
        form.reset({
          cnpjCpf: customer.cnpjCpf,
          tipo: customer.tipo,
          isEstrangeiro: customer.isEstrangeiro || false,
          razaoSocial: customer.razaoSocial,
          nomeFantasia: customer.nomeFantasia || '',
          inscricaoEstadual: customer.inscricaoEstadual || '',
          inscricaoMunicipal: customer.inscricaoMunicipal || '',
          endereco: customer.endereco || '',
          numero: customer.numero || '',
          complemento: customer.complemento || '',
          bairro: customer.bairro || '',
          cep: customer.cep || '',
          telefone: customer.telefone || '',
          email: customer.email || '',
          cidadeId: customer.cidadeId,
          ativo: customer.ativo,
        });
      } catch (error) {
        console.error('Erro ao carregar cliente:', error);
        toast.error('Não foi possível carregar os dados do cliente');
        navigate('/customers');
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomer();
  }, [id, navigate, form]);

  // Handle form submission
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      // Create a sanitized version of the data with nulls converted to undefined
      const formattedData = {
        ...data,
        email: data.email || undefined,
      };

      if (id) {
        await customerApi.update(id, formattedData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await customerApi.create(formattedData);
        toast.success('Cliente criado com sucesso!');
      }

      navigate('/customers');
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      toast.error(error.message || 'Ocorreu um erro ao salvar o cliente');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle state selection
  const onSelectState = (state: State) => {
    setSelectedStateId(state.id);
    setStateSearchOpen(false);

    // Clear city when state changes
    form.setValue('cidadeId', '');
    setSelectedCity(null);
  };

  // Handle creating a new state
  const onCreateNewState = () => {
    setNewStateDialogOpen(true);
  };

  // Handle city selection
  const onSelectCity = (city: City) => {
    form.setValue('cidadeId', city.id);
    setSelectedCity(city);
    setCitySearchOpen(false);
  };

  // Handle creating a new city
  const onCreateNewCity = () => {
    setNewCityDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {id ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
        <Button variant="outline" asChild>
          <Link to="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Gerais */}
          <div className="rounded-md border p-6">
            <h2 className="mb-6 text-lg font-semibold">Dados Gerais</h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-base font-medium">
                      Tipo de Pessoa
                    </FormLabel>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="juridica"
                          value="J"
                          checked={field.value === 'J'}
                          onChange={() => field.onChange('J')}
                        />
                        <label htmlFor="juridica" className="text-base">
                          Jurídica
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="fisica"
                          value="F"
                          checked={field.value === 'F'}
                          onChange={() => field.onChange('F')}
                        />
                        <label htmlFor="fisica" className="text-base">
                          Física
                        </label>
                      </div>
                    </div>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isEstrangeiro"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-base font-medium">
                        Cliente Estrangeiro
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-base font-medium">
                        Cliente Ativo
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="cnpjCpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {watchTipo === 'J' ? 'CNPJ' : 'CPF'}
                      {watchIsEstrangeiro && ' / Documento'}
                    </FormLabel>
                    <FormControl>
                      <Input
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
                name="inscricaoEstadual"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {watchIsEstrangeiro
                        ? 'Documento adicional'
                        : 'Inscrição Estadual / RG'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        className="h-11 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="razaoSocial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {watchTipo === 'J' ? 'Razão Social' : 'Nome Completo'}
                    </FormLabel>
                    <FormControl>
                      <Input
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
                name="nomeFantasia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      {watchTipo === 'J' ? 'Nome Fantasia' : 'Apelido'}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        className="h-11 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>

            {watchTipo === 'J' && (
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="inscricaoMunicipal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        {watchIsEstrangeiro
                          ? 'Registro comercial'
                          : 'Inscrição Municipal'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="h-11 text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          {/* Endereço */}
          <div className="rounded-md border p-6">
            <h2 className="mb-6 text-lg font-semibold">Endereço</h2>

            {/* Seleção de localização */}
            <div className="mb-6">
              <FormField
                control={form.control}
                name="cidadeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Cidade
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <div className="flex w-full items-center gap-2">
                          <Input
                            value={selectedCity?.nome || ''}
                            readOnly
                            placeholder="Selecione uma cidade"
                            className="cursor-pointer h-11 text-base"
                            onClick={() => setCitySearchOpen(true)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setCitySearchOpen(true)}
                            className="h-11 w-11"
                          >
                            <Search className="h-5 w-5" />
                          </Button>
                        </div>
                      </FormControl>
                    </div>
                    {selectedCity && (
                      <FormDescription className="text-sm">
                        {selectedCity.estadoNome} / {selectedCity.uf}{' '}
                        {selectedCity.paisNome
                          ? `- ${selectedCity.paisNome}`
                          : ''}
                      </FormDescription>
                    )}
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Endereço
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        className="h-11 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Número
                      </FormLabel>
                      <FormControl>
                        <Input
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
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Complemento
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isLoading}
                          className="h-11 text-base"
                        />
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="bairro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Bairro
                    </FormLabel>
                    <FormControl>
                      <Input
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
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">CEP</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isLoading}
                        className="h-11 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Contato */}
          <div className="rounded-md border p-6">
            <h2 className="mb-6 text-lg font-semibold">Contato</h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Telefone
                    </FormLabel>
                    <FormControl>
                      <Input
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={isLoading}
                        className="h-11 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>
          </div>

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

      {/* State Search Dialog */}
      <SearchDialog
        open={stateSearchOpen}
        onOpenChange={setStateSearchOpen}
        title="Selecionar Estado"
        entities={states}
        isLoading={isLoading}
        onSelect={onSelectState}
        onCreateNew={onCreateNewState}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'uf', header: 'UF' },
          { key: 'paisNome', header: 'País' },
        ]}
        searchKeys={['nome', 'uf', 'paisNome']}
        entityType="estados"
      />

      {/* City Search Dialog */}
      <SearchDialog
        open={citySearchOpen}
        onOpenChange={setCitySearchOpen}
        title="Selecionar Cidade"
        entities={cities}
        isLoading={isLoading}
        onSelect={onSelectCity}
        onCreateNew={onCreateNewCity}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'estadoNome', header: 'Estado' },
          { key: 'uf', header: 'UF' },
          { key: 'codigoIbge', header: 'Código IBGE' },
          { key: 'paisNome', header: 'País' },
        ]}
        searchKeys={['nome', 'estadoNome', 'uf', 'codigoIbge', 'paisNome']}
        entityType="cidades"
        extraActions={
          <div className="flex gap-2">
            {selectedStateId ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStateSearchOpen(true);
                  setCitySearchOpen(false);
                }}
              >
                Estado:{' '}
                {states.find((s) => s.id === selectedStateId)?.nome ||
                  'Selecionado'}
              </Button>
            ) : (
              <></>
            )}

            {selectedStateId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStateId('');
                  fetchCities();
                }}
              >
                Limpar Filtro
              </Button>
            )}
          </div>
        }
        description="Selecione uma cidade para o cadastro do cliente. Você pode filtrar por estado ou pesquisar pelo nome da cidade, código IBGE ou UF."
      />

      {/* New State Dialog */}
      <StateCreationDialog
        open={newStateDialogOpen}
        onOpenChange={setNewStateDialogOpen}
        onSuccess={(newState: State) => {
          // Select the newly created state
          setSelectedStateId(newState.id);

          // Load cities for this state
          loadCitiesForState(newState.id);

          // Verify if we came from the city dialog
          if (newCityDialogOpen) {
            // We're creating a state from the city dialog
            toast.success('Estado criado com sucesso!');
          } else {
            // We're creating a state from the state search dialog
            setCitySearchOpen(true);
            toast.success('Estado criado com sucesso!');
          }
        }}
      />

      {/* New City Dialog */}
      <CityCreationDialog
        open={newCityDialogOpen}
        onOpenChange={setNewCityDialogOpen}
        onSuccess={(newCity: City) => {
          // Select the newly created city
          onSelectCity(newCity);
          toast.success('Cidade criada com sucesso!');
        }}
        selectedStateId={selectedStateId}
      />
    </div>
  );
};

export default CustomerForm;
