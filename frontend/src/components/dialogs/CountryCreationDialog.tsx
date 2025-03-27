// src/components/dialogs/CountryCreationDialog.tsx
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
import { countryApi } from '@/services/api';
import { Country, CreateCountryDto } from '@/types/location';

// Schema de validação
const formSchema = z.object({
    nome: z.string().min(2, 'Nome do país é obrigatório e deve ter pelo menos 2 caracteres'),
    sigla: z.string().length(2, 'Sigla deve ter exatamente 2 caracteres').toUpperCase(),
    codigo: z.string()
        .min(1, 'Código é obrigatório')
        .max(3, 'Código deve ter no máximo 3 caracteres')
        .regex(/^[0-9]+$/, 'Código deve conter apenas números'),
});

interface CountryCreationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (country: Country) => void;
}

const CountryCreationDialog = ({
    open,
    onOpenChange,
    onSuccess
}: CountryCreationDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);

    // Criar formulário
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: '',
            sigla: '',
            codigo: '',
        },
    });

    // Resetar formulário quando o diálogo fechar
    useEffect(() => {
        if (!open) {
            form.reset({
                nome: '',
                sigla: '',
                codigo: '',
            });
        }
    }, [open, form]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            const createData: CreateCountryDto = {
                nome: data.nome,
                sigla: data.sigla,
                codigo: data.codigo,
            };

            const newCountry = await countryApi.create(createData);
            toast.success(`País ${data.nome} criado com sucesso!`);

            onSuccess(newCountry);
            onOpenChange(false);
        } catch (error: any) {
            console.error('Erro ao criar país:', error);
            toast.error(error.message || "Ocorreu um erro ao criar o país.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Adicionar novo país</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para cadastrar um novo país.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nome"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do País</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Brasil" {...field} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="sigla"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sigla (2 caracteres)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: BR"
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

                            <FormField
                                control={form.control}
                                name="codigo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Código</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Ex: 55"
                                                {...field}
                                                maxLength={3}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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

export default CountryCreationDialog;