import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { customerApi, cityApi, stateApi, paymentTermApi } from '@/services/api';
import { State, City } from '@/types/location';
import { PaymentTerm } from '@/types/payment-term';
import { toast } from 'sonner';
import { SearchDialog } from '@/components/SearchDialog';
import { Form } from '@/components/ui/form';

import StateCreationDialog from '@/components/dialogs/StateCreationDialog';
import CityCreationDialog from '@/components/dialogs/CityCreationDialog';
import PaymentTermCreationDialog from '@/components/dialogs/PaymentTermCreationDialog';

// Importa os componentes modulares
import GeneralDataSection from './components/GeneralDataSection';
import AddressSection from './components/AddressSection';
import ContactSection from './components/ContactSection';
import DocumentsSection from './components/DocumentsSection';
import PaymentSection from './components/PaymentSection';

// Formatadores de texto
const formatters = {
  cpf: (value: string | undefined): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    const cpf = digits.slice(0, 11);
    return cpf.replace(
      /(\d{3})(\d{3})(\d{3})(\d{0,2})/,
      (_, p1, p2, p3, p4) => {
        if (p4) return `${p1}.${p2}.${p3}-${p4}`;
        if (p3) return `${p1}.${p2}.${p3}`;
        if (p2) return `${p1}.${p2}`;
        return p1;
      },
    );
  },
  cnpj: (value: string | undefined): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    const cnpj = digits.slice(0, 14);
    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,
      (_, p1, p2, p3, p4, p5) => {
        if (p5) return `${p1}.${p2}.${p3}/${p4}-${p5}`;
        if (p4) return `${p1}.${p2}.${p3}/${p4}`;
        if (p3) return `${p1}.${p2}.${p3}`;
        if (p2) return `${p1}.${p2}`;
        return p1;
      },
    );
  },
  telefone: (value: string | undefined): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    const tel = digits.slice(0, 11);
    if (tel.length > 10) {
      return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else {
      return tel.replace(/(\d{2})(\d{4})(\d{0,4})/, (_, p1, p2, p3) => {
        if (p3) return `(${p1}) ${p2}-${p3}`;
        if (p2) return `(${p1}) ${p2}`;
        if (p1.length === 2) return `(${p1})`;
        return p1;
      });
    }
  },
  cep: (value: string | undefined): string => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    const cep = digits.slice(0, 8);
    return cep.replace(/(\d{5})(\d{0,3})/, (_, p1, p2) => {
      if (p2) return `${p1}-${p2}`;
      return p1;
    });
  },
  numero: (value: string | undefined): string => {
    if (!value) return '';
    return value.replace(/[^0-9a-zA-Z/-]/g, '');
  },
  inscricaoEstadual: (value: string | undefined): string => {
    if (!value) return '';
    return value.replace(/[^\w]/g, '');
  },
  clearFormat: (value: string | undefined): string => {
    if (!value) return '';
    return value.replace(/\D/g, '');
  },
};

const formSchema = z.object({
  id: z.number().optional(),
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
  cidadeId: z.number().optional(),
  ativo: z.boolean().default(true),
  condicaoPagamentoId: z.number().optional(),
});

const CustomerForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [selectedPaymentTerm, setSelectedPaymentTerm] =
    useState<PaymentTerm | null>(null);

  const [stateSearchOpen, setStateSearchOpen] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [paymentTermSearchOpen, setPaymentTermSearchOpen] = useState(false);
  const [newCityDialogOpen, setNewCityDialogOpen] = useState(false);
  const [newStateDialogOpen, setNewStateDialogOpen] = useState(false);
  const [paymentTermDialogOpen, setPaymentTermDialogOpen] = useState(false);

  const [selectedStateId, setSelectedStateId] = useState<number>();

  const [stateToEdit, setStateToEdit] = useState<State | null>(null);
  const [cityToEdit, setCityToEdit] = useState<City | null>(null);
  const [paymentTermToEdit, setPaymentTermToEdit] =
    useState<PaymentTerm | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: id ? Number(id) : undefined,
      cnpjCpf: '',
      tipo: 'J' as const,
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
      cidadeId: undefined,
      ativo: true,
      condicaoPagamentoId: undefined,
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
  const loadCitiesForState = async (stateId: number) => {
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
    const fetchCustomer = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const customer = await customerApi.getById(Number(id));
        form.reset({
          id: customer.id || 0,
          cnpjCpf: customer.cnpjCpf || '',
          tipo: customer.tipo || 'J',
          isEstrangeiro: Boolean(customer.isEstrangeiro),
          razaoSocial: customer.razaoSocial || '',
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
          cidadeId: customer.cidadeId || undefined,
          ativo: Boolean(customer.ativo),
          condicaoPagamentoId: customer.condicaoPagamentoId || undefined,
        }); // Load city data if available
        if (customer.cidadeId) {
          try {
            const cityData = await cityApi.getById(customer.cidadeId);
            setSelectedCity(cityData);

            if (cityData.estadoId) {
              setSelectedStateId(cityData.estadoId);
              const citiesData = await cityApi.getByState(cityData.estadoId);
              setCities(citiesData);
            }
          } catch (error) {
            console.error('Error loading city data:', error);
          }
        }

        // Load payment term data if available
        if (customer.condicaoPagamentoId) {
          try {
            const paymentTermData = await paymentTermApi.getById(
              customer.condicaoPagamentoId,
            );
            setSelectedPaymentTerm(paymentTermData);
          } catch (error) {
            console.error('Error loading payment term data:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching customer:', error);
        toast.error('Não foi possível carregar os dados do cliente');
        navigate('/customers');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchCustomer();
    } else {
      form.reset({
        id: 0,
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
        cidadeId: undefined,
        ativo: true,
        condicaoPagamentoId: undefined,
      });
      setSelectedCity(null);
      setSelectedStateId(undefined);
      setSelectedPaymentTerm(null);
    }
  }, [id, navigate, form]);
  useEffect(() => {
    if (selectedStateId) {
      const loadCities = async () => {
        try {
          setIsLoading(true);
          const citiesData = await cityApi.getByState(selectedStateId);
          setCities(citiesData);
        } catch (error) {
          console.error('Erro ao carregar cidades:', error);
          toast.error('Não foi possível carregar a lista de cidades');
        } finally {
          setIsLoading(false);
        }
      };

      loadCities();
    } else if (citySearchOpen) {
      fetchCities();
    }
  }, [selectedStateId, citySearchOpen]);

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

  // Carregar condições de pagamento
  useEffect(() => {
    const fetchPaymentTerms = async () => {
      try {
        const terms = await paymentTermApi.getAll();
        setPaymentTerms(terms.filter((term) => term.isActive));
      } catch (error) {
        console.error('Erro ao carregar condições de pagamento:', error);
        toast.error('Não foi possível carregar as condições de pagamento');
      }
    };

    fetchPaymentTerms();
  }, []);

  // Funções para manipulação da condição de pagamento
  const onCreateNewPaymentTerm = () => {
    setPaymentTermToEdit(null);
    setPaymentTermSearchOpen(false);
    setPaymentTermDialogOpen(true);
  };

  const handleEditPaymentTerm = (paymentTerm: PaymentTerm) => {
    setPaymentTermToEdit(paymentTerm);
    setPaymentTermSearchOpen(false);
    setPaymentTermDialogOpen(true);
  };
  const handlePaymentTermCreated = (newPaymentTerm: PaymentTerm) => {
    setPaymentTerms((prev) => [...prev, newPaymentTerm]);
    setPaymentTermDialogOpen(false);
    setPaymentTermSearchOpen(true);
    toast.success(
      `Condição de pagamento ${newPaymentTerm.name} criada com sucesso! Selecione-o na lista.`,
    );
  };

  const handlePaymentTermUpdated = (updatedPaymentTerm: PaymentTerm) => {
    setPaymentTerms((prev) =>
      prev.map((term) =>
        term.id === updatedPaymentTerm.id ? updatedPaymentTerm : term,
      ),
    );

    if (
      selectedPaymentTerm &&
      selectedPaymentTerm.id === updatedPaymentTerm.id
    ) {
      setSelectedPaymentTerm(updatedPaymentTerm);
    }

    setPaymentTermToEdit(null);
    toast.success(
      `Condição de pagamento ${updatedPaymentTerm.name} atualizada com sucesso!`,
    );
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!data.cidadeId) {
      toast.error('Por favor, selecione uma cidade antes de salvar');
      return;
    }

    setIsLoading(true);

    try {
      const formattedData = {
        ...data,
        id: data.id ? Number(data.id) : undefined,
        cnpjCpf: formatters.clearFormat(data.cnpjCpf),
        email: data.email?.trim() || undefined,
        nomeFantasia: data.nomeFantasia?.trim() || undefined,
        inscricaoEstadual:
          formatters.inscricaoEstadual(data.inscricaoEstadual) || undefined,
        inscricaoMunicipal:
          formatters.inscricaoEstadual(data.inscricaoMunicipal) || undefined,
        endereco: data.endereco?.trim() || undefined,
        numero: data.numero?.trim() || undefined,
        complemento: data.complemento?.trim() || undefined,
        bairro: data.bairro?.trim() || undefined,
        cep: formatters.clearFormat(data.cep) || undefined,
        telefone: formatters.clearFormat(data.telefone) || undefined,
        cidadeId: data.cidadeId,
        condicaoPagamentoId: data.condicaoPagamentoId || undefined,
      };
      if (id) {
        await customerApi.update(Number(id), formattedData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await customerApi.create(formattedData);
        toast.success('Cliente criado com sucesso!');
        form.reset({
          id: 0,
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
          cidadeId: undefined,
          ativo: true,
          condicaoPagamentoId: undefined,
        });
        setSelectedCity(null);
        setSelectedStateId(undefined);
      }

      // Check if we need to return to a parent form in a cascading scenario
      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate('/customers');
      }
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

    form.setValue('cidadeId', undefined);
    setSelectedCity(null);
  };

  const onCreateNewState = () => {
    setNewStateDialogOpen(true);
  };

  const onSelectCity = (city: City) => {
    if (!city || !city.id) {
      toast.error('Cidade inválida selecionada');
      return;
    }

    try {
      form.setValue('cidadeId', city.id, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      setSelectedCity(city);

      if (city.estadoId) {
        setSelectedStateId(city.estadoId);
      }

      const isForeignCountry =
        city.paisNome?.toUpperCase() !== 'BRASIL' &&
        city.paisNome?.toUpperCase() !== 'BRAZIL';
      form.setValue('isEstrangeiro', isForeignCountry, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      setCitySearchOpen(false);
    } catch (error) {
      console.error('Erro ao selecionar cidade:', error);
      toast.error('Ocorreu um erro ao selecionar a cidade');
    }
  };

  const onCreateNewCity = () => {
    setNewCityDialogOpen(true);
  };

  const handleEditCity = (city: City) => {
    setCityToEdit(city);
    setCitySearchOpen(false);
    setNewCityDialogOpen(true);
  };

  const handleEditState = (state: State) => {
    setStateToEdit(state);
    setStateSearchOpen(false);
    setNewStateDialogOpen(true);
  };

  const handleCityUpdated = (updatedCity: City) => {
    setCities((prev) =>
      prev.map((city) => (city.id === updatedCity.id ? updatedCity : city)),
    );

    if (selectedCity && selectedCity.id === updatedCity.id) {
      setSelectedCity(updatedCity);
    }

    setCityToEdit(null);
  };

  const handleStateUpdated = (updatedState: State) => {
    setStates((prev) =>
      prev.map((state) =>
        state.id === updatedState.id ? updatedState : state,
      ),
    );
    setStateToEdit(null);
  };

  const onSelectPaymentTerm = (paymentTerm: PaymentTerm) => {
    if (!paymentTerm || !paymentTerm.id) {
      toast.error('Condição de pagamento inválida selecionada');
      return;
    }

    try {
      form.setValue('condicaoPagamentoId', paymentTerm.id, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      setSelectedPaymentTerm(paymentTerm);
      setPaymentTermSearchOpen(false);
    } catch (error) {
      console.error('Erro ao selecionar condição de pagamento:', error);
      toast.error('Ocorreu um erro ao selecionar a condição de pagamento');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {id ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {id
              ? 'Atualize as informações do cliente conforme necessário'
              : 'Preencha as informações para cadastrar um novo cliente'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link to="/customers">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
        </div>
      </div>{' '}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="border rounded-lg p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-y-6">
              <div>
                <GeneralDataSection
                  form={form}
                  isLoading={isLoading}
                  watchTipo={watchTipo}
                  id={id}
                />
              </div>
              <div>
                <AddressSection
                  form={form}
                  isLoading={isLoading}
                  formatters={formatters}
                  selectedCity={selectedCity}
                  watchIsEstrangeiro={watchIsEstrangeiro}
                  setCitySearchOpen={setCitySearchOpen}
                />
              </div>
              <div>
                <ContactSection
                  form={form}
                  isLoading={isLoading}
                  formatters={formatters}
                />
              </div>
              <div>
                <DocumentsSection
                  form={form}
                  isLoading={isLoading}
                  formatters={formatters}
                  watchTipo={watchTipo}
                  watchIsEstrangeiro={watchIsEstrangeiro}
                />
              </div>{' '}
              <div>
                <PaymentSection
                  form={form}
                  isLoading={isLoading}
                  selectedPaymentTerm={selectedPaymentTerm}
                  setPaymentTermSearchOpen={setPaymentTermSearchOpen}
                />
              </div>
              <div className="flex justify-end pt-4 mt-2 border-t">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-10 px-6 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Salvar Cliente
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
      <SearchDialog
        open={stateSearchOpen}
        onOpenChange={setStateSearchOpen}
        title="Selecionar Estado"
        entities={states}
        isLoading={isLoading}
        onSelect={onSelectState}
        onCreateNew={onCreateNewState}
        onEdit={handleEditState}
        displayColumns={[
          { key: 'nome', header: 'Nome' },
          { key: 'uf', header: 'UF' },
          { key: 'paisNome', header: 'País' },
        ]}
        searchKeys={['nome', 'uf', 'paisNome']}
        entityType="estados"
        description="Selecione um estado para o cadastro do cliente ou edite um estado existente."
      />
      <SearchDialog
        open={citySearchOpen}
        onOpenChange={(open) => {
          setCitySearchOpen(open);
          if (!open && selectedStateId) {
          }
        }}
        title="Selecionar Cidade"
        entities={cities}
        isLoading={isLoading}
        onSelect={(city) => {
          onSelectCity(city);
        }}
        onCreateNew={onCreateNewCity}
        onEdit={handleEditCity}
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
            )}{' '}
            {selectedStateId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStateId(undefined);
                  fetchCities();
                }}
              >
                Limpar Filtro
              </Button>
            )}
          </div>
        }
        description="Selecione uma cidade para o cadastro do cliente ou edite uma cidade existente. Você pode filtrar por estado ou pesquisar pelo nome da cidade, código IBGE ou UF."
      />
      <StateCreationDialog
        open={newStateDialogOpen}
        onOpenChange={setNewStateDialogOpen}
        onSuccess={
          stateToEdit
            ? handleStateUpdated
            : (newState: State) => {
                setSelectedStateId(newState.id);
                loadCitiesForState(newState.id);

                if (newCityDialogOpen) {
                  toast.success('Estado criado com sucesso!');
                } else {
                  setCitySearchOpen(true);
                  toast.success('Estado criado com sucesso!');
                }
              }
        }
        state={stateToEdit}
      />
      <CityCreationDialog
        open={newCityDialogOpen}
        onOpenChange={setNewCityDialogOpen}
        onSuccess={
          cityToEdit
            ? handleCityUpdated
            : (newCity: City) => {
                setCities((prev) => [...prev, newCity]);
                setNewCityDialogOpen(false);
                setCitySearchOpen(true);
                toast.success(
                  `Cidade ${newCity.nome} criada com sucesso! Selecione-a na lista.`,
                );
              }
        }
        selectedStateId={selectedStateId}
        city={cityToEdit}
      />
      {/* Payment Term Search Dialog */}
      <SearchDialog
        open={paymentTermSearchOpen}
        onOpenChange={setPaymentTermSearchOpen}
        title="Selecionar Condição de Pagamento"
        entities={paymentTerms}
        isLoading={isLoading}
        onSelect={onSelectPaymentTerm}
        onCreateNew={onCreateNewPaymentTerm}
        onEdit={handleEditPaymentTerm}
        displayColumns={[
          { key: 'name', header: 'Nome' },
          { key: 'description', header: 'Descrição' },
          {
            key: (term) => term.installments.length.toString(),
            header: 'Parcelas',
          },
        ]}
        searchKeys={['name', 'description']}
        entityType="condicoes de pagamento"
        description="Selecione uma condição de pagamento para o cadastro do cliente ou cadastre uma nova."
      />
      <PaymentTermCreationDialog
        open={paymentTermDialogOpen}
        onOpenChange={setPaymentTermDialogOpen}
        onSuccess={
          paymentTermToEdit
            ? handlePaymentTermUpdated
            : handlePaymentTermCreated
        }
        paymentTerm={paymentTermToEdit}
      />
    </div>
  );
};

export default CustomerForm;
