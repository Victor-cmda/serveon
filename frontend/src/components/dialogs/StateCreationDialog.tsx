// src/components/dialogs/StateCreationDialog.tsx
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Country, CreateStateDto, State } from '@/types/location';

const formSchema = z.object({
    nome: z.string().min(2, 'Nome do estado é obrigatório e deve ter pelo menos 2 caracteres'),
    uf: z.string().length(2, 'UF deve ter exatamente 2 caracteres').toUpperCase(),
    paisId: z.string().uuid('Selecione um país válido'),
});

interface StateCreationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (state: State) => void;
    selectedCountryId?: string;
}

const StateCreationDialog = ({
    open,
    onOpenChange,
    onSuccess,
    selectedCountryId
}: StateCreationDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: '',
            uf: '',
            paisId: selectedCountryId || '',
        },
    });

    useEffect(() => {
        if (selectedCountryId) {
            form.setValue('paisId', selectedCountryId);
        }
    }, [selectedCountryId, form]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const data = await countryApi.getAll();
                setCountries(data);
            } catch (error) {
                console.error('Erro ao buscar países:', error);
                toast.error("Não foi possível carregar a lista de países.");
            }
        };

        if (open) {
            fetchCountries();
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            form.reset({
                nome: '',
                uf: '',
                paisId: selectedCountryId || '',
            });
        }
    }, [open, form, selectedCountryId]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            const createData: CreateStateDto = {
                nome: data.nome,
                uf: data.uf,
                paisId: data.paisId,
            };

            const newState = await stateApi.create(createData);
            toast.success(`Estado ${data.nome} criado com sucesso!`);

            onSuccess(newState);
            onOpenChange(false);
        } catch (error: any) {
            console.error('Erro ao criar estado:', error);
            toast.error(error.message || "Ocorreu um erro ao criar o estado.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Adicionar novo estado</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para cadastrar um novo estado.
                    </DialogDescription>
                </DialogHeader>

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
                                        disabled={isLoading || !!selectedCountryId}
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

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Salvar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default StateCreationDialog;