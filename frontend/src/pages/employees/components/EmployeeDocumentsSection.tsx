import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { formatCPF, formatRG, formatOrgaoEmissor, getFieldValidationClass } from '../utils/validationUtils';

interface EmployeeDocumentsSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  id?: string;
}

const EmployeeDocumentsSection = ({
  form,
  isLoading,
  id,
}: EmployeeDocumentsSectionProps) => {
  const cpfValue = form.watch('cpf');
  const rgValue = form.watch('rg');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">CPF *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatCPF(field.value)}
                  onChange={(e) => field.onChange(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  disabled={isLoading || !!id} // CPF não pode ser editado após criação
                  className={`h-10 text-base ${getFieldValidationClass(cpfValue, 'cpf')}`}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rg"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">RG</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatRG(field.value)}
                  onChange={(e) => field.onChange(formatRG(e.target.value))}
                  placeholder="00.000.000-0"
                  disabled={isLoading}
                  className={`h-10 text-base ${getFieldValidationClass(rgValue, 'rg')}`}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="orgaoEmissor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Órgão Emissor</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatOrgaoEmissor(field.value)}
                  onChange={(e) => field.onChange(formatOrgaoEmissor(e.target.value))}
                  placeholder="Ex: SSP/SP"
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

export default EmployeeDocumentsSection;
