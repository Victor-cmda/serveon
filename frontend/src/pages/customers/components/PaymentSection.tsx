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
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-lg font-semibold text-foreground">Pagamento</h4>
        <div className="flex-1 h-px bg-border"></div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="condicaoPagamentoId"
          render={({ field }) => (
            <FormItem>
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
              {selectedPaymentTerm && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedPaymentTerm.description || 'Sem descrição adicional'}
                </div>
              )}
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default PaymentSection;
