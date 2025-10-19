import { FileText } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Textarea } from '../../../components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface Formatters {
  text: (value: string | undefined, maxLength?: number) => string;
}

interface ObservationsSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  formatters: Formatters;
}

const ObservationsSection = ({
  form,
  isLoading,
  formatters,
}: ObservationsSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Observações
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Textarea
                  {...field}
                  value={formatters.text(field.value || '', 500)}
                  disabled={isLoading}
                  placeholder="Observações adicionais sobre o fornecedor..."
                  className="min-h-[120px] text-base pl-9 pt-3"
                  onChange={(e) => field.onChange(e.target.value || '')}
                />
                <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              </div>
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ObservationsSection;
