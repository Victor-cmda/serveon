// src/pages/cities/CityForm.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2, Plus } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cityApi, stateApi, countryApi } from '@/services/api';
import { CreateCityDto, UpdateCityDto, Country, State } from '@/types/location';
import { toast } from 'sonner';
import StateCreationDialog from '@/components/dialogs/StateCreationDialog';
import CountryCreationDialog from '@/components/dialogs/CountryCreationDialog';

const formSchema = z.object({
    nome: z.string().min(2, 'Nome da cidade é obrigatório e deve ter pelo menos 2 caracteres'),
    codigoIbge: z.string().optional()
        .refine(val => !val || /^[0-9]{7}$/.test(val), {
            message: 'O código IBGE deve ter exatamente 7 dígitos numéricos'
        }),
    estadoId: z.string().uuid('Selecione um estado válido'),
    paisId: z.string().uuid('Selecione um país válido'),
});

const CityForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [filteredStates, setFilteredStates] = useState<State[]>([]);
    const [stateDialogOpen, setStateDialogOpen] = useState(false);
    const [countryDialogOpen, setCountryDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: '',
            codigoIbge: '',
            estadoId: '',
            paisId: '',
        },
    });

    const selectedCountry = form.watch('paisId');

    useEffect(() => {
        if (selectedCountry && states.length > 0) {
            const filtered = states.filter(state => state.paisId === selectedCountry);
            setFilteredStates(filtered);

            const currentStateId = form.getValues('estadoId');
            if (currentStateId && !filtered.some(state => state.id === currentStateId)) {
                form.setValue('estadoId', '');
            }
        } else {
            setFilteredStates([]);
        }
    }, [selectedCountry, states, form]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [countriesData, statesData] = await Promise.all([
                    countryApi.getAll(),
                    stateApi.getAll()
                ]);

                setCountries(countriesData);
                setStates(statesData);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                toast.error("Não foi possível carregar os dados necessários.");
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

                const cityState = states.find(state => state.id === city.estadoId);

                form.reset({
                    nome: city.nome,
                    codigoIbge: city.codigoIbge || '',
                    estadoId: city.estadoId,
                    paisId: cityState?.paisId || '',
                });
            } catch (error) {
                console.error('Erro ao buscar cidade:', error);
                toast.error("Não foi possível carregar os dados da cidade.");
                navigate('/cities');
            } finally {
                setIsLoading(false);
            }
        };

        if (id && states.length > 0) {
            fetchCity();
        }
    }, [id, navigate, form, states]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            const { paisId, ...cityData } = data;

            const formattedData = {
                ...cityData,
                codigoIbge: cityData.codigoIbge && cityData.codigoIbge.trim() !== ''
                    ? cityData.codigoIbge
                    : undefined
            };

            if (id) {
                await cityApi.update(id, formattedData as UpdateCityDto);
                toast.success("Cidade atualizada com sucesso!");
            } else {
                await cityApi.create(formattedData as CreateCityDto);
                toast.success("Cidade criada com sucesso!");
            }

            navigate('/cities');
        } catch (error: any) {
            console.error('Erro ao salvar cidade:', error);
            toast.error(error.message || "Ocorreu um erro ao salvar a cidade.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStateCreated = (newState: State) => {
        setStates(prev => [...prev, newState]);

        form.setValue('estadoId', newState.id);
    };

    const handleCountryCreated = (newCountry: Country) => {
        setCountries(prev => [...prev, newCountry]);

        form.setValue('paisId', newCountry.id);
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

            <div className="rounded-md border p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <FormField
                                    control={form.control}
                                    name="paisId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>País</FormLabel>
                                            <div className="flex gap-2">
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={isLoading}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="flex-1">
                                                            <SelectValue placeholder="Selecione um país" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {countries.map((country) => (
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
                            </div>

                            <div>
                                <FormField
                                    control={form.control}
                                    name="estadoId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estado</FormLabel>
                                            <div className="flex gap-2">
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={isLoading || !selectedCountry || filteredStates.length === 0}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="flex-1">
                                                            <SelectValue placeholder="Selecione um estado" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {filteredStates.map((state) => (
                                                            <SelectItem key={state.id} value={state.id}>
                                                                {state.nome} ({state.uf})
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
                                            {!selectedCountry && (
                                                <FormDescription>
                                                    Selecione um país primeiro
                                                </FormDescription>
                                            )}
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome da Cidade</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: São Paulo" {...field} disabled={isLoading} />
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
                                    <FormLabel>Código IBGE (opcional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: 3550308"
                                            {...field}
                                            maxLength={7}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Código de 7 dígitos do IBGE para o município
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" /> Salvar
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>

            <StateCreationDialog
                open={stateDialogOpen}
                onOpenChange={setStateDialogOpen}
                onSuccess={handleStateCreated}
                selectedCountryId={selectedCountry}
            />

            <CountryCreationDialog
                open={countryDialogOpen}
                onOpenChange={setCountryDialogOpen}
                onSuccess={handleCountryCreated}
            />
        </div>
    );
};

export default CityForm;