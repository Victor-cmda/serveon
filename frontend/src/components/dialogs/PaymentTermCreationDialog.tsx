import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, Search, Trash } from 'lucide-react';
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
import { paymentTermApi, paymentMethodApi } from '@/services/api';
import {
  PaymentTerm,
  CreatePaymentTermDto,
  CreatePaymentTermInstallmentDto,
} from '@/types/payment-term';
import { PaymentMethod } from '@/types/payment-method';
import { SearchDialog } from '@/components/SearchDialog';
import PaymentMethodCreationDialog from './PaymentMethodCreationDialog';

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome é obrigatório e deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  installments: z
    .array(
      z.object({
        installmentNumber: z
          .number()
          .min(1, 'Número da parcela deve ser maior que 0'),
        paymentMethodId: z.string().uuid('Método de pagamento é obrigatório'),
        daysToPayment: z
          .number()
          .min(0, 'Dias para pagamento deve ser maior ou igual a 0'),
        percentageValue: z
          .number()
          .min(0, 'Porcentagem deve ser maior ou igual a 0')
          .max(100, 'Porcentagem não pode ser maior que 100'),
        interestRate: z
          .number()
          .min(0, 'Taxa de juros deve ser maior ou igual a 0')
          .optional(),
        isActive: z.boolean().default(true),
      }),
    )
    .min(1, 'Pelo menos uma parcela é obrigatória'),
});

interface PaymentTermCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (paymentTerm: PaymentTerm) => void;
  paymentTerm?: PaymentTerm | null; // Condição de pagamento para edição
}

