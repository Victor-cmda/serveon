import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
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
                toast.error("Erro", {
                    description: "Não foi possível carregar os dados necessários.",
                });
            }
        };

        fetchData();
    }, [toast]);

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
                toast.error("Erro", {
                    description: "Não foi possível carregar os dados da cidade.",
                });
                navigate('/cities');
            } finally {
                setIsLoading(false);
            }
        };

        if (id && states.length > 0) {
            fetchCity();
        }
    }, [id, navigate, toast, form, states]);

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
                toast.success("Sucesso", {
                    description: "Cidade atualizada com sucesso!",
                });
            } else {
                await cityApi.create(formattedData as CreateCityDto);
                toast.success("Sucesso", {
                    description: "Cidade criada com sucesso!",
                });
            }

            navigate('/cities');
        } catch (error: any) {
            console.error('Erro ao salvar cidade:', error);
            toast.error("Erro", {
                description: error.message || "Ocorreu um erro ao salvar a cidade.",
            });
        } finally {
            setIsLoading(false);
        }
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
                            <FormField
                                control={form.control}
                                name="paisId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>País</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoading}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="estadoId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estado</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoading || !selectedCountry || filteredStates.length === 0}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
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
        </div>
    );
};

export default CityForm;