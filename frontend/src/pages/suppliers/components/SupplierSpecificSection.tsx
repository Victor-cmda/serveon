import { Globe, User2, Phone, Clipboard } from 'lucide-react';
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
import { getFieldValidationClass, getValidationMessage } from '../utils/validationUtils';
import { cn } from '../../../lib/utils';

interface Formatters {
  telefone: (value: string | undefined) => string;
  website: (value: string | undefined) => string;
  text: (value: string | undefined, maxLength?: number) => string;
}

interface SupplierSpecificSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  formatters: Formatters;
}

const SupplierSpecificSection = ({
  form,
  isLoading,
  formatters,
}: SupplierSpecificSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => {
              const validationClass = getFieldValidationClass(field.value, 'website');
              const validationMessage = getValidationMessage(field.value, 'website');
              
              return (
                <FormItem>
                  <FormLabel className="text-base font-medium">Website</FormLabel>
                  <FormControl>
                    <div className="relative">                    <Input
                      {...field}
                      value={formatters.website(field.value || '')}
                      disabled={isLoading}
                      placeholder="https://www.exemplo.com"
                      className={cn(
                        "h-10 text-base pl-9 transition-colors duration-200",
                        validationClass
                      )}
                      onChange={(e) => field.onChange(e.target.value || '')}
                    />
                      <Globe className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
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

        <div className="lg:col-span-4">
          <FormField
            control={form.control}
            name="responsavel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Responsável
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      value={formatters.text(field.value || '', 50)}
                      disabled={isLoading}
                      placeholder="Nome do responsável"
                      className="h-10 text-base pl-9"
                      onChange={(e) => field.onChange(e.target.value || '')}
                    />
                    <User2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
        </div>
        
        <div className="lg:col-span-4">
          <FormField
            control={form.control}
            name="celularResponsavel"
            render={({ field }) => {
              const validationClass = getFieldValidationClass(field.value, 'celularResponsavel');
              const validationMessage = getValidationMessage(field.value, 'celularResponsavel');
              
              return (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Celular do Responsável
                  </FormLabel>
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
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
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
                    value={formatters.text(field.value || '', 500)}
                    disabled={isLoading}
                    placeholder="Observações adicionais sobre o fornecedor..."
                    className="min-h-24 text-base pl-9"
                    onChange={(e) => field.onChange(e.target.value || '')}
                  />
                  <Clipboard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
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

export default SupplierSpecificSection;
