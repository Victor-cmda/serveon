import { Clock, Calendar, Eye } from "lucide-react";
import { FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { UseFormReturn } from "react-hook-form";

interface AuditSectionProps {
  form: UseFormReturn<any>;
  data?: {
    id?: number;
    ativo?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  isEditing?: boolean;
}

const AuditSection = ({ form, data, isEditing = false }: AuditSectionProps) => {
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '--';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '--';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h4 className="text-lg font-semibold text-foreground">Informações do Sistema</h4>
        <div className="flex-1 h-px bg-border"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Campo ID - apenas leitura em edição */}
        {isEditing && data?.id && (
          <FormItem className="space-y-2">
            <FormLabel className="text-base font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              ID
            </FormLabel>
            <FormControl>
              <Input
                value={data.id.toString()}
                disabled
                className="bg-muted"
              />
            </FormControl>
          </FormItem>
        )}

        {/* Campo Ativo */}
        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-medium flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Status
              </FormLabel>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <span className="text-sm">
                  {field.value ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </FormItem>
          )}
        />

        {/* Data de Criação - apenas leitura */}
        {isEditing && data?.createdAt && (
          <FormItem className="space-y-2">
            <FormLabel className="text-base font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Criado em
            </FormLabel>
            <FormControl>
              <Input
                value={formatDateTime(data.createdAt)}
                disabled
                className="bg-muted"
              />
            </FormControl>
          </FormItem>
        )}

        {/* Data de Atualização - apenas leitura */}
        {isEditing && data?.updatedAt && (
          <FormItem className="space-y-2">
            <FormLabel className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Atualizado em
            </FormLabel>
            <FormControl>
              <Input
                value={formatDateTime(data.updatedAt)}
                disabled
                className="bg-muted"
              />
            </FormControl>
          </FormItem>
        )}
      </div>
    </div>
  );
};

export default AuditSection;
