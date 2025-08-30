import { Search, Users, Briefcase } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { DatePicker, dateToString, stringToDate } from '../../../components/ui/date-picker';
import { UseFormReturn } from 'react-hook-form';
import { Department } from '../../../types/department';
import { Position } from '../../../types/position';
import { formatText } from '../utils/validationUtils';

interface EmployeeProfessionalSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  selectedDepartment: Department | null;
  selectedPosition: Position | null;
  setDepartmentSearchOpen: (open: boolean) => void;
  setPositionSearchOpen: (open: boolean) => void;
}

const EmployeeProfessionalSection = ({
  form,
  isLoading,
  selectedDepartment,
  selectedPosition,
  setDepartmentSearchOpen,
  setPositionSearchOpen,
}: EmployeeProfessionalSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="departamentoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Departamento
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <div className="flex w-full items-center gap-2">
                    <div className="relative flex-grow">
                      <Input
                        value={selectedDepartment?.nome || ''}
                        readOnly
                        placeholder="Selecione um departamento"
                        className="cursor-pointer h-10 text-base pl-9"
                        onClick={() => setDepartmentSearchOpen(true)}
                      />
                      <input
                        type="hidden"
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        ref={field.ref}
                        onBlur={field.onBlur}
                      />
                      <Users className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setDepartmentSearchOpen(true)}
                      className="h-10 w-10"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cargoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Cargo</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <div className="flex w-full items-center gap-2">
                    <div className="relative flex-grow">
                      <Input
                        value={selectedPosition?.nome || ''}
                        readOnly
                        placeholder="Selecione um cargo"
                        className="cursor-pointer h-10 text-base pl-9"
                        onClick={() => setPositionSearchOpen(true)}
                      />
                      <input
                        type="hidden"
                        name={field.name}
                        value={field.value || ''}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                        ref={field.ref}
                        onBlur={field.onBlur}
                      />
                      <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setPositionSearchOpen(true)}
                      className="h-10 w-10"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="dataAdmissao"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Data de Admissão *
              </FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value ? stringToDate(field.value) : undefined}
                  onSelect={(date) => field.onChange(date ? dateToString(date) : '')}
                  placeholder="Selecione a data de admissão"
                  disabled={isLoading}
                  className="text-base"
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataDemissao"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Data de Demissão
              </FormLabel>
              <FormControl>
                <DatePicker
                  date={field.value ? stringToDate(field.value) : undefined}
                  onSelect={(date) => field.onChange(date ? dateToString(date) : '')}
                  placeholder="Selecione a data de demissão"
                  disabled={isLoading}
                  className="text-base"
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salario"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">Salário</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  disabled={isLoading}
                  className="h-10 text-base"
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || undefined)
                  }
                />
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-medium">Observações</FormLabel>
            <FormControl>
              <textarea
                {...field}
                value={formatText(field.value, 500)}
                onChange={(e) =>
                  field.onChange(formatText(e.target.value, 500))
                }
                className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="OBSERVAÇÕES SOBRE O FUNCIONÁRIO"
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage className="text-sm" />
          </FormItem>
        )}
      />
    </div>
  );
};

export default EmployeeProfessionalSection;
