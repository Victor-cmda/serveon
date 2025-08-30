import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { paymentMethodApi } from '@/services/api';
import { PaymentMethod, CreatePaymentMethodDto } from '@/types/payment-method';

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome é obrigatório e deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  type: z
    .string()
    .min(1, 'Tipo é obrigatório'),
  active: z.boolean().default(true),
});

interface PaymentMethodCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (paymentMethod: PaymentMethod) => void;
  paymentMethod?: PaymentMethod | null; // Método de pagamento para edição
}

const PaymentMethodCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  paymentMethod,
}: PaymentMethodCreationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: '',
      active: true,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        name: '',
        type: '',
        active: true,
      });
    } else if (paymentMethod) {
      form.reset({
        name: paymentMethod.name,
        type: paymentMethod.type,
        active: paymentMethod.ativo,
      });
    }
  }, [open, form, paymentMethod]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const formData: CreatePaymentMethodDto = {
        name: data.name,
        type: data.type,
        ativo: data.active,
      };

      let savedPaymentMethod;

      if (paymentMethod) {
        // Edição de método de pagamento existente
        savedPaymentMethod = await paymentMethodApi.update(paymentMethod.id, formData);
        toast.success(`Método de pagamento ${data.name} atualizado com sucesso!`);
      } else {
        // Criação de novo método de pagamento
        savedPaymentMethod = await paymentMethodApi.create(formData);
        toast.success(`Método de pagamento ${data.name} criado com sucesso!`);
      }      // Return the saved payment method to the parent component and close dialog
      onSuccess(savedPaymentMethod);
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Erro ao salvar método de pagamento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro ao salvar o método de pagamento.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-full p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {paymentMethod ? 'Editar Método de Pagamento' : 'Novo Método de Pagamento'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {paymentMethod
              ? 'Altere as informações do método de pagamento.'
              : 'Preencha as informações para criar um novo método de pagamento.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Método</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Cartão de Crédito, PIX, Dinheiro"
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de pagamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="debito">Cartão de Débito</SelectItem>
                        <SelectItem value="credito">Cartão de Crédito</SelectItem>
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="boleto">Boleto</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="transferencia">Transferência</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Status</FormLabel>
                    <FormDescription className="text-xs">
                      Método de pagamento ativo e disponível para uso
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {paymentMethod ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodCreationDialog;