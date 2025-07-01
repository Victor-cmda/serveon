import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface CategoryGeneralSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  id?: string;
}

const CategoryGeneralSection = ({
  form,
  isLoading,
  id,
}: CategoryGeneralSectionProps) => {
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
          <p className="text-sm text-muted-foreground">
            {id ? 'Código da categoria' : 'Automático'}
          </p>
        </FormItem>
        
        <div className="md:col-span-3">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Nome da categoria"
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

      <FormField
        control={form.control}
        name="descricao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-input rounded-md bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descrição da categoria"
                disabled={isLoading}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CategoryGeneralSection;
