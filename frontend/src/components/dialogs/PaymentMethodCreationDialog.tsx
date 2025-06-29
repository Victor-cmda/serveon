import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  description: z
    .string()
    .min(2, 'Descrição é obrigatória e deve ter pelo menos 2 caracteres'),
  code: z.string().optional(),
  type: z.string().optional(),
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
      description: '',
      code: '',
      type: '',
      active: true,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        description: '',
        code: '',
        type: '',
        active: true,
      });
    } else if (paymentMethod) {
      form.reset({
        description: paymentMethod.description,
        code: paymentMethod.code,
        type: paymentMethod.type,
        active: paymentMethod.active,
      });
    }
  }, [open, form, paymentMethod]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const formData: CreatePaymentMethodDto = {
        description: data.description,
        code: data.code || undefined,
        type: data.type || undefined,
        active: data.active,
      };

      let savedPaymentMethod;

      if (paymentMethod) {
        // Edição de método de pagamento existente
        savedPaymentMethod = await paymentMethodApi.update(paymentMethod.id, formData);
        toast.success(`Método de pagamento ${data.description} atualizado com sucesso!`);
      } else {
        // Criação de novo método de pagamento
        savedPaymentMethod = await paymentMethodApi.create(formData);
        toast.success(`Método de pagamento ${data.description} criado com sucesso!`);
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
      <DialogContent className="sm:max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] max-h-[90vh] p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {paymentMethod ? 'Editar método de pagamento' : 'Adicionar novo método de pagamento'}
          </DialogTitle>
          <DialogDescription className="text-base">
            {paymentMethod
              ? 'Altere os campos abaixo para atualizar o método de pagamento.'
              : 'Preencha os campos abaixo para cadastrar um novo método de pagamento.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Descrição
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Cartão de Crédito"
                      {...field}
                      disabled={isLoading}
                      className="h-11 text-base"
                    />
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Código
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: CC"
                        {...field}
                        value={field.value || ''}
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
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Tipo
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Cartão"
                        {...field}
                        value={field.value || ''}
                        disabled={isLoading}
                        className="h-11 text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-base font-medium">
                      Ativo
                    </FormLabel>
                    <FormDescription>
                      Indica se o método de pagamento está disponível para uso
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="h-11 px-6 text-base"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-6 text-base"
              >
                {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodCreationDialog;