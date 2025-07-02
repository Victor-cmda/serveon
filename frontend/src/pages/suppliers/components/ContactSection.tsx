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
import { getFieldValidationClass, getValidationMessage } from '../utils/validationUtils';
import { cn } from '../../../lib/utils';

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
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="telefone"
          render={({ field }) => {
            const validationClass = getFieldValidationClass(field.value, 'telefone');
            const validationMessage = getValidationMessage(field.value, 'telefone');
            
            return (
              <FormItem>
                <FormLabel className="text-base font-medium">Telefone</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      value={formatters.telefone(field.value || '')}
                      onChange={(e) => field.onChange(e.target.value || '')}
                      disabled={isLoading}
                      placeholder="(11) 98765-4321"
                      className={cn(
                        "h-10 text-base pl-9 transition-colors duration-200",
                        validationClass
                      )}
                    />
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </FormControl>
                {validationMessage && (
                  <p className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    validationMessage.includes('✓') 
                      ? "text-green-600" 
                      : "text-orange-600"
                  )}>
                    {validationMessage}
                  </p>
                )}
                <FormMessage className="text-sm" />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            const validationClass = getFieldValidationClass(field.value, 'email');
            const validationMessage = getValidationMessage(field.value, 'email');
            
            return (
              <FormItem>
                <FormLabel className="text-base font-medium">Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      value={formatters.email(field.value || '')}
                      disabled={isLoading}
                      placeholder="exemplo@empresa.com"
                      className={cn(
                        "h-10 text-base pl-9 transition-colors duration-200",
                        validationClass
                      )}
                      onChange={(e) => field.onChange(e.target.value || '')}
                    />
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </FormControl>
                {validationMessage && (
                  <p className={cn(
                    "text-sm font-medium transition-colors duration-200",
                    validationMessage.includes('✓') 
                      ? "text-green-600" 
                      : "text-orange-600"
                  )}>
                    {validationMessage}
                  </p>
                )}
                <FormMessage className="text-sm" />
              </FormItem>
            );
          }}
        />
      </div>
    </div>
  );
};

export default ContactSection;
