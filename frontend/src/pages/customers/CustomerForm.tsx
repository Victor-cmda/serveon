import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2, Search, Building2, User, CreditCard, Phone, Mail, MapPin, Home } from 'lucide-react';
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
import { customerApi, cityApi, stateApi, countryApi } from '@/services/api';
import { Country, State, City } from '@/types/location';
import { toast } from 'sonner';
import { SearchDialog } from '@/components/SearchDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import StateCreationDialog from '@/components/dialogs/StateCreationDialog';
import CityCreationDialog from '@/components/dialogs/CityCreationDialog';

// Formatadores de texto
const formatters = {
  cpf: (value: string | undefined): string => {
    // Se não houver valor, retorna string vazia
    if (!value) return '';
    
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const cpf = digits.slice(0, 11);
    
    // Aplica a máscara do CPF: 000.000.000-00
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_, p1, p2, p3, p4) => {
      if (p4) return `${p1}.${p2}.${p3}-${p4}`;
      if (p3) return `${p1}.${p2}.${p3}`;
      if (p2) return `${p1}.${p2}`;
      return p1;
    });
  },
  
  cnpj: (value: string | undefined): string => {
    // Se não houver valor, retorna string vazia
    if (!value) return '';
    
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Limita a 14 dígitos
    const cnpj = digits.slice(0, 14);
    
    // Aplica a máscara do CNPJ: 00.000.000/0000-00
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, (_, p1, p2, p3, p4, p5) => {
      if (p5) return `${p1}.${p2}.${p3}/${p4}-${p5}`;
      if (p4) return `${p1}.${p2}.${p3}/${p4}`;
      if (p3) return `${p1}.${p2}.${p3}`;
      if (p2) return `${p1}.${p2}`;
      return p1;
    });
  },
  
  telefone: (value: string | undefined): string => {
    // Se não houver valor, retorna string vazia
    if (!value) return '';
    
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (com DDD)
    const tel = digits.slice(0, 11);
    
    // Aplica a máscara de telefone: (00) 00000-0000 ou (00) 0000-0000
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
    // Se não houver valor, retorna string vazia
    if (!value) return '';
    
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Limita a 8 dígitos
    const cep = digits.slice(0, 8);
    
    // Aplica a máscara de CEP: 00000-000
    return cep.replace(/(\d{5})(\d{0,3})/, (_, p1, p2) => {
      if (p2) return `${p1}-${p2}`;
      return p1;
    });
  },
  
  numero: (value: string | undefined): string => {
    // Se não houver valor, retorna string vazia
    if (!value) return '';
    
    // Permite apenas números e letras (para casos como "123-A", "S/N", etc)
    return value.replace(/[^0-9a-zA-Z/-]/g, '');
  },
  
  inscricaoEstadual: (value: string | undefined): string => {
    // Se não houver valor, retorna string vazia
    if (!value) return '';
    
    // Remove caracteres especiais, mantendo apenas números e letras
    // IE pode ter formato variável dependendo do estado
    return value.replace(/[^\w]/g, '');
  },
  
  // Função para limpar formatação e retornar apenas os dígitos
  clearFormat: (value: string | undefined): string => {
    if (!value) return '';
    return value.replace(/\D/g, '');
  }
};

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

  const [isLoading, setIsLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [country, setCountries] = useState<Country[]>([]);

  const [stateSearchOpen, setStateSearchOpen] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);

  const [newCityDialogOpen, setNewCityDialogOpen] = useState(false);
  const [newStateDialogOpen, setNewStateDialogOpen] = useState(false);

  const [selectedStateId, setSelectedStateId] = useState<string>('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
    const fetchCustomer = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const customer = await customerApi.getById(id);
        // Ensure all fields are controlled by setting them or using defaults
        form.reset({
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
          cidadeId: customer.cidadeId || '',
          ativo: Boolean(customer.ativo),
        });

        if (customer.cidadeId) {
          // If we have a city, find its state to populate the appropriate dropdowns
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
      // Se não há ID, apenas reset o formulário com valores padrão
      form.reset({
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
      });
      setSelectedCity(null);
      setSelectedStateId('');
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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    
    if (!data.cidadeId) {
      toast.error('Por favor, selecione uma cidade antes de salvar');
      return;
    }
    
    setIsLoading(true);

    try {
      // Remover as máscaras/formatações antes de enviar para o servidor
      const formattedData = {
        ...data,
        cnpjCpf: formatters.clearFormat(data.cnpjCpf),
        email: data.email?.trim() || undefined,
        nomeFantasia: data.nomeFantasia?.trim() || undefined,
        inscricaoEstadual: formatters.inscricaoEstadual(data.inscricaoEstadual) || undefined,
        inscricaoMunicipal: formatters.inscricaoEstadual(data.inscricaoMunicipal) || undefined,
        endereco: data.endereco?.trim() || undefined,
        numero: data.numero?.trim() || undefined,
        complemento: data.complemento?.trim() || undefined,
        bairro: data.bairro?.trim() || undefined,
        cep: formatters.clearFormat(data.cep) || undefined,
        telefone: formatters.clearFormat(data.telefone) || undefined,
        cidadeId: data.cidadeId, // Required field, always present
      };

      if (id) {
        await customerApi.update(id, formattedData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await customerApi.create(formattedData);
        toast.success('Cliente criado com sucesso!');
        
        // Limpar formulário após criar novo cliente
        form.reset({
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
        });
        setSelectedCity(null);
        setSelectedStateId('');
      }

      // Navegar de volta para a listagem
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
    
    if (!city || !city.id) {
      toast.error('Cidade inválida selecionada');
      return;
    }
    
    try {
      // Define o valor no formulário
      form.setValue('cidadeId', city.id, { 
        shouldValidate: true, 
        shouldDirty: true,
        shouldTouch: true
      });
      
      // Atualiza o estado local
      setSelectedCity(city);
      
      // Define o estado relacionado à cidade
      if (city.estadoId) {
        setSelectedStateId(city.estadoId);
      }
      
      // Fecha o diálogo
      setCitySearchOpen(false);
      
    } catch (error) {
      console.error('Erro ao selecionar cidade:', error);
      toast.error('Ocorreu um erro ao selecionar a cidade');
    }
  };

  const onCreateNewCity = () => {
    setNewCityDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {id ? 'Editar Cliente' : 'Novo Cliente'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {id ? 'Atualize as informações do cliente conforme necessário' : 'Preencha as informações para cadastrar um novo cliente'}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" asChild>
            <Link 
              to="/customers" 
              onClick={() => {
                if (!id) {
                  // Não precisamos mais limpar o FormState
                }
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Link>
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Gerais
              </CardTitle>
              <CardDescription>
                Informações cadastrais básicas do cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                          <label htmlFor="juridica" className="text-base flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
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
                          <label htmlFor="fisica" className="text-base flex items-center gap-1">
                            <User className="h-4 w-4" />
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
                        <input
                          type="checkbox"
                          id="isEstrangeiro"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel htmlFor="isEstrangeiro" className="text-base font-medium">
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
                        <input
                          type="checkbox"
                          id="ativo"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel htmlFor="ativo" className="text-base font-medium">
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
                        <div className="relative">
                          <Input
                            {...field}
                            value={watchTipo === 'J' ? formatters.cnpj(field.value) : formatters.cpf(field.value)}
                            onChange={(e) => field.onChange(e.target.value)}
                            disabled={isLoading}
                            className="h-11 text-base pl-9"
                          />
                          <CreditCard className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        </div>
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
                          value={formatters.inscricaoEstadual(field.value)}
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
                        <div className="relative">
                          <Input
                            {...field}
                            disabled={isLoading}
                            className="h-11 text-base pl-9"
                          />
                          {watchTipo === 'J' ? 
                            <Building2 className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /> : 
                            <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                          }
                        </div>
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
                            value={formatters.inscricaoEstadual(field.value)}
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
              )}
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
              <CardDescription>
                Informações de localização do cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                            <div className="relative flex-grow">
                              <Input
                                value={selectedCity?.nome || ''}
                                readOnly
                                placeholder="Selecione uma cidade"
                                className="cursor-pointer h-11 text-base pl-9"
                                onClick={() => setCitySearchOpen(true)}
                              />
                              <input 
                                type="hidden" 
                                name={field.name}
                                value={field.value || ''}
                                onChange={(e) => {
                                  field.onChange(e);
                                }}
                                ref={field.ref}
                                onBlur={field.onBlur}
                              />
                              <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                setCitySearchOpen(true);
                              }}
                              className="h-11 w-11"
                            >
                              <Search className="h-5 w-5" />
                            </Button>
                          </div>
                        </FormControl>
                      </div>
                      {selectedCity && (
                        <div className="mt-2 flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {selectedCity.estadoNome} / {selectedCity.uf}
                          </Badge>
                          {selectedCity.paisNome && (
                            <Badge variant="outline">
                              {selectedCity.paisNome}
                            </Badge>
                          )}
                        </div>
                      )}
                      {field.value && !selectedCity && (
                        <div className="mt-2">
                          <Badge variant="outline" className="bg-yellow-50">
                            Cidade selecionada mas dados não carregados. ID: {field.value}
                          </Badge>
                        </div>
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
                        <div className="relative">
                          <Input
                            {...field}
                            disabled={isLoading}
                            className="h-11 text-base pl-9"
                          />
                          <Home className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        </div>
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
                            value={formatters.numero(field.value)}
                            onChange={(e) => field.onChange(e.target.value)}
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
                          value={formatters.cep(field.value)}
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
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contato
              </CardTitle>
              <CardDescription>
                Informações de contato do cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                        <div className="relative">
                          <Input
                            {...field}
                            value={formatters.telefone(field.value)}
                            onChange={(e) => field.onChange(e.target.value)}
                            disabled={isLoading}
                            className="h-11 text-base pl-9"
                          />
                          <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        </div>
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
                        <div className="relative">
                          <Input
                            {...field}
                            value={field.value || ''} 
                            disabled={isLoading}
                            className="h-11 text-base pl-9"
                            onChange={(e) => field.onChange(e.target.value || '')}
                          />
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 px-6 text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> Salvar Cliente
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
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
