import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
import { useFormState } from '@/contexts/FormStateContext';
import { customerApi, cityApi, stateApi, countryApi } from '@/services/api';
import { Country, State, City } from '@/types/location';
import { toast } from 'sonner';
import { SearchDialog } from '@/components/SearchDialog';

import StateCreationDialog from '@/components/dialogs/StateCreationDialog';
import CityCreationDialog from '@/components/dialogs/CityCreationDialog';

const formSchema = z.object({
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

  cidadeId: z.string().uuid('Cidade é obrigatória'),

  ativo: z.boolean().default(true),
});

const CustomerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { saveFormState, getFormState } = useFormState();
  const formId = id ? `customer-${id}` : 'customer-new';

  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);

  const [stateSearchOpen, setStateSearchOpen] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);

  const [newCityDialogOpen, setNewCityDialogOpen] = useState(false);
  const [newStateDialogOpen, setNewStateDialogOpen] = useState(false);

  const [selectedStateId, setSelectedStateId] = useState<string>('');

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

  const watchTipo = form.watch('tipo');
  const watchIsEstrangeiro = form.watch('isEstrangeiro');

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

  useEffect(() => {
    if (citySearchOpen && selectedStateId) {
      loadCitiesForState(selectedStateId);
    }
  }, [citySearchOpen, selectedStateId]);

  useEffect(() => {
    const savedState = getFormState(formId);
    if (savedState) {
      form.reset(savedState);

      if (savedState.cidadeId) {
        const cityId = savedState.cidadeId;

        const loadCityData = async () => {
          try {
            const city = await cityApi.getById(cityId);
            setSelectedCity(city);

            if (city.estadoId) {
              setSelectedStateId(city.estadoId);

              const citiesData = await cityApi.getByState(city.estadoId);
              setCities(citiesData);

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

  useEffect(() => {
    const subscription = form.watch((value) => {
      saveFormState(formId, value);
    });
    return () => subscription.unsubscribe();
  }, [form, formId, saveFormState]);

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

  useEffect(() => {
    if (selectedStateId) {
      const loadCities = async () => {
        try {
          const citiesData = await cityApi.getByState(selectedStateId);
          setCities(citiesData);

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
      setCities([]);
      setSelectedCity(null);
      form.setValue('cidadeId', '');
    }
  }, [selectedStateId, form]);

  useEffect(() => {
    if (!id) return;

    const loadCustomer = async () => {
      setIsLoading(true);
      try {
        const customer = await customerApi.getById(id);

        if (customer.cidadeId) {
          try {
            const city = await cityApi.getById(customer.cidadeId);
            setSelectedCity(city);

            if (city.estadoId) {
              setSelectedStateId(city.estadoId);

              const statesData = await stateApi.getAll();
              setStates(statesData);

              const state = statesData.find((s) => s.id === city.estadoId);
              if (state && state.paisId) {
                form.setValue('cidadeId', city.id);
              }
            }
          } catch (error) {
            console.error('Error loading city data:', error);
          }
        }

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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
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

  const onSelectState = (state: State) => {
    setSelectedStateId(state.id);
    setStateSearchOpen(false);

    form.setValue('cidadeId', '');
    setSelectedCity(null);
  };

  const onCreateNewState = () => {
    setNewStateDialogOpen(true);
  };

  const onSelectCity = (city: City) => {
    form.setValue('cidadeId', city.id);
    setSelectedCity(city);
    setCitySearchOpen(false);
  };

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
                render={() => (
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

      <StateCreationDialog
        open={newStateDialogOpen}
        onOpenChange={setNewStateDialogOpen}
        onSuccess={(newState: State) => {
          setSelectedStateId(newState.id);

          loadCitiesForState(newState.id);

          if (newCityDialogOpen) {
            toast.success('Estado criado com sucesso!');
          } else {
            setCitySearchOpen(true);
            toast.success('Estado criado com sucesso!');
          }
        }}
      />

      <CityCreationDialog
        open={newCityDialogOpen}
        onOpenChange={setNewCityDialogOpen}
        onSuccess={(newCity: City) => {
          onSelectCity(newCity);
          toast.success('Cidade criada com sucesso!');
        }}
        selectedStateId={selectedStateId}
      />
    </div>
  );
};

export default CustomerForm;
