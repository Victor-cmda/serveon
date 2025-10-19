import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { formatText } from '../utils/validationUtils';

interface EmployeeObservationsSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
}

const EmployeeObservationsSection = ({
  form,
  isLoading,
}: EmployeeObservationsSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Observações</FormLabel>
            <FormControl>
              <textarea
                {...field}
                value={formatText(field.value, 500)}
                onChange={(e) =>
                  field.onChange(formatText(e.target.value, 500))
                }
                className="w-full min-h-[120px] px-3 py-2 text-sm border border-input rounded-md bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="OBSERVAÇÕES SOBRE O FUNCIONÁRIO"
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EmployeeObservationsSection;
