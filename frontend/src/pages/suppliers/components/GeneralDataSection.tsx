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
  watchTipo: 'J' | 'F';
  id?: string;
}

const GeneralDataSection = ({ form, isLoading, watchTipo, id }: GeneralDataSectionProps) => {
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
      />      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {id && (
          <FormItem className="md:col-span-1">
            <FormLabel className="text-base font-medium">Código</FormLabel>
            <FormControl>
              <Input value={id} disabled className="bg-muted h-10 text-base" />
            </FormControl>
            <p className="text-sm text-muted-foreground">
              ID único do fornecedor
            </p>
          </FormItem>
        )}
        
        <FormField
          control={form.control}
          name="razaoSocial"
          render={({ field }) => (
            <FormItem className={id ? "md:col-span-7" : "md:col-span-8"}>
              <FormLabel className="text-base font-medium">
                {watchTipo === 'J' ? 'Razão Social' : 'Nome Completo'}
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    {...field}
                    disabled={isLoading}
                    className="h-10 text-base pl-9"
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
            <FormItem className="md:col-span-4">
              <FormLabel className="text-base font-medium">
                {watchTipo === 'J' ? 'Nome Fantasia' : 'Apelido'}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isLoading}
                  className="h-10 text-base"
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
