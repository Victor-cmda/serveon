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
import { Badge } from '../../../components/ui/badge';
import { UseFormReturn } from 'react-hook-form';
import { Department } from '../../../types/department';
import { Position } from '../../../types/position';

interface EmployeeProfessionalSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  selectedDepartment: Department | null;
  selectedPosition: Position | null;
  setDepartmentSearchOpen: (open: boolean) => void;
  setPositionSearchOpen: (open: boolean) => void;
  id?: string;
}

const EmployeeProfessionalSection = ({
  form,
  isLoading,
  selectedDepartment,
  selectedPosition,
  setDepartmentSearchOpen,
  setPositionSearchOpen,
  id,
}: EmployeeProfessionalSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="departamentoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
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
              {selectedDepartment && (
                <div className="mt-1">
                  <Badge variant="outline">{selectedDepartment.nome}</Badge>
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cargoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo</FormLabel>
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
              {selectedPosition && (
                <div className="mt-1">
                  <Badge variant="outline">
                    {selectedPosition.nome}
                    {selectedPosition.departamentoNome &&
                      ` (${selectedPosition.departamentoNome})`}
                  </Badge>
                </div>
              )}
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
              <FormLabel>Data de Admissão *</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataDemissao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Demissão</FormLabel>
              <FormControl>
                <Input type="date" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salario"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salário</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...field}
                  disabled={isLoading}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <textarea
                className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Observações sobre o funcionário"
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

export default EmployeeProfessionalSection;
