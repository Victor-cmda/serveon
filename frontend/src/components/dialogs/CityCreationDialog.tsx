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
    FormDescription,
} from '@/components/ui/form';
import { cityApi } from '@/services/api';
import { City, CreateCityDto } from '@/types/location';

const formSchema = z.object({
    nome: z.string().min(2, 'Nome da cidade é obrigatório e deve ter pelo menos 2 caracteres'),
    codigoIbge: z.string()
        .optional()
        .refine(val => !val || /^[0-9]{7}$/.test(val), {
            message: 'O código IBGE deve ter exatamente 7 dígitos numéricos'
        }),
    estadoId: z.string().uuid('Estado é obrigatório'),
});

interface CityCreationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (city: City) => void;
    selectedStateId?: string;
}

const CityCreationDialog = ({
    open,
    onOpenChange,
    onSuccess,
    selectedStateId
}: CityCreationDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nome: '',
            codigoIbge: '',
            estadoId: selectedStateId || '',
        },
    });

    useEffect(() => {
        if (selectedStateId) {
            form.setValue('estadoId', selectedStateId);
        }
    }, [selectedStateId, form]);

    useEffect(() => {
        if (!open) {
            form.reset({
                nome: '',
                codigoIbge: '',
                estadoId: selectedStateId || '',
            });
        }
    }, [open, form, selectedStateId]);

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            const createData: CreateCityDto = {
                nome: data.nome,
                codigoIbge: data.codigoIbge && data.codigoIbge.trim() !== '' ? data.codigoIbge : undefined,
                estadoId: data.estadoId,
            };

            const newCity = await cityApi.create(createData);
            toast.success(`Cidade ${data.nome} criada com sucesso!`);

            onSuccess(newCity);
            onOpenChange(false);
        } catch (error: any) {
            console.error('Erro ao criar cidade:', error);
            toast.error(error.message || "Ocorreu um erro ao criar a cidade.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Adicionar nova cidade</DialogTitle>
                    <DialogDescription>
                        Preencha os campos abaixo para cadastrar uma nova cidade.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                        <input type="hidden" {...form.register('estadoId')} />

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

export default CityCreationDialog;