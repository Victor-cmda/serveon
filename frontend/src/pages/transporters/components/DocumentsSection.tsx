import { FileText } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface DocumentsSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  formatters: {
    cnpj: (value: string | undefined) => string;
  };
}

const DocumentsSection = ({
  form,
  isLoading,
  formatters,
}: DocumentsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Documentos</h3>
      
      <FormField
        control={form.control}
        name="cnpj"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              CNPJ *
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  value={formatters.cnpj(field.value)}
                  onChange={(e) => field.onChange(formatters.cnpj(e.target.value))}
                  disabled={isLoading}
                  className="h-10 text-base pl-9"
                  placeholder="00.000.000/0000-00"
                />
                <FileText className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DocumentsSection;
