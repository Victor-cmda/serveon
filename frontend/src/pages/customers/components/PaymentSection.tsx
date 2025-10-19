import { CreditCard, Search } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { PaymentTerm } from '../../../types/payment-term';

interface PaymentSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  selectedPaymentTerm: PaymentTerm | null;
  setPaymentTermSearchOpen: (open: boolean) => void;
}

const PaymentSection = ({
  form,
  isLoading,
  selectedPaymentTerm,
  setPaymentTermSearchOpen,
}: PaymentSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        <FormItem className="md:col-span-1">
          <FormLabel className="text-base font-medium">Cód. Cond. Pgto</FormLabel>
          <FormControl>
            <Input
              value={selectedPaymentTerm?.id || ''}
              disabled
              className="bg-muted h-10 text-base"
              placeholder="-"
            />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="condicaoPagamentoId"
          render={({ field }) => (
            <FormItem className="md:col-span-7">
              <FormLabel className="text-base font-medium">
                Condição de Pagamento
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <div className="flex w-full items-center gap-2">
                    <div className="relative flex-grow">
                      {' '}
                      <Input
                        value={selectedPaymentTerm?.name || ''}
                        readOnly
                        placeholder="Selecione uma condição de pagamento"
                        className="cursor-pointer h-10 text-base pl-9"
                        onClick={() => setPaymentTermSearchOpen(true)}
                        disabled={isLoading}
                      />
                      <input
                        type="hidden"
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        ref={field.ref}
                        onBlur={field.onBlur}
                      />
                      <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setPaymentTermSearchOpen(true)}
                      className="h-10 w-10"
                      disabled={isLoading}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
              </div>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default PaymentSection;
