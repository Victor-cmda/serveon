import { CreditCard } from "lucide-react";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface DocumentsFormData {
  cnpjCpf: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  [key: string]: any;
}

interface Formatters {
  cnpj: (value: string | undefined) => string;
  cpf: (value: string | undefined) => string;
  inscricaoEstadual: (value: string | undefined) => string;
}

interface DocumentsSectionProps {
  form: UseFormReturn<DocumentsFormData>;
  isLoading: boolean;
  formatters: Formatters;
  watchTipo: 'J' | 'F';
  watchIsEstrangeiro: boolean;
}

const DocumentsSection = ({ 
  form, 
  isLoading, 
  formatters, 
  watchTipo, 
  watchIsEstrangeiro
}: DocumentsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          <FormField
            control={form.control}
            name="cnpjCpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  {watchTipo === 'J' ? 'CNPJ' : 'CPF'}
                  {watchIsEstrangeiro && ' / Documento'}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      value={watchTipo === 'J' ? formatters.cnpj(field.value) : formatters.cpf(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isLoading}
                      className="h-10 text-base pl-9"
                    />
                    <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
        </div>

        <div className="lg:col-span-4">
          <FormField
            control={form.control}
            name="inscricaoEstadual"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  {watchIsEstrangeiro
                    ? 'Documento adicional'
                    : 'Inscrição Estadual / RG'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={formatters.inscricaoEstadual(field.value)}
                    onChange={(e) => field.onChange(e.target.value)}
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
      {watchTipo === 'J' && (
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="inscricaoMunicipal"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  {watchIsEstrangeiro
                    ? 'Registro comercial'
                    : 'Inscrição Municipal'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={formatters.inscricaoEstadual(field.value)}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={isLoading}
                    className="h-10 text-base"
                  />
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
