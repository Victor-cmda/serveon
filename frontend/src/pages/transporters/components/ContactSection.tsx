import { Globe, FileText } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';

interface ContactSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  formatters: {
    website: (value: string | undefined) => string;
    text: (value: string | undefined, maxLength?: number) => string;
  };
}

const ContactSection = ({
  form,
  isLoading,
  formatters,
}: ContactSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Contato e Informações Adicionais</h3>
      
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
                  value={formatters.text(field.value, 500)}
                  onChange={(e) => field.onChange(formatters.text(e.target.value, 500))}
                  disabled={isLoading}
                  className="min-h-[100px] text-base pl-9 pt-3"
                  placeholder="Observações sobre a transportadora (opcional)"
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

export default ContactSection;
