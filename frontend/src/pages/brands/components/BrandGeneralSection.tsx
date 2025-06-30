import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface BrandGeneralSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  id?: string;
}

const BrandGeneralSection = ({
  form,
  isLoading,
  id,
}: BrandGeneralSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold text-foreground">Dados Gerais</h4>
          <div className="flex-1 h-px bg-border"></div>
        </div>
      </div>
      
      {id && (
        <FormItem>
          <FormLabel>Código</FormLabel>
          <FormControl>
            <Input value={id} disabled className="bg-muted" />
          </FormControl>
          <p className="text-sm text-muted-foreground">
            Código único da marca
          </p>
        </FormItem>
      )}
      
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl>
              <Input
                placeholder="Nome da marca"
                disabled={isLoading}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="descricao"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 text-sm border border-input rounded-md bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Descrição da marca"
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

export default BrandGeneralSection;
