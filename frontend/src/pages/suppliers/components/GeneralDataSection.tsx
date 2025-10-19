import { Building2, User } from "lucide-react";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface GeneralDataSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  watchTipo: string;
  formatters: {
    text: (value: string, maxLength: number) => string;
  };
}

const GeneralDataSection = ({ form, isLoading, watchTipo, formatters }: GeneralDataSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="tipo"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-base font-medium">
              Tipo de Pessoa
            </FormLabel>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="juridica"
                  value="J"
                  checked={field.value === 'J'}
                  onChange={() => field.onChange('J')}
                />
                <label htmlFor="juridica" className="text-base flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  Jurídica
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="fisica"
                  value="F"
                  checked={field.value === 'F'}
                  onChange={() => field.onChange('F')}
                />
                <label htmlFor="fisica" className="text-base flex items-center gap-1">
                  <User className="h-4 w-4" />
                  Física
                </label>
              </div>
            </div>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="razaoSocial"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                {watchTipo === 'J' ? 'Razão Social *' : 'Nome Completo *'}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    value={formatters.text(field.value, 100)}
                    onChange={(e) => field.onChange(formatters.text(e.target.value, 100))}
                    disabled={isLoading}
                    className="h-10 text-base pl-9"
                    placeholder={watchTipo === 'J' ? 'Digite a razão social' : 'Digite o nome completo'}
                  />
                  {watchTipo === 'J' ? 
                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" /> : 
                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  }
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nomeFantasia"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                {watchTipo === 'J' ? 'Nome Fantasia' : 'Apelido'}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatters.text(field.value, 100)}
                  onChange={(e) => field.onChange(formatters.text(e.target.value, 100))}
                  disabled={isLoading}
                  className="h-10 text-base"
                  placeholder={watchTipo === 'J' ? 'Digite o nome fantasia (opcional)' : 'Digite o apelido (opcional)'}
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

export default GeneralDataSection;
