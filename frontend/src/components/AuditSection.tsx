import { Clock, Calendar, Eye } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel } from './ui/form';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { UseFormReturn } from 'react-hook-form';

interface AuditSectionProps {
  form: UseFormReturn<any>;
  data?: {
    id?: number;
    ativo?: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
  isEditing?: boolean;
  variant?: 'header' | 'section'; // Nova prop para controlar layout
}

const AuditSection = ({ form, data, isEditing = false, variant = 'section' }: AuditSectionProps) => {
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

  // Versão compacta para header
  if (variant === 'header') {
    return (
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {/* Status */}
        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">Status:</span>
              <Switch 
                checked={field.value} 
                onCheckedChange={field.onChange}
                className="scale-75"
              />
              <span className={`text-xs font-medium ${field.value ? 'text-green-600' : 'text-red-500'}`}>
                {field.value ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          )}
        />

        {/* Informações de auditoria em modo edição */}
        {isEditing && (
          <>
            {data?.id && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>ID: {data.id}</span>
              </div>
            )}
            
            {data?.createdAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Criado: {formatDateTime(data.createdAt)}</span>
              </div>
            )}
            
            {data?.updatedAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Atualizado: {formatDateTime(data.updatedAt)}</span>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Versão original para seção
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Status - sempre visível */}
      <FormField
        control={form.control}
        name="ativo"
        render={({ field }) => (
          <FormItem className="space-y-1">
            <FormLabel className="text-xs font-medium flex items-center gap-1">
              <Eye className="h-3 w-3" />
              Status
            </FormLabel>
            <div className="flex items-center space-x-2">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              <span className="text-xs">
                {field.value ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </FormItem>
        )}
      />

      {/* ID - apenas em edição */}
      {isEditing && data?.id && (
        <FormItem className="space-y-1">
          <FormLabel className="text-xs font-medium flex items-center gap-1">
            <Eye className="h-3 w-3" />
            ID
          </FormLabel>
          <FormControl>
            <Input
              value={data.id.toString()}
              disabled
              className="bg-muted text-xs h-8"
            />
          </FormControl>
        </FormItem>
      )}

      {/* Data de Criação - apenas em edição e formato compacto */}
      {isEditing && data?.createdAt && (
        <FormItem className="space-y-1">
          <FormLabel className="text-xs font-medium flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Criado
          </FormLabel>
          <FormControl>
            <Input
              value={formatDateTime(data.createdAt)}
              disabled
              className="bg-muted text-xs h-8"
            />
          </FormControl>
        </FormItem>
      )}

      {/* Data de Atualização - apenas em edição e formato compacto */}
      {isEditing && data?.updatedAt && (
        <FormItem className="space-y-1">
          <FormLabel className="text-xs font-medium flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Atualizado
          </FormLabel>
          <FormControl>
            <Input
              value={formatDateTime(data.updatedAt)}
              disabled
              className="bg-muted text-xs h-8"
            />
          </FormControl>
        </FormItem>
      )}
    </div>
  );
};

export default AuditSection;