const PaymentTermCreationDialog = ({
  open,
  onOpenChange,
  onSuccess,
  paymentTerm,
}: PaymentTermCreationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethodSearchOpen, setPaymentMethodSearchOpen] = useState(false);
  const [paymentMethodDialogOpen, setPaymentMethodDialogOpen] = useState(false);
  const [paymentMethodToEdit, setPaymentMethodToEdit] =
    useState<PaymentMethod | null>(null);
  const [currentInstallmentIndex, setCurrentInstallmentIndex] =
    useState<number>(-1);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      installments: [
        {
          installmentNumber: 1,
          paymentMethodId: '',
          daysToPayment: 0,
          percentageValue: 100,
          interestRate: 0,
          isActive: true,
        },
      ],
    },
  });

  useEffect(() => {
    if (open) {
      const loadPaymentMethods = async () => {
        try {
          const data = await paymentMethodApi.getAll();
          setPaymentMethods(data.filter((method) => method.active));
        } catch (error) {
          console.error('Erro ao carregar métodos de pagamento:', error);
          toast.error('Não foi possível carregar os métodos de pagamento');
        }
      };

      loadPaymentMethods();

      if (paymentTerm) {
        form.reset({
          name: paymentTerm.name || '',
          description: paymentTerm.description || '',
          isActive: paymentTerm.isActive,
          installments: paymentTerm.installments.map((inst) => ({
            installmentNumber: inst.installmentNumber,
            paymentMethodId: inst.paymentMethodId,
            daysToPayment: inst.daysToPayment,
            percentageValue: inst.percentageValue,
            interestRate: inst.interestRate,
            isActive: inst.isActive,
          })),
        });
      } else {
        form.reset({
          name: '',
          description: '',
          isActive: true,
          installments: [
            {
              installmentNumber: 1,
              paymentMethodId: '',
              daysToPayment: 0,
              percentageValue: 100,
              interestRate: 0,
              isActive: true,
            },
          ],
        });
      }
    }
  }, [open, form, paymentTerm]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const formData: CreatePaymentTermDto = {
        name: data.name,
        description: data.description || undefined,
        isActive: data.isActive,
        installments: data.installments.map((inst) => ({
          installmentNumber: inst.installmentNumber,
          paymentMethodId: inst.paymentMethodId,
          daysToPayment: inst.daysToPayment,
          percentageValue: inst.percentageValue,
          interestRate: inst.interestRate || 0,
          isActive: inst.isActive,
        })),
      };

      let savedPaymentTerm;

      if (paymentTerm) {
        // Edição de condição de pagamento existente
        savedPaymentTerm = await paymentTermApi.update(
          paymentTerm.id,
          formData,
        );
        toast.success(
          `Condição de pagamento ${data.name} atualizada com sucesso!`,
        );      } else {
        // Criação de nova condição de pagamento
        savedPaymentTerm = await paymentTermApi.create(formData);
        toast.success(`Condição de pagamento ${data.name} criada com sucesso!`);
      }

      // Return the saved payment term to the parent component and close dialog.
      // This enables proper cascading form behavior where the created payment term
      // is passed back to the parent form without redirecting to a list view.
      onSuccess(savedPaymentTerm);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao salvar condição de pagamento:', error);
      toast.error(
        error.message || 'Ocorreu um erro ao salvar a condição de pagamento.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addInstallment = () => {
    const currentInstallments = form.getValues('installments');
    const lastInstallment = currentInstallments[currentInstallments.length - 1];

    const newInstallment: CreatePaymentTermInstallmentDto = {
      installmentNumber: lastInstallment.installmentNumber + 1,
      paymentMethodId: lastInstallment.paymentMethodId,
      daysToPayment: lastInstallment.daysToPayment + 30,
      percentageValue: 0,
      interestRate: 0,
      isActive: true,
    };

    form.setValue('installments', [
      ...currentInstallments.map((inst) => ({
        ...inst,
        isActive: inst.isActive ?? true,
      })),
      { ...newInstallment, isActive: newInstallment.isActive ?? true },
    ]);
  };

  const removeInstallment = (index: number) => {
    const currentInstallments = form.getValues('installments');
    if (currentInstallments.length <= 1) {
      toast.error('É necessário ter pelo menos uma parcela');
      return;
    }

    const newInstallments = [...currentInstallments];
    newInstallments.splice(index, 1);

    // Renumerar as parcelas
    newInstallments.forEach((inst, idx) => {
      inst.installmentNumber = idx + 1;
    });

    form.setValue('installments', newInstallments);
  };

  const onSelectPaymentMethod = (method: PaymentMethod, index: number) => {
    const path = `installments.${index}.paymentMethodId` as const;
    form.setValue(path, method.id, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    setPaymentMethodSearchOpen(false);
  };

  const handlePaymentMethodCreated = (newMethod: PaymentMethod) => {
    setPaymentMethods((prev) => [...prev, newMethod]);

    if (currentInstallmentIndex >= 0) {
      const path = `installments.${currentInstallmentIndex}.paymentMethodId` as const;
      form.setValue(path, newMethod.id, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }

    setPaymentMethodDialogOpen(false);
    setCurrentInstallmentIndex(-1);
  };

  const handleEditPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethodToEdit(method);
    setPaymentMethodSearchOpen(false);
    setPaymentMethodDialogOpen(true);
  };

  const handlePaymentMethodUpdated = (updatedMethod: PaymentMethod) => {
    setPaymentMethods((prev) =>
      prev.map((method) =>
        method.id === updatedMethod.id ? updatedMethod : method,
      ),
    );
    setPaymentMethodToEdit(null);
  };

  const openPaymentMethodSearch = (index: number) => {
    setCurrentInstallmentIndex(index);
    setPaymentMethodSearchOpen(true);
  };

  const openNewPaymentMethodDialog = () => {
    setPaymentMethodToEdit(null);
    setPaymentMethodDialogOpen(true);
  };

  const getPaymentMethodName = (methodId: string) => {
    const method = paymentMethods.find((m) => m.id === methodId);
    return method ? method.description : '';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[65vw] max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {paymentTerm
                ? 'Editar condição de pagamento'
                : 'Adicionar nova condição de pagamento'}
            </DialogTitle>
            <DialogDescription className="text-base">
              {paymentTerm
                ? 'Altere os campos abaixo para atualizar a condição de pagamento.'
                : 'Preencha os campos abaixo para cadastrar uma nova condição de pagamento.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 py-4"
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Nome
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: À Vista"
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Descrição (opcional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Pagamento à vista sem desconto"
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
                name="isActive"
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
                        Indica se a condição de pagamento está disponível para
                        uso
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-lg font-medium">
                    Parcelas
                  </FormLabel>
                  <Button
                    type="button"
                    onClick={addInstallment}
                    disabled={isLoading}
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar Parcela
                  </Button>
                </div>

                <div className="border rounded-md p-4">
                  {form.watch('installments').map((_, index) => (
                    <div
                      key={index}
                      className="mb-6 pb-6 border-b last:border-b-0 last:mb-0 last:pb-0"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-base font-medium">
                          Parcela {index + 1}
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeInstallment(index)}
                          disabled={isLoading}
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`installments.${index}.installmentNumber`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">
                                Número da Parcela
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value))
                                  }
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
                          name={`installments.${index}.paymentMethodId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">
                                Método de Pagamento
                              </FormLabel>
                              <div className="flex gap-2">
                                <div className="w-full flex-1">
                                  <Input
                                    value={getPaymentMethodName(field.value)}
                                    readOnly
                                    placeholder="Selecione um método de pagamento"
                                    className="cursor-pointer h-11 text-base"
                                    onClick={() =>
                                      openPaymentMethodSearch(index)
                                    }
                                    disabled={isLoading}
                                  />
                                  <input type="hidden" {...field} />
                                </div>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  onClick={() => openPaymentMethodSearch(index)}
                                  disabled={isLoading}
                                  className="h-11 w-11"
                                >
                                  <Search className="h-5 w-5" />
                                </Button>
                              </div>
                              <FormMessage className="text-sm" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4">
                        <FormField
                          control={form.control}
                          name={`installments.${index}.daysToPayment`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">
                                Dias para Pagamento
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseInt(e.target.value))
                                  }
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
                          name={`installments.${index}.percentageValue`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">
                                Porcentagem (%)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
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
                          name={`installments.${index}.interestRate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-medium">
                                Taxa de Juros (%)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(parseFloat(e.target.value))
                                  }
                                  value={field.value || 0}
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
                  ))}
                </div>
              </div>

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
                  {isLoading && (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  )}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <SearchDialog
        open={paymentMethodSearchOpen}
        onOpenChange={setPaymentMethodSearchOpen}
        title="Selecionar Método de Pagamento"
        entities={paymentMethods}
        isLoading={isLoading}
        onSelect={(method) =>
          onSelectPaymentMethod(method, currentInstallmentIndex)
        }
        onCreateNew={openNewPaymentMethodDialog}
        onEdit={handleEditPaymentMethod}
        displayColumns={[
          { key: 'description', header: 'Descrição' },
          { key: 'code', header: 'Código' },
          { key: 'type', header: 'Tipo' },
        ]}
        searchKeys={['description', 'code', 'type']}
        entityType="metodos-pagamento"
        description="Selecione um método de pagamento para associar à parcela ou cadastre um novo método."
      />

      <PaymentMethodCreationDialog
        open={paymentMethodDialogOpen}
        onOpenChange={setPaymentMethodDialogOpen}
        onSuccess={
          paymentMethodToEdit
            ? handlePaymentMethodUpdated
            : handlePaymentMethodCreated
        }
        paymentMethod={paymentMethodToEdit}
      />
    </>
  );
};

export default PaymentTermCreationDialog;
