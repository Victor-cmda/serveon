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

interface ContactSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  formatters: any;
}

const ContactSection = ({
  form,
  isLoading,
  formatters,
}: ContactSectionProps) => {
  return (
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
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={isLoading}
                  className="h-10 text-base pl-9"
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
                  value={field.value || ''}
                  disabled={isLoading}
                  className="h-10 text-base pl-9"
                  onChange={(e) => field.onChange(e.target.value || '')}
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ContactSection;
