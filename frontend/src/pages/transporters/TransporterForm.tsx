import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { transporterApi, cityApi, stateApi } from '@/services/api';
import { State, City } from '@/types/location';
import { toast } from 'sonner';
import { SearchDialog } from '@/components/SearchDialog';
import { Form } from '@/components/ui/form';
import AuditSection from '@/components/AuditSection';

import StateCreationDialog from '@/components/dialogs/StateCreationDialog';
import CityCreationDialog from '@/components/dialogs/CityCreationDialog';

// Importa os componentes modulares
import GeneralDataSection from './components/GeneralDataSection';
import DocumentsSection from './components/DocumentsSection';
import AddressSection from './components/AddressSection';
import ContactSection from './components/ContactSection';
import ObservationsSection from './components/ObservationsSection';

// Importa os utilitários de validação
import { formatters, validateCNPJ } from './utils/validationUtils';

const formSchema = z.object({
  id: z.number().optional(),
  cnpj: z.string()
    .min(1, 'CNPJ é obrigatório')
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length === 14;
    }, 'CNPJ deve ter 14 dígitos')
    .refine((value) => validateCNPJ(value), 'CNPJ inválido'),
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .refine((value) => value.trim().length > 0, 'Nome é obrigatório'),
  nomeFantasia: z.string()
    .max(100, 'Nome fantasia deve ter no máximo 100 caracteres')
    .optional(),
  paisId: z.number().optional(),
  estadoId: z.number().optional(),
  cidadeId: z.number().optional(),
  endereco: z.string()
    .max(100, 'Endereço deve ter no máximo 100 caracteres')
    .optional(),
  numero: z.string()
    .max(10, 'Número deve ter no máximo 10 caracteres')
    .optional(),
  complemento: z.string()
    .max(50, 'Complemento deve ter no máximo 50 caracteres')
    .optional(),
  bairro: z.string()
    .max(50, 'Bairro deve ter no máximo 50 caracteres')
    .optional(),
  cep: z.string()
    .optional()
    .refine((value) => {
      if (!value) return true;
      const digits = value.replace(/\D/g, '');
      return digits.length === 0 || digits.length === 8;
    }, 'CEP deve ter 8 dígitos'),
  website: z.string()
    .max(100, 'Website deve ter no máximo 100 caracteres')
    .optional()
    .refine((value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }, 'Website deve ser uma URL válida'),
  observacoes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional(),
  ativo: z.boolean().default(true),
});

const TransporterForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [transporterData, setTransporterData] = useState<any>(null);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const [stateSearchOpen, setStateSearchOpen] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [newCityDialogOpen, setNewCityDialogOpen] = useState(false);
  const [newStateDialogOpen, setNewStateDialogOpen] = useState(false);

  const [selectedStateId, setSelectedStateId] = useState<number>();

  const [stateToEdit, setStateToEdit] = useState<State | null>(null);
  const [cityToEdit, setCityToEdit] = useState<City | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: id ? Number(id) : undefined,
      cnpj: '',
      nome: '',
      nomeFantasia: '',
      paisId: undefined,
      estadoId: undefined,
      cidadeId: undefined,
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cep: '',
      website: '',
      observacoes: '',
      ativo: true,
    },
  });

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
    const fetchTransporter = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const transporter = await transporterApi.getById(Number(id));
        setTransporterData(transporter);
        form.reset({
          id: transporter.id || 0,
          cnpj: transporter.cnpj || '',
          nome: transporter.nome || '',
          nomeFantasia: transporter.nomeFantasia || '',
          paisId: transporter.paisId || undefined,
          estadoId: transporter.estadoId || undefined,
          cidadeId: transporter.cidadeId || undefined,
          endereco: transporter.endereco || '',
          numero: transporter.numero || '',
          complemento: transporter.complemento || '',
          bairro: transporter.bairro || '',
          cep: transporter.cep || '',
          website: transporter.website || '',
          observacoes: transporter.observacoes || '',
          ativo: Boolean(transporter.ativo),
        });

        // Load city data if available
        if (transporter.cidadeId) {
          try {
            const cityData = await cityApi.getById(transporter.cidadeId);
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
      } catch (error) {
        console.error('Error fetching transporter:', error);
        toast.error('Não foi possível carregar os dados da transportadora');
        navigate('/transporters');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTransporter();
    } else {
      form.reset({
        id: 0,
        cnpj: '',
        nome: '',
        nomeFantasia: '',
        paisId: undefined,
        estadoId: undefined,
        cidadeId: undefined,
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cep: '',
        website: '',
        observacoes: '',
        ativo: true,
      });
      setSelectedCity(null);
      setSelectedStateId(undefined);
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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const formattedData = {
        ...data,
        id: data.id ? Number(data.id) : undefined,
        cnpj: formatters.clearFormat(data.cnpj),
        nome: data.nome?.trim(),
        nomeFantasia: data.nomeFantasia?.trim() || undefined,
        endereco: data.endereco?.trim() || undefined,
        numero: data.numero?.trim() || undefined,
        complemento: data.complemento?.trim() || undefined,
        bairro: data.bairro?.trim() || undefined,
        cep: formatters.clearFormat(data.cep) || undefined,
        website: data.website?.trim() || undefined,
        observacoes: data.observacoes?.trim() || undefined,
        cidadeId: data.cidadeId,
      };

      if (id) {
        await transporterApi.update(Number(id), formattedData);
        toast.success('Transportadora atualizada com sucesso!');
      } else {
        await transporterApi.create(formattedData);
        toast.success('Transportadora criada com sucesso!');
        form.reset({
          id: 0,
          cnpj: '',
          nome: '',
          nomeFantasia: '',
          paisId: undefined,
          estadoId: undefined,
          cidadeId: undefined,
          endereco: '',
          numero: '',
          complemento: '',
          bairro: '',
          cep: '',
          website: '',
          observacoes: '',
          ativo: true,
        });
        setSelectedCity(null);
        setSelectedStateId(undefined);
      }

      // Check if we need to return to a parent form in a cascading scenario
      const returnUrl = new URLSearchParams(location.search).get('returnUrl');
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate('/transporters');
      }
    } catch (error: unknown) {
      console.error('Erro ao salvar transportadora:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao salvar a transportadora';
      toast.error(errorMessage);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/transporters">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {id ? 'Editar Transportadora' : 'Nova Transportadora'}
            </h1>
            <p className="text-muted-foreground">
              {id
                ? 'Edite as informações da transportadora abaixo'
                : 'Preencha as informações para criar uma nova transportadora'}
            </p>
          </div>
        </div>

        {/* AuditSection no header - não ocupa espaço do formulário */}
        <AuditSection
          form={form}
          data={{
            id: id ? transporterData?.id : undefined,
            ativo: form.watch('ativo'),
            createdAt: transporterData?.createdAt,
            updatedAt: transporterData?.updatedAt,
          }}
          variant="header"
          isEditing={!!id}
          statusFieldName="ativo" // Campo de status é 'ativo' para Transporter
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                Informações da Transportadora
              </h3>
              <p className="text-sm text-muted-foreground">
                Preencha todas as informações necessárias da transportadora
              </p>
            </div>
            <div className="p-6 pt-0 space-y-6">
              <GeneralDataSection
                form={form}
                isLoading={isLoading}
                id={id}
                formatters={formatters}
              />

              <AddressSection
                form={form}
                isLoading={isLoading}
                formatters={formatters}
                selectedCity={selectedCity}
                setCitySearchOpen={setCitySearchOpen}
                setSelectedCity={setSelectedCity}
              />

              <ContactSection
                form={form}
                isLoading={isLoading}
                formatters={formatters}
              />

              <DocumentsSection
                form={form}
                isLoading={isLoading}
                formatters={formatters}
              />

              <ObservationsSection
                form={form}
                isLoading={isLoading}
                formatters={formatters}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link to="/transporters">
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
        description="Selecione um estado para o cadastro da transportadora ou edite um estado existente."
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
          { key: 'id', header: 'Código' },
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
        description="Selecione uma cidade para o cadastro da transportadora ou edite uma cidade existente. Você pode filtrar por estado ou pesquisar pelo nome da cidade, código IBGE ou UF."
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
    </div>
  );
};

export default TransporterForm;
