import { Building2, Truck } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface GeneralDataSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  id?: string;
  formatters: {
    text: (value: string | undefined, maxLength?: number) => string;
  };
}

const GeneralDataSection = ({
  form,
  isLoading,
  id,
  formatters,
}: GeneralDataSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <FormItem className="md:col-span-2">
          <FormLabel className="text-base font-medium">Código</FormLabel>
          <FormControl>
            <Input
              value={id || 'Novo'}
              disabled
              className="bg-muted h-10 text-base"
            />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem className="md:col-span-10">
              <FormLabel className="text-base font-medium">
                Nome da Transportadora *
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    value={formatters.text(field.value, 100)}
                    onChange={(e) => field.onChange(formatters.text(e.target.value, 100))}
                    disabled={isLoading}
                    className="h-10 text-base pl-9"
                    placeholder="Digite o nome da transportadora"
                  />
                  <Truck className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="nomeFantasia"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Nome Fantasia
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  value={formatters.text(field.value, 100)}
                  onChange={(e) => field.onChange(formatters.text(e.target.value, 100))}
                  disabled={isLoading}
                  className="h-10 text-base pl-9"
                  placeholder="Digite o nome fantasia (opcional)"
                />
                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default GeneralDataSection;
