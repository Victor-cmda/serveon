import { Globe, User2, Phone, Clipboard } from "lucide-react";
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface SupplierSpecificSectionProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  formatters: any;
}

const SupplierSpecificSection = ({ 
  form, 
  isLoading, 
  formatters
}: SupplierSpecificSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Website
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      disabled={isLoading}
                      className="h-10 text-base pl-9"
                    />
                    <Globe className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
        </div>

        <div className="lg:col-span-6">
          <FormField
            control={form.control}
            name="responsavel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Responsável
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      disabled={isLoading}
                      className="h-10 text-base pl-9"
                    />
                    <User2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-6">
          <FormField
            control={form.control}
            name="celularResponsavel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">
                  Celular do Responsável
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      value={formatters.telefone(field.value)}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isLoading}
                      className="h-10 text-base pl-9"
                    />
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium">
                Observações
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    {...field}
                    disabled={isLoading}
                    className="min-h-24 text-base pl-9"
                  />
                  <Clipboard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage className="text-sm" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default SupplierSpecificSection;
