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
import { getValidationMessage, getFieldValidationClass } from "../utils/validationUtils";

interface Formatters {
  cnpj: (value: string | undefined) => string;
  cpf: (value: string | undefined) => string;
  inscricaoEstadual: (value: string | undefined) => string;
  rg: (value: string | undefined) => string;
}

interface DocumentsSectionProps {
  form: UseFormReturn<any>;
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
  const cnpjCpfValue = form.watch('cnpjCpf');
  const inscricaoEstadualValue = form.watch('inscricaoEstadual');
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
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
                      onChange={(e) => {
                        const formatted = watchTipo === 'J' ? formatters.cnpj(e.target.value) : formatters.cpf(e.target.value);
                        field.onChange(formatted);
                      }}
                      disabled={isLoading}
                      className={`h-10 text-base pl-9 ${getFieldValidationClass(cnpjCpfValue, 'cnpjCpf', watchTipo, watchIsEstrangeiro)}`}
                      placeholder={watchTipo === 'J' ? '00.000.000/0000-00' : '000.000.000-00'}
                    />
                    <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </FormControl>
                {cnpjCpfValue && (
                  <div className="mt-1 text-xs">
                    <span className={
                      getValidationMessage(cnpjCpfValue, 'cnpjCpf', watchTipo, watchIsEstrangeiro).includes('✓') 
                        ? 'text-green-600' 
                        : 'text-amber-600'
                    }>
                      {getValidationMessage(cnpjCpfValue, 'cnpjCpf', watchTipo, watchIsEstrangeiro)}
                    </span>
                  </div>
                )}
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
        </div>

        <div className="lg:col-span-6">
          <FormField
            control={form.control}
            name="inscricaoEstadual"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  {watchIsEstrangeiro
                    ? 'Documento adicional'
                    : watchTipo === 'J' 
                      ? 'Inscrição Estadual' 
                      : 'RG (Registro Geral)'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={watchTipo === 'J' 
                      ? formatters.inscricaoEstadual(field.value)
                      : formatters.rg(field.value)}
                    onChange={(e) => {
                      const formatted = watchTipo === 'J' 
                        ? formatters.inscricaoEstadual(e.target.value)
                        : formatters.rg(e.target.value);
                      field.onChange(formatted);
                    }}
                    disabled={isLoading}
                    className={`h-10 text-base ${getFieldValidationClass(inscricaoEstadualValue, 'inscricaoEstadual', watchTipo, watchIsEstrangeiro)}`}
                    placeholder={watchIsEstrangeiro 
                      ? 'Documento adicional' 
                      : watchTipo === 'J' 
                        ? 'Número da Inscrição Estadual' 
                        : 'Número do RG'}
                  />
                </FormControl>
                {inscricaoEstadualValue && (
                  <div className="mt-1 text-xs">
                    <span className={
                      getValidationMessage(inscricaoEstadualValue, 'inscricaoEstadual', watchTipo, watchIsEstrangeiro).includes('✓') 
                        ? 'text-green-600' 
                        : 'text-amber-600'
                    }>
                      {getValidationMessage(inscricaoEstadualValue, 'inscricaoEstadual', watchTipo, watchIsEstrangeiro)}
                    </span>
                  </div>
                )}
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentsSection;
