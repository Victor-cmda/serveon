import { MapPin, Home, Hash, Building } from 'lucide-react';
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
import { City } from '../../../types/location';
import CEPField from '../../../components/CEPField';

interface AddressSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  formatters: {
    text: (value: string | undefined, maxLength?: number) => string;
  };
  selectedCity: City | null;
  setCitySearchOpen: (open: boolean) => void;
  setSelectedCity: (city: City | null) => void;
}

const AddressSection = ({
  form,
  isLoading,
  formatters,
  selectedCity,
  setCitySearchOpen,
  setSelectedCity,
}: AddressSectionProps) => {
  // Função para preencher campos quando endereço é encontrado via CEP
  const handleAddressFound = (address: {
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
  }) => {
    // Preenche os campos se estiverem vazios
    if (!form.getValues('endereco') && address.endereco) {
      form.setValue('endereco', address.endereco);
    }
    if (!form.getValues('bairro') && address.bairro) {
      form.setValue('bairro', address.bairro);
    }
  };

  // Função para selecionar cidade automaticamente quando encontrada no cadastro
  const handleCityFound = (city: City) => {
    if (!selectedCity || selectedCity.id !== city.id) {
      setSelectedCity(city);
      form.setValue('cidadeId', city.id);
    }
  };

  return (
    <div className="space-y-4">
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
                    placeholder="Digite o endereço"
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
              <FormLabel className="text-base font-medium">
                Número
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    value={formatters.text(field.value, 10)}
                    onChange={(e) => field.onChange(formatters.text(e.target.value, 10))}
                    disabled={isLoading}
                    className="h-10 text-base pl-9"
                    placeholder="Número"
                  />
                  <Hash className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
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
              <FormLabel className="text-base font-medium">
                Bairro
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    value={formatters.text(field.value, 50)}
                    onChange={(e) => field.onChange(formatters.text(e.target.value, 50))}
                    disabled={isLoading}
                    className="h-10 text-base pl-9"
                    placeholder="Bairro"
                  />
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
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
                <div className="relative">
                  <Input
                    {...field}
                    value={formatters.text(field.value, 50)}
                    onChange={(e) => field.onChange(formatters.text(e.target.value, 50))}
                    disabled={isLoading}
                    className="h-10 text-base pl-9"
                    placeholder="Complemento"
                  />
                  <Building className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <FormItem className="md:col-span-1">
          <FormLabel className="text-base font-medium">Cód. Cidade</FormLabel>
          <FormControl>
            <Input
              value={selectedCity?.id || ''}
              disabled
              className="bg-muted h-10 text-base"
              placeholder="-"
            />
          </FormControl>
        </FormItem>

        <FormItem className="md:col-span-7">
          <FormLabel className="text-base font-medium">
            Cidade
          </FormLabel>
          <FormControl>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCitySearchOpen(true)}
              disabled={isLoading}
              className="w-full h-10 justify-start pl-3"
            >
              <MapPin className="mr-2 h-5 w-5" />
              {selectedCity ? (
                <span className="truncate">
                  {selectedCity.nome} - {selectedCity.uf}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Selecionar cidade...
                </span>
              )}
            </Button>
          </FormControl>
          <FormMessage className="text-sm" />
        </FormItem>

        <div className="md:col-span-4">
          <CEPField 
            form={form}
            disabled={isLoading}
            onAddressFound={handleAddressFound}
            onCityFound={handleCityFound}
          />
        </div>
      </div>
    </div>
  );
};

export default AddressSection;
