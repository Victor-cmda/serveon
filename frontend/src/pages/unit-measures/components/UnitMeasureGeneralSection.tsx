import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface UnitMeasureGeneralSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  id?: string;
}

const UnitMeasureGeneralSection = ({
  form,
  isLoading,
  id,
}: UnitMeasureGeneralSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold text-foreground">Dados Gerais</h4>
          <div className="flex-1 h-px bg-border"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <FormItem>
          <FormLabel>Código</FormLabel>
          <FormControl>
            <Input value={id || 'Novo'} disabled className="bg-muted" />
          </FormControl>
          
        </FormItem>
        
        <div className="md:col-span-2">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome da unidade de medida"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="sigla"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sigla *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: KG, UN, L"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default UnitMeasureGeneralSection;
