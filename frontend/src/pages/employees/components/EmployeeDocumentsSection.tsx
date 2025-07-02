import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { UseFormReturn } from 'react-hook-form';

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
  const formatCPF = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 11);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF *</FormLabel>
              <FormControl>
                <Input
                  placeholder="12345678901"
                  {...field}
                  disabled={isLoading || !!id} // CPF não pode ser editado
                  onChange={(e) => field.onChange(formatCPF(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rg"
          render={({ field }) => (
            <FormItem>
              <FormLabel>RG</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o RG"
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
          name="orgaoEmissor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Órgão Emissor</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: SSP/SP"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default EmployeeDocumentsSection;
