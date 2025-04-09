import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { customerApi } from '@/services/api';
import { cityApi, stateApi, countryApi } from '@/services/api';
import { CreateCustomerDto, UpdateCustomerDto } from '@/types/customer';
import { Country, State, City } from '@/types/location';
import { toast } from 'sonner';
import CountryCreationDialog from '@/components/dialogs/CountryCreationDialog';
import StateCreationDialog from '@/components/dialogs/StateCreationDialog';
import CityCreationDialog from '@/components/dialogs/CityCreationDialog';

const formSchema = z.object({
    cnpjCpf: z.string()
        .min(1, 'Documento de identificação é obrigatório'),
    tipoDocumento: z.string().optional(),
    tipo: z.enum(['F', 'J'], { 
        required_error: 'Tipo de cliente é obrigatório' 
    }),
    razaoSocial: z.string().min(2, 'Razão Social é obrigatória'),
    nomeFantasia: z.string().optional(),
    inscricaoEstadual: z.string().optional(),
    inscricaoMunicipal: z.string().optional(),
    endereco: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidadeId: z.string().uuid('Cidade é obrigatória'),
    cep: z.string().optional(),
    telefone: z.string().optional(),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    ativo: z.boolean().default(true),
    paisId: z.string().uuid('País é obrigatório'),
    estadoId: z.string().uuid('Estado é obrigatório'),
    isEstrangeiro: z.boolean().default(false),
});

const CustomerForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing] = useState(!!id);
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [filteredStates, setFilteredStates] = useState<State[]>([]);
    const [filteredCities, setFilteredCities] = useState<City[]>([]);
    
    // Estado para controlar a abertura dos diálogos
    const [countryDialogOpen, setCountryDialogOpen] = useState(false);
    const [stateDialogOpen, setStateDialogOpen] = useState(false);
    const [cityDialogOpen, setCityDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            cnpjCpf: '',
            tipoDocumento: '',
            tipo: 'J' as const,
            razaoSocial: '',
            nomeFantasia: '',
            inscricaoEstadual: '',
            inscricaoMunicipal: '',
            endereco: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidadeId: '',
            cep: '',
            telefone: '',
            email: '',
            ativo: true,
            paisId: '',
            estadoId: '',
            isEstrangeiro: false,
        },
    });

    const selectedCountry = form.watch('paisId');
    const selectedState = form.watch('estadoId');
    const selectedType = form.watch('tipo');
    const isEstrangeiro = form.watch('isEstrangeiro');
    
    // Verificar se o país selecionado é o Brasil
    const defaultBrasilId = countries.find(country => country.sigla === 'BR')?.id || '';

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const [countriesData, statesData, citiesData] = await Promise.all([
                    countryApi.getAll(),
                    stateApi.getAll(),
                    cityApi.getAll()
                ]);

                setCountries(countriesData);
                setStates(statesData);
                setCities(citiesData);
            } catch (error) {
                console.error('Erro ao carregar dados de localização:', error);
                toast.error("Erro", {
                    description: "Não foi possível carregar os dados de localização."
                });
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        if (selectedCountry) {
            const filtered = states.filter(state => state.paisId === selectedCountry);
            setFilteredStates(filtered);

            if (selectedState && !filtered.some(s => s.id === selectedState)) {
                form.setValue('estadoId', '');
                form.setValue('cidadeId', '');
            }
        } else {
            setFilteredStates([]);
        }
        
        // Atualizar isEstrangeiro com base no país selecionado
        if (countries.length > 0 && selectedCountry) {
            const isBrasil = selectedCountry === defaultBrasilId;
            form.setValue('isEstrangeiro', !isBrasil);
        }
    }, [selectedCountry, states, selectedState, form, defaultBrasilId, countries]);

    useEffect(() => {
        if (selectedState) {
            const filtered = cities.filter(city => city.estadoId === selectedState);
            setFilteredCities(filtered);

            const currentCityId = form.getValues('cidadeId');
            if (currentCityId && !filtered.some(c => c.id === currentCityId)) {
                form.setValue('cidadeId', '');
            }
        } else {
            setFilteredCities([]);
        }
    }, [selectedState, cities, form]);

    useEffect(() => {
        // Definir tipos de documento padrão com base no tipo de cliente
        if (isEstrangeiro) {
            const tipoDoc = form.getValues('tipoDocumento');
            if (!tipoDoc) {
                form.setValue('tipoDocumento', selectedType === 'F' ? 'passport' : 'tax_id');
            }
        }
    }, [isEstrangeiro, selectedType, form]);

    useEffect(() => {
        const fetchCustomer = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                const customer = await customerApi.getById(id);
                
                // Primeiro, precisamos encontrar a cidade para obter o estado e país
                const city = cities.find(c => c.id === customer.cidadeId);
                
                if (city) {
                    const state = states.find(s => s.id === city.estadoId);
                    
                    if (state) {
                        // Definir país, estado e depois cidade para manter cascata de seleção
                        form.setValue('paisId', state.paisId || '');
                        
                        // Atualizar filtered states baseado no país
                        setTimeout(() => {
                            // Garantir que estadoId seja uma string
                            if (city && city.estadoId) {
                                form.setValue('estadoId', city.estadoId);
                                
                                // Atualizar filtered cities baseado no estado
                                setTimeout(() => {
                                    // Garantir que cidadeId seja uma string
                                    if (customer && customer.cidadeId) {
                                        form.setValue('cidadeId', customer.cidadeId);
                                    }
                                }, 0);
                            }
                        }, 0);
                    }
                }
                
                // Verificar se o cliente é estrangeiro
                const isEstrangeiro = customer.inscricaoEstadual?.includes(':') || false;
                if (isEstrangeiro && customer.inscricaoEstadual) {
                    const [tipoDoc, inscEst] = customer.inscricaoEstadual.split(':');
                    form.setValue('tipoDocumento', tipoDoc);
                    form.setValue('inscricaoEstadual', inscEst || '');
                } else {
                    form.setValue('inscricaoEstadual', customer.inscricaoEstadual || '');
                }
                
                // Definir os outros campos
                form.setValue('cnpjCpf', customer.cnpjCpf);
                form.setValue('tipo', customer.tipo);
                form.setValue('razaoSocial', customer.razaoSocial);
                form.setValue('nomeFantasia', customer.nomeFantasia || '');
                form.setValue('inscricaoMunicipal', customer.inscricaoMunicipal || '');
                form.setValue('endereco', customer.endereco || '');
                form.setValue('numero', customer.numero || '');
                form.setValue('complemento', customer.complemento || '');
                form.setValue('bairro', customer.bairro || '');
                form.setValue('cep', customer.cep || '');
                form.setValue('telefone', customer.telefone || '');
                form.setValue('email', customer.email || '');
                form.setValue('ativo', customer.ativo);
                
                // Definir isEstrangeiro com base no país
                if (city && city.estadoId) {
                    const stateObj = states.find(s => s.id === city.estadoId);
                    const countryIsBrasil = stateObj?.paisId === defaultBrasilId;
                    form.setValue('isEstrangeiro', !countryIsBrasil);
                }
                
            } catch (error) {
                console.error('Erro ao buscar cliente:', error);
                toast.error("Erro", {
                    description: "Não foi possível carregar os dados do cliente."
                });
                navigate('/customers');
            } finally {
                setIsLoading(false);
            }
        };

        if (id && cities.length > 0 && states.length > 0) {
            fetchCustomer();
        }
    }, [id, navigate, form, cities, states, defaultBrasilId]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            // Remove campos do formulário que não pertencem ao DTO
            const { 
                paisId, 
                estadoId, 
                isEstrangeiro,
                tipoDocumento,
                ...customerData 
            } = data;

            // Para clientes estrangeiros, preparamos o campo inscricaoEstadual para armazenar o tipo de documento
            if (isEstrangeiro && tipoDocumento) {
                customerData.inscricaoEstadual = `${tipoDocumento}:${customerData.inscricaoEstadual || ''}`;
            }

            // Para campos opcionais, enviamos undefined se estiverem vazios
            const formattedData = {
                ...customerData,
                nomeFantasia: customerData.nomeFantasia?.trim() || undefined,
                inscricaoEstadual: customerData.inscricaoEstadual?.trim() || undefined,
                inscricaoMunicipal: customerData.inscricaoMunicipal?.trim() || undefined,
                endereco: customerData.endereco?.trim() || undefined,
                numero: customerData.numero?.trim() || undefined,
                complemento: customerData.complemento?.trim() || undefined,
                bairro: customerData.bairro?.trim() || undefined,
                cep: customerData.cep?.trim() || undefined,
                telefone: customerData.telefone?.trim() || undefined,
                email: customerData.email?.trim() || undefined,
            };

            if (isEditing) {
                // No modo de edição, removemos o CNPJ/CPF do objeto de atualização
                const { cnpjCpf, ...updateData } = formattedData;
                await customerApi.update(id!, updateData as UpdateCustomerDto);
                toast.success("Sucesso", {
                    description: "Cliente atualizado com sucesso!"
                });
            } else {
                await customerApi.create(formattedData as CreateCustomerDto);
                toast.success("Sucesso", {
                    description: "Cliente criado com sucesso!"
                });
            }

            navigate('/customers');
        } catch (error: any) {
            console.error('Erro ao salvar cliente:', error);
            toast.error("Erro", {
                description: error.message || "Ocorreu um erro ao salvar o cliente."
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">
                    {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
                </h1>
                <Button variant="outline" asChild>
                    <Link to="/customers">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6">
                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">Dados Básicos</TabsTrigger>
                                <TabsTrigger value="address">Endereço</TabsTrigger>
                                <TabsTrigger value="contact">Contato</TabsTrigger>
                            </TabsList>
                            
                            {/* Aba de Dados Básicos */}
                            <TabsContent value="basic" className="py-4 space-y-4">
                                {/* Movemos a opção "Cliente Estrangeiro" para esta aba */}
                                <FormField
                                    control={form.control}
                                    name="isEstrangeiro"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isLoading}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Cliente Estrangeiro</FormLabel>
                                                <FormDescription>
                                                    Marque esta opção para clientes fora do Brasil
                                                </FormDescription>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <FormField
                                        control={form.control}
                                        name="tipo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tipo de Cliente</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={isLoading || isEditing}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecione o tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="F">Pessoa Física</SelectItem>
                                                        <SelectItem value="J">Pessoa Jurídica</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Documento de identificação baseado no tipo de cliente e nacionalidade */}
                                    {isEstrangeiro ? (
                                        <FormField
                                            control={form.control}
                                            name="tipoDocumento"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tipo de Documento</FormLabel>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isLoading}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione o tipo" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="passport">Passaporte</SelectItem>
                                                            <SelectItem value="tax_id">ID Fiscal</SelectItem>
                                                            <SelectItem value="national_id">ID Nacional</SelectItem>
                                                            <SelectItem value="other">Outro</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    ) : null}

                                    <FormField
                                        control={form.control}
                                        name="cnpjCpf"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {isEstrangeiro ? 'Número do Documento' : 
                                                     selectedType === 'F' ? 'CPF' : 'CNPJ'}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder={
                                                            isEstrangeiro ? "Ex: AB123456789" : 
                                                            selectedType === 'F' ? "Ex: 12345678901" : 
                                                            "Ex: 12345678901234"
                                                        } 
                                                        {...field} 
                                                        disabled={isLoading || isEditing}
                                                        maxLength={!isEstrangeiro && selectedType === 'F' ? 11 : 
                                                                  !isEstrangeiro && selectedType === 'J' ? 14 : undefined} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                {isEstrangeiro && (
                                                    <FormDescription>
                                                        Informe o número do documento de identificação
                                                    </FormDescription>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="ativo"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-7">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        disabled={isLoading}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Cliente Ativo</FormLabel>
                                                    <FormDescription>
                                                        Clientes inativos não aparecerão nas listagens por padrão
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="razaoSocial"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{selectedType === 'F' ? 'Nome Completo' : 'Razão Social'}</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder={selectedType === 'F' ? "Ex: João da Silva" : "Ex: Empresa XYZ Ltda"} 
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
                                    name="nomeFantasia"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nome Fantasia</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: XYZ Tecnologia" {...field} disabled={isLoading} />
                                            </FormControl>
                                            <FormDescription>
                                                {selectedType === 'F' ? 'Apelido ou nome social' : 'Nome comercial da empresa'}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="inscricaoEstadual"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {isEstrangeiro ? 'Dados adicionais do documento' : 'Inscrição Estadual'}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder={
                                                            isEstrangeiro ? "Ex: País emissor, data, etc." : "Ex: 123456789"
                                                        } 
                                                        {...field} 
                                                        disabled={isLoading} 
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    {isEstrangeiro ? 'Informações complementares do documento' : ''}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="inscricaoMunicipal"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    {isEstrangeiro && selectedType === 'J' ? 
                                                        'Número de registro comercial' : 'Inscrição Municipal'}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: 123456" {...field} disabled={isLoading} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </TabsContent>

                            {/* Aba de Endereço */}
                            <TabsContent value="address" className="py-4 space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <FormField
                                        control={form.control}
                                        name="paisId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>País</FormLabel>
                                                <div className="flex gap-2">
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isLoading}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="flex-1">
                                                                <SelectValue placeholder="Selecione um país" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {countries.map(country => (
                                                                <SelectItem key={country.id} value={country.id}>
                                                                    {country.nome}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        onClick={() => setCountryDialogOpen(true)}
                                                        disabled={isLoading}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="estadoId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Estado/Província</FormLabel>
                                                <div className="flex gap-2">
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isLoading || !selectedCountry}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="flex-1">
                                                                <SelectValue placeholder="Selecione um estado" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {filteredStates.map(state => (
                                                                <SelectItem key={state.id} value={state.id}>
                                                                    {state.nome}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        onClick={() => setStateDialogOpen(true)}
                                                        disabled={isLoading || !selectedCountry}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                                {/* {!selectedCountry && (
                                                    <FormDescription>
                                                        Selecione um país primeiro
                                                    </FormDescription>
                                                )} */}
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="cidadeId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cidade</FormLabel>
                                                <div className="flex gap-2">
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        disabled={isLoading || !selectedState}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger className="flex-1">
                                                                <SelectValue placeholder="Selecione uma cidade" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {filteredCities.map(city => (
                                                                <SelectItem key={city.id} value={city.id}>
                                                                    {city.nome}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        onClick={() => setCityDialogOpen(true)}
                                                        disabled={isLoading || !selectedState}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <FormMessage />
                                                {/* {!selectedState && (
                                                    <FormDescription>
                                                        Selecione um estado primeiro
                                                    </FormDescription>
                                                )} */}
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                    <div className="sm:col-span-2">
                                        <FormField
                                            control={form.control}
                                            name="endereco"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>
                                                        {isEstrangeiro ? 'Endereço Completo' : 'Endereço'}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder={
                                                                isEstrangeiro ? 
                                                                "Ex: 123 Main Street, Apt 4B" : 
                                                                "Ex: Rua das Flores"
                                                            } 
                                                            {...field} 
                                                            disabled={isLoading} 
                                                        />
                                                    </FormControl>
                                                    {isEstrangeiro && (
                                                        <FormDescription>
                                                            Inclua número, rua e complemento
                                                        </FormDescription>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {!isEstrangeiro && (
                                        <FormField
                                            control={form.control}
                                            name="numero"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Número</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: 123" {...field} disabled={isLoading} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {!isEstrangeiro && (
                                        <FormField
                                            control={form.control}
                                            name="complemento"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Complemento</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Sala 101" {...field} disabled={isLoading} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    {!isEstrangeiro && (
                                        <FormField
                                            control={form.control}
                                            name="bairro"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Bairro</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Ex: Centro" {...field} disabled={isLoading} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}
                                </div>

                                <FormField
                                    control={form.control}
                                    name="cep"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                {isEstrangeiro ? 'Código Postal' : 'CEP'}
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder={isEstrangeiro ? "Ex: 90210" : "Ex: 12345678"} 
                                                    {...field} 
                                                    disabled={isLoading} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            {/* Aba de Contato */}
                            <TabsContent value="contact" className="py-4 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-mail</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="email"
                                                    placeholder="Ex: contato@empresa.com" 
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
                                    name="telefone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Telefone</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder={isEstrangeiro ? 
                                                               "Ex: +1 555-123-4567" : 
                                                               "Ex: (11) 98765-4321"} 
                                                    {...field} 
                                                    disabled={isLoading} 
                                                />
                                            </FormControl>
                                            {isEstrangeiro && (
                                                <FormDescription>
                                                    Inclua o código do país (Ex: +1 para EUA)
                                                </FormDescription>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
            </div>
            
            {/* Diálogos para criação de registros dependentes */}
            <CountryCreationDialog
                open={countryDialogOpen}
                onOpenChange={setCountryDialogOpen}
                onSuccess={(newCountry) => {
                    setCountries(prev => [...prev, newCountry]);
                    form.setValue('paisId', newCountry.id);
                }}
            />

            <StateCreationDialog
                open={stateDialogOpen}
                onOpenChange={setStateDialogOpen}
                selectedCountryId={selectedCountry}
                onSuccess={(newState) => {
                    setStates(prev => [...prev, newState]);
                    form.setValue('estadoId', newState.id);
                }}
            />

            <CityCreationDialog
                open={cityDialogOpen}
                onOpenChange={setCityDialogOpen}
                selectedStateId={selectedState}
                onSuccess={(newCity) => {
                    setCities(prev => [...prev, newCity]);
                    form.setValue('cidadeId', newCity.id);
                }}
            />
        </div>
    );
};

export default CustomerForm;