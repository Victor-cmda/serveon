import { MapPin, Home, Search } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { City } from '../../../types/location';
import { getValidationMessage, getFieldValidationClass } from '../utils/validationUtils';

interface Formatters {
  numero: (value: string | undefined) => string;
  cep: (value: string | undefined) => string;
  text: (value: string | undefined, maxLength?: number) => string;
}

interface AddressSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  formatters: Formatters;
  selectedCity: City | null;
  watchIsEstrangeiro: boolean;
  setCitySearchOpen: (open: boolean) => void;
}

const AddressSection = ({
  form,
  isLoading,
  formatters,
  selectedCity,
  watchIsEstrangeiro,
  setCitySearchOpen,
}: AddressSectionProps) => {
  const cepValue = form.watch('cep');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <FormField
            control={form.control}
            name="endereco"
            render={({ field }) => (
              <FormItem className="md:col-span-5">
                <FormLabel className="text-base font-medium">
                  Endereço
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      value={formatters.text(field.value, 100)}
                      onChange={(e) => field.onChange(formatters.text(e.target.value, 100))}
                      disabled={isLoading}
                      className="h-10 text-base pl-9"
                      placeholder="Digite o endereço (opcional)"
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
                    value={formatters.numero(field.value)}
                    onChange={(e) => field.onChange(formatters.numero(e.target.value))}
                    disabled={isLoading}
                    className="h-10 text-base"
                    placeholder="123"
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
                    value={formatters.text(field.value, 50)}
                    onChange={(e) => field.onChange(formatters.text(e.target.value, 50))}
                    disabled={isLoading}
                    className="h-10 text-base"
                    placeholder="Digite o bairro (opcional)"
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
                    value={formatters.text(field.value, 50)}
                    onChange={(e) => field.onChange(formatters.text(e.target.value, 50))}
                    disabled={isLoading}
                    className="h-10 text-base"
                    placeholder="Apto, sala, etc."
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
                {selectedCity && (
                  <div className="mt-1 flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {selectedCity.estadoNome} / {selectedCity.uf}
                    </Badge>
                    {selectedCity.paisNome && (
                      <Badge
                        variant={watchIsEstrangeiro ? 'secondary' : 'outline'}
                      >
                        {selectedCity.paisNome}
                        {watchIsEstrangeiro && ' (Estrangeiro)'}
                      </Badge>
                    )}
                  </div>
                )}
                {field.value && !selectedCity && (
                  <div className="mt-1">
                    <Badge variant="outline">
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
                    value={formatters.cep(field.value)}
                    onChange={(e) => field.onChange(formatters.cep(e.target.value))}
                    disabled={isLoading}
                    className={`h-10 text-base ${getFieldValidationClass(cepValue, 'cep')}`}
                    placeholder="00000-000"
                  />
                </FormControl>
                {cepValue && (
                  <div className="mt-1 text-xs">
                    <span className={
                      getValidationMessage(cepValue, 'cep').includes('✓') 
                        ? 'text-green-600' 
                        : 'text-amber-600'
                    }>
                      {getValidationMessage(cepValue, 'cep')}
                    </span>
                  </div>
                )}
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
        </div>{' '}
      </div>
    </div>
  );
};

export default AddressSection;
