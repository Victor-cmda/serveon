import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { formatEmail, formatPhone, getFieldValidationClass, getValidationMessage } from '../utils/validationUtils';

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
              {emailValue && (
                <div className="mt-1 text-xs">
                  <span className={
                    getValidationMessage(emailValue, 'email').includes('✓') 
                      ? 'text-green-600' 
                      : 'text-amber-600'
                  }>
                    {getValidationMessage(emailValue, 'email')}
                  </span>
                </div>
              )}
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
              {telefoneValue && (
                <div className="mt-1 text-xs">
                  <span className={
                    getValidationMessage(telefoneValue, 'telefone').includes('✓') 
                      ? 'text-green-600' 
                      : 'text-amber-600'
                  }>
                    {getValidationMessage(telefoneValue, 'telefone')}
                  </span>
                </div>
              )}
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
              {celularValue && (
                <div className="mt-1 text-xs">
                  <span className={
                    getValidationMessage(celularValue, 'celular').includes('✓') 
                      ? 'text-green-600' 
                      : 'text-amber-600'
                  }>
                    {getValidationMessage(celularValue, 'celular')}
                  </span>
                </div>
              )}
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default EmployeeContactSection;
