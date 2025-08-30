import { CreditCard, FileText } from "lucide-react";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { getFieldValidationClass } from '../utils/validationUtils';
import { cn } from '../../../lib/utils';

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
  // Função para obter o formatador adequado baseado no tipo
  const getDocumentFormatter = (value: string | undefined) => {
    if (watchIsEstrangeiro) {
      return value || '';
    }
    return watchTipo === 'J' ? formatters.cnpj(value) : formatters.cpf(value);
  };

  // Função para obter o formatador de inscrição/RG baseado no tipo
  const getInscricaoFormatter = (value: string | undefined) => {
    if (watchIsEstrangeiro) {
      return value || '';
    }
    return watchTipo === 'F' ? formatters.rg(value) : formatters.inscricaoEstadual(value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <FormField
            control={form.control}
            name="cnpjCpf"
            render={({ field }) => {
              const validationClass = getFieldValidationClass(
                field.value, 
                'cnpjCpf', 
                watchTipo, 
                watchIsEstrangeiro
              );
              
              return (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    {watchIsEstrangeiro 
                      ? 'Documento de Identificação'
                      : watchTipo === 'J' ? 'CNPJ' : 'CPF'
                    }
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        value={getDocumentFormatter(field.value || '')}
                        onChange={(e) => field.onChange(e.target.value || '')}
                        disabled={isLoading}
                        placeholder={
                          watchIsEstrangeiro 
                            ? 'Número do documento'
                            : watchTipo === 'J' ? '00.000.000/0000-00' : '000.000.000-00'
                        }
                        className={cn(
                          "h-10 text-base pl-9 transition-colors duration-200",
                          validationClass
                        )}
                      />
                      <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              );
            }}
          />
        </div>

        <div className="lg:col-span-6">
          <FormField
            control={form.control}
            name="inscricaoEstadual"
            render={({ field }) => {
              const validationClass = getFieldValidationClass(
                field.value, 
                'inscricaoEstadual', 
                watchTipo, 
                watchIsEstrangeiro
              );
              
              return (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    {watchIsEstrangeiro
                      ? 'Documento Adicional'
                      : watchTipo === 'F' 
                        ? 'RG' 
                        : 'Inscrição Estadual'
                    }
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        value={getInscricaoFormatter(field.value || '')}
                        onChange={(e) => field.onChange(e.target.value || '')}
                        disabled={isLoading}
                        placeholder={
                          watchIsEstrangeiro
                            ? 'Documento adicional'
                            : watchTipo === 'F' 
                              ? '00.000.000-0' 
                              : 'Número da Inscrição Estadual'
                        }
                        className={cn(
                          "h-10 text-base pl-9 transition-colors duration-200",
                          validationClass
                        )}
                      />
                      <FileText className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-sm" />
                </FormItem>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentsSection;
