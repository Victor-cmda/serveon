import { DollarSign, Search, Flag } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { UseFormReturn } from 'react-hook-form';
import { Country } from '../../../types/location';

interface FinancialDataSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  selectedCountry: Country | null;
  setCountrySearchOpen: (open: boolean) => void;
}

const FinancialDataSection = ({
  form,
  isLoading,
  selectedCountry,
  setCountrySearchOpen,
}: FinancialDataSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="limiteCredito"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Limite de Crédito
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    value={field.value || ''}
                    disabled={isLoading}
                    placeholder="0,00"
                    className="h-10 text-base pl-9"
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseFloat(value) : undefined);
                    }}
                  />
                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nacionalidadeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Nacionalidade
              </FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <div className="w-full flex-1">
                    <div className="relative">
                      <Input
                        value={selectedCountry?.nome || ''}
                        readOnly
                        placeholder="Selecione uma nacionalidade"
                        className="h-10 text-base pl-9 cursor-pointer"
                        onClick={() => setCountrySearchOpen(true)}
                        disabled={isLoading}
                      />
                      <Flag className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <input type="hidden" {...field} />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setCountrySearchOpen(true)}
                    className="h-10 w-10"
                    disabled={isLoading}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default FinancialDataSection;
