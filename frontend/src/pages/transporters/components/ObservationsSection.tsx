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
  formatters: {
    text: (value: string | undefined, maxLength?: number) => string;
  };
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
              <Textarea
                {...field}
                value={formatters.text(field.value, 500)}
                onChange={(e) => field.onChange(formatters.text(e.target.value, 500))}
                disabled={isLoading}
                className="min-h-[120px] text-base"
                placeholder="Observações sobre a transportadora (opcional)"
              />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ObservationsSection;
