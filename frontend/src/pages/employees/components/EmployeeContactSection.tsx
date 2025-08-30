import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { formatEmail, formatPhone, getFieldValidationClass } from '../utils/validationUtils';

interface EmployeeContactSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
}

const EmployeeContactSection = ({
  form,
  isLoading,
}: EmployeeContactSectionProps) => {
  const emailValue = form.watch('email');
  const telefoneValue = form.watch('telefone');
  const celularValue = form.watch('celular');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Email *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatEmail(field.value)}
                  onChange={(e) => field.onChange(formatEmail(e.target.value))}
                  type="email"
                  placeholder="funcionario@empresa.com"
                  disabled={isLoading}
                  className={`h-10 text-base ${getFieldValidationClass(emailValue, 'email')}`}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Telefone</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatPhone(field.value)}
                  onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  placeholder="(11) 0000-0000"
                  disabled={isLoading}
                  className={`h-10 text-base ${getFieldValidationClass(telefoneValue, 'telefone')}`}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="celular"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Celular</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatPhone(field.value)}
                  onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  disabled={isLoading}
                  className={`h-10 text-base ${getFieldValidationClass(celularValue, 'celular')}`}
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

export default EmployeeContactSection;
