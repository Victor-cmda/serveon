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
import { CustomDatePicker, dateToString, stringToDate } from '../../../components/ui/date-picker';
import { UseFormReturn } from 'react-hook-form';
import { formatText } from '../utils/validationUtils';

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
    'SOLTEIRO(A)',
    'CASADO(A)',
    'DIVORCIADO(A)',
    'VIÚVO(A)',
    'SEPARADO(A)',
    'UNIÃO ESTÁVEL',
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <FormItem className="md:col-span-2">
          <FormLabel className="text-base font-medium">Código</FormLabel>
          <FormControl>
            <Input
              value={id || 'Novo'}
              disabled
              className="bg-muted text-muted-foreground h-10 text-base"
            />
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem className="md:col-span-10">
              <FormLabel className="text-base font-medium">Nome Completo *</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatText(field.value, 100)}
                  onChange={(e) => field.onChange(formatText(e.target.value, 100))}
                  placeholder="Digite o nome completo"
                  disabled={isLoading}
                  className="h-10 text-base"
                />
              </FormControl>
              <FormMessage className="text-sm" />
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
              <FormLabel className="text-base font-medium">Data de Nascimento</FormLabel>
              <FormControl>
                <CustomDatePicker
                  date={field.value && field.value.trim() ? stringToDate(field.value) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      field.onChange(dateToString(date));
                    } else {
                      field.onChange('');
                    }
                  }}
                  placeholder="Selecione a data de nascimento"
                  disabled={isLoading}
                  className="text-base"
                  fromYear={1920}
                  toYear={new Date().getFullYear()}
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="nacionalidade"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-base font-medium">Nacionalidade</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={formatText(field.value, 50)}
                  onChange={(e) => field.onChange(formatText(e.target.value, 50))}
                  placeholder="Ex: BRASILEIRA"
                  disabled={isLoading}
                  className="h-10 text-base"
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estadoCivil"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-base font-medium">Estado Civil</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full h-10 text-base">
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
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default EmployeePersonalSection;
