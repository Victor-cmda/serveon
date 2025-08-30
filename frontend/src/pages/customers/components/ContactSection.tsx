import { Phone, Mail } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { getFieldValidationClass } from '../utils/validationUtils';

interface Formatters {
  telefone: (value: string | undefined) => string;
  email: (value: string | undefined) => string;
}

interface ContactSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  formatters: Formatters;
}

const ContactSection = ({
  form,
  isLoading,
  formatters,
}: ContactSectionProps) => {
  const telefoneValue = form.watch('telefone');
  const emailValue = form.watch('email');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="telefone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Telefone</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  value={formatters.telefone(field.value)}
                  onChange={(e) => field.onChange(formatters.telefone(e.target.value))}
                  disabled={isLoading}
                  className={`h-10 text-base pl-9 ${getFieldValidationClass(telefoneValue, 'telefone')}`}
                  placeholder="(00) 00000-0000"
                />
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Email</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  value={formatters.email(field.value)}
                  onChange={(e) => field.onChange(formatters.email(e.target.value))}
                  disabled={isLoading}
                  className={`h-10 text-base pl-9 ${getFieldValidationClass(emailValue, 'email')}`}
                  placeholder="email@exemplo.com"
                  type="email"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
    </div>
  );
};

export default ContactSection;
