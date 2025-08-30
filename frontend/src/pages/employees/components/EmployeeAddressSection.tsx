import { Search, MapPin, Home } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { UseFormReturn } from 'react-hook-form';
import { City } from '../../../types/location';
import {
  formatCEP,
  formatText,
  formatNumber,
  getFieldValidationClass,
  getValidationMessage,
} from '../utils/validationUtils';

interface EmployeeAddressSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  selectedCity: City | null;
  setCitySearchOpen: (open: boolean) => void;
}

const EmployeeAddressSection = ({
  form,
  isLoading,
  selectedCity,
  setCitySearchOpen,
}: EmployeeAddressSectionProps) => {
  const cepValue = form.watch('cep');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <FormField
          control={form.control}
          name="endereco"
          render={({ field }) => (
            <FormItem className="md:col-span-5">
              <FormLabel className="text-base font-medium">Endereço</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    value={formatText(field.value, 100)}
                    onChange={(e) =>
                      field.onChange(formatText(e.target.value, 100))
                    }
                    placeholder="Digite o endereço"
                    disabled={isLoading}
                    className="h-10 text-base pl-9"
                  />
                  <Home className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numero"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-base font-medium">Número</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatNumber(field.value)}
                  onChange={(e) => field.onChange(formatNumber(e.target.value))}
                  placeholder="123"
                  disabled={isLoading}
                  className="h-10 text-base"
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bairro"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-base font-medium">Bairro</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatText(field.value, 50)}
                  onChange={(e) =>
                    field.onChange(formatText(e.target.value, 50))
                  }
                  placeholder="Digite o bairro"
                  disabled={isLoading}
                  className="h-10 text-base"
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="complemento"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel className="text-base font-medium">
                Complemento
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatText(field.value, 50)}
                  onChange={(e) =>
                    field.onChange(formatText(e.target.value, 50))
                  }
                  placeholder="Apto, sala, etc."
                  disabled={isLoading}
                  className="h-10 text-base"
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <FormField
          control={form.control}
          name="cidadeId"
          render={({ field }) => (
            <FormItem className="md:col-span-8">
              <FormLabel className="text-base font-medium">Cidade</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <div className="flex w-full items-center gap-2">
                    <div className="relative flex-grow">
                      <Input
                        value={selectedCity?.nome || ''}
                        readOnly
                        placeholder="Selecione uma cidade"
                        className="cursor-pointer h-10 text-base pl-9"
                        onClick={() => setCitySearchOpen(true)}
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
                      <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setCitySearchOpen(true)}
                      className="h-10 w-10"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
              </div>
              {field.value && !selectedCity && (
                <div className="mt-1">
                  <Badge variant="outline" className="bg-yellow-50">
                    Cidade selecionada mas dados não carregados. ID:{' '}
                    {field.value}
                  </Badge>
                </div>
              )}
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cep"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-base font-medium">CEP</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatCEP(field.value)}
                  onChange={(e) => field.onChange(formatCEP(e.target.value))}
                  placeholder="00000-000"
                  disabled={isLoading}
                  className={`h-10 text-base ${getFieldValidationClass(cepValue, 'cep')}`}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default EmployeeAddressSection;
