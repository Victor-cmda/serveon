import { Globe } from 'lucide-react';
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
  formatters: {
    website: (value: string | undefined) => string;
  };
}

const ContactSection = ({
  form,
  isLoading,
  formatters,
}: ContactSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">
              Website
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  value={formatters.website(field.value)}
                  onChange={(e) => field.onChange(formatters.website(e.target.value))}
                  disabled={isLoading}
                  className="h-10 text-base pl-9"
                  placeholder="https://www.transportadora.com.br"
                />
                <Globe className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
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
