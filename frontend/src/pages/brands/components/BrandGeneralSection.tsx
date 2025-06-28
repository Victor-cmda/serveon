import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Switch } from '../../../components/ui/switch';
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
}: BrandGeneralSectionProps) => {  return (
    <div className="space-y-4">
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

      {id && (
        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-base font-medium">
                  Marca Ativa
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Desative para ocultar a marca das listagens
                </p>
              </div>
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default BrandGeneralSection;
