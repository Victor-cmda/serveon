import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface EmployeePersonalSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  id?: string;
}

const EmployeePersonalSection = ({
  form,
  isLoading,
  id,
}: EmployeePersonalSectionProps) => {
  const estadosCivis = [
    'Solteiro(a)',
    'Casado(a)',
    'Divorciado(a)',
    'Viúvo(a)',
    'Separado(a)',
    'União Estável',
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <FormItem className="md:col-span-2">
          <FormLabel>Código</FormLabel>
          <FormControl>
            <Input
              value={id || 'Novo'}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem className="md:col-span-10">
              <FormLabel>Nome Completo *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o nome completo"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <FormField
          control={form.control}
          name="dataNascimento"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="nacionalidade"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel>Nacionalidade</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Brasileira"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estadoCivil"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel>Estado Civil</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o estado civil" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {estadosCivis.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default EmployeePersonalSection;
