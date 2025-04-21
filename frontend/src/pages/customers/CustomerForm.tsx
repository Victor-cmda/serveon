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
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormState } from '@/contexts/FormStateContext';
import { customerApi, cityApi, stateApi, countryApi } from '@/services/api';
import { Country, State, City } from '@/types/location';
import { Customer } from '@/types/customer';
import { toast } from 'sonner';
import { SearchDialog } from '@/components/SearchDialog';

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
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // Reference dialogs
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [stateSearchOpen, setStateSearchOpen] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);

  // Selected reference values
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
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
              const statesData = await stateApi.getAll();
              setStates(statesData);

              // Find the state to get its country
              const state = statesData.find((s) => s.id === city.estadoId);
              if (state && state.paisId) {
                setSelectedCountryId(state.paisId);

                // Load cities for this state
                const citiesData = await cityApi.getByState(city.estadoId);
                setCities(citiesData);
              }
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
                setSelectedCountryId(state.paisId);

                // Load cities for this state
                const citiesData = await cityApi.getByState(city.estadoId);
                setCities(citiesData);
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

  // Load states when country is selected
  useEffect(() => {
    if (selectedCountryId) {
      const loadStates = async () => {
        try {
          const statesData = await stateApi.getByCountry(selectedCountryId);
          setStates(statesData);

          // Clear state and city if country changes
          if (
            selectedStateId &&
            !statesData.some((state) => state.id === selectedStateId)
          ) {
            setSelectedStateId('');
            setCities([]);
            setSelectedCity(null);
            form.setValue('cidadeId', '');
          }
        } catch (error) {
          console.error('Erro ao carregar estados:', error);
          toast.error('Não foi possível carregar a lista de estados');
        }
      };

      loadStates();
    }
  }, [selectedCountryId, selectedStateId, form]);

  // Load cities when state is selected
  useEffect(() => {
    if (selectedStateId) {
      const loadCities = async () => {
        try {
          const citiesData = await cityApi.getByState(selectedStateId);
          setCities(citiesData);

          // Clear city if state changes
          if (
            watchCidadeId &&
            !citiesData.some((city) => city.id === watchCidadeId)
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
    }
  }, [selectedStateId, watchCidadeId, form]);

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

  // Handle country selection
  const onSelectCountry = (country: Country) => {
    setSelectedCountryId(country.id);
    setCountrySearchOpen(false);

    // Clear state and city when country changes
    setSelectedStateId('');
    form.setValue('cidadeId', '');
    setSelectedCity(null);
  };

  // Handle creating a new country
  const onCreateNewCountry = () => {
    saveFormState(formId, form.getValues());
    navigate(
      '/countries/new?returnUrl=' + encodeURIComponent(location.pathname),
    );
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
    saveFormState(formId, form.getValues());

    // Pass the selected country as a parameter
    let url = '/states/new?returnUrl=' + encodeURIComponent(location.pathname);
    if (selectedCountryId) {
      url += '&countryId=' + selectedCountryId;
    }

    navigate(url);
  };

  // Handle city selection
  const onSelectCity = (city: City) => {
    form.setValue('cidadeId', city.id);
    setSelectedCity(city);
    setCitySearchOpen(false);
  };

  // Handle creating a new city
  const onCreateNewCity = () => {
    saveFormState(formId, form.getValues());

    // Pass the selected state as a parameter
    let url = '/cities/new?returnUrl=' + encodeURIComponent(location.pathname);
    if (selectedStateId) {
      url += '&stateId=' + selectedStateId;
    }

    navigate(url);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList>
              <TabsTrigger value="general">Dados Gerais</TabsTrigger>
              <TabsTrigger value="address">Endereço</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
            </TabsList>

            {/* General Information Tab */}
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="rounded-md border p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Tipo de Pessoa</FormLabel>
                        <div className="flex space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="juridica"
                              value="J"
                              checked={field.value === 'J'}
                              onChange={() => field.onChange('J')}
                            />
                            <label htmlFor="juridica">Jurídica</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id="fisica"
                              value="F"
                              checked={field.value === 'F'}
                              onChange={() => field.onChange('F')}
                            />
                            <label htmlFor="fisica">Física</label>
                          </div>
                        </div>
                        <FormMessage />
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
                          <FormLabel>Cliente Estrangeiro</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="cnpjCpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchTipo === 'J' ? 'CNPJ' : 'CPF'}
                          {watchIsEstrangeiro && ' / Documento'}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="razaoSocial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchTipo === 'J' ? 'Razão Social' : 'Nome Completo'}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nomeFantasia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchTipo === 'J' ? 'Nome Fantasia' : 'Apelido'}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="inscricaoEstadual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {watchIsEstrangeiro
                            ? 'Documento adicional'
                            : 'Inscrição Estadual / RG'}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchTipo === 'J' && (
                    <FormField
                      control={form.control}
                      name="inscricaoMunicipal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {watchIsEstrangeiro
                              ? 'Registro comercial'
                              : 'Inscrição Municipal'}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="ativo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Cliente Ativo</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="space-y-4 pt-4">
              <div className="rounded-md border p-4">
                {/* Cascading location selection */}
                <div className="mb-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Localização</h3>
                  </div>

                  {/* Country selection */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">País</label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex w-full items-center gap-2">
                          <Input
                            value={
                              countries.find((c) => c.id === selectedCountryId)
                                ?.nome || ''
                            }
                            readOnly
                            placeholder="Selecione um país"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setCountrySearchOpen(true)}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* State selection - only enabled if country is selected */}
                    <div>
                      <label className="text-sm font-medium">Estado</label>
                      <div className="flex gap-2 mt-1">
                        <div className="flex w-full items-center gap-2">
                          <Input
                            value={
                              states.find((s) => s.id === selectedStateId)
                                ?.nome || ''
                            }
                            readOnly
                            placeholder="Selecione um estado"
                            disabled={!selectedCountryId}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setStateSearchOpen(true)}
                            disabled={!selectedCountryId}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* City selection - only enabled if state is selected */}
                  <FormField
                    control={form.control}
                    name="cidadeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <div className="flex w-full items-center gap-2">
                              <Input
                                value={selectedCity?.nome || ''}
                                readOnly
                                placeholder="Selecione uma cidade"
                                disabled={!selectedStateId}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => setCitySearchOpen(true)}
                                disabled={!selectedStateId}
                              >
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="complemento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="bairro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Contact Tab */}
            <TabsContent value="contact" className="space-y-4 pt-4">
              <div className="rounded-md border p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value)}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
          </div>
        </form>
      </Form>

      {/* Country Search Dialog */}
      <SearchDialog
        open={countrySearchOpen}
        onOpenChange={setCountrySearchOpen}
        title="Selecionar País"
        entities={countries}
        isLoading={isLoading}
        onSelect={onSelectCountry}
        onCreateNew={onCreateNewCountry}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'sigla', header: 'Sigla' },
          { key: 'codigo', header: 'Código' },
        ]}
        searchKeys={['nome', 'sigla', 'codigo']}
      />

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
        ]}
        searchKeys={['nome', 'estadoNome', 'uf', 'codigoIbge']}
      />
    </div>
  );
};

export default CustomerForm;