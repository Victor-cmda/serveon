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

interface ObservationsSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
}

const ObservationsSection = ({
  form,
  isLoading,
}: ObservationsSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Observações
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
                disabled={isLoading}
                placeholder="Digite observações adicionais (opcional)"
                className="min-h-[120px] resize-none"
                maxLength={500}
              />
            </FormControl>
            <div className="flex justify-between items-center">
              <FormMessage className="text-sm" />
              <span className="text-sm text-muted-foreground">
                {field.value?.length || 0}/500
              </span>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ObservationsSection;
