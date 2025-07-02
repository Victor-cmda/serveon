import { Search, MapPin } from 'lucide-react';
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
  const formatCEP = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 8);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormField
          control={form.control}
          name="cep"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input
                  placeholder="12345678"
                  {...field}
                  disabled={isLoading}
                  onChange={(e) => field.onChange(formatCEP(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endereço</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Rua das Flores"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="numero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número</FormLabel>
              <FormControl>
                <Input
                  placeholder="123"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="complemento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complemento</FormLabel>
              <FormControl>
                <Input
                  placeholder="Apto 45, Bloco B"
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
          name="bairro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input
                  placeholder="Centro"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="cidadeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cidade</FormLabel>
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
            {selectedCity && (
              <div className="mt-1">
                <Badge variant="outline">
                  {selectedCity.nome} - {selectedCity.uf}
                </Badge>
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EmployeeAddressSection;
