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
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { stateApi, countryApi } from '@/services/api';
import { CreateStateDto, UpdateStateDto, Country } from '@/types/location';
import { toast } from "sonner";

const formSchema = z.object({
    nome: z.string().min(2, 'Nome do estado é obrigatório e deve ter pelo menos 2 caracteres'),
    uf: z.string().length(2, 'UF deve ter exatamente 2 caracteres').toUpperCase(),
    paisId: z.string().uuid('Selecione um país válido'),
});

const StateForm = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: '',
            uf: '',
            paisId: '',
        },
    });

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const data = await countryApi.getAll();
                setCountries(data);
            } catch (error) {
                console.error('Erro ao buscar países:', error);
                toast.error("Erro", {
                    description: "Não foi possível carregar a lista de países.",
                });
            }
        };

        fetchCountries();
    }, [toast]);

    useEffect(() => {
        const fetchState = async () => {
            if (!id) return;

            setIsLoading(true);
            try {
                const state = await stateApi.getById(id);
                form.reset({
                    nome: state.nome,
                    uf: state.uf,
                    paisId: state.paisId,
                });
            } catch (error) {
                console.error('Erro ao buscar estado:', error);
                toast.error("Erro", {
                    description: "Não foi possível carregar os dados do estado.",
                });
                navigate('/states');
            } finally {
                setIsLoading(false);
            }
        };

        fetchState();
    }, [id, navigate, toast, form]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            if (id) {
                const updateData: UpdateStateDto = {
                    nome: data.nome,
                    uf: data.uf,
                    paisId: data.paisId,
                };

                await stateApi.update(id, updateData);
                toast.success("Sucesso", {
                    description: "Estado atualizado com sucesso!",
                });
            } else {
                const createData: CreateStateDto = {
                    nome: data.nome,
                    uf: data.uf,
                    paisId: data.paisId,
                };

                await stateApi.create(createData);
                toast.success("Sucesso", {
                    description: "Estado criado com sucesso!",
                });
            }

            navigate('/states');
        } catch (error: any) {
            console.error('Erro ao salvar estado:', error);
            toast.success("Sucesso", {
                description: error.message || "Ocorreu um erro ao salvar o estado.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">
                    {id ? 'Editar Estado' : 'Novo Estado'}
                </h1>
                <Button variant="outline" asChild>
                    <Link to="/states">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border p-4">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Estado</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: São Paulo" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="uf"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>UF (2 caracteres)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ex: SP"
                                            {...field}
                                            maxLength={2}
                                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
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

export default StateForm;