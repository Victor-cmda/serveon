import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
import { Badge } from '../../../components/ui/badge';
import { useCEPValidation } from '../../../hooks/useCEPValidation';
import { formatCEP } from '../utils/validationUtils';
import { UseFormReturn } from 'react-hook-form';

interface CEPFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
  onAddressFound?: (address: {
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
  }) => void;
  className?: string;
}

const CEPField = ({ form, disabled = false, onAddressFound, className }: CEPFieldProps) => {
  const [shouldValidate, setShouldValidate] = useState(false);

  const { 
    isValidating, 
    validationResult, 
    validateCEP, 
    clearValidation
  } = useCEPValidation({
    onAddressFound
  });

  return (
    <FormField
      control={form.control}
      name="cep"
      render={({ field }) => {
        const cepValue = field.value;

        // Valida CEP quando o valor muda e tem 8 dígitos
        useEffect(() => {
          if (shouldValidate && cepValue) {
            const cleanCEP = cepValue.replace(/\D/g, '');
            if (cleanCEP.length === 8) {
              validateCEP(cepValue);
            } else if (cleanCEP.length === 0) {
              clearValidation();
            }
          }
        }, [cepValue, shouldValidate]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const formattedValue = formatCEP(e.target.value);
          field.onChange(formattedValue);
          setShouldValidate(true);
        };

        const handleBlur = () => {
          field.onBlur();
          if (cepValue) {
            const cleanCEP = cepValue.replace(/\D/g, '');
            if (cleanCEP.length === 8) {
              validateCEP(cepValue);
            }
          }
        };

        const getValidationIcon = () => {
          if (isValidating) {
            return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
          }
          
          if (validationResult) {
            if (validationResult.isValid) {
              return <CheckCircle className="h-4 w-4 text-green-500" />;
            } else {
              return <XCircle className="h-4 w-4 text-red-500" />;
            }
          }

          return null;
        };

        const getFieldClass = () => {
          let baseClass = "h-10 text-base pr-10";
          
          if (isValidating) {
            baseClass += " border-blue-300 focus:border-blue-500";
          } else if (validationResult) {
            if (validationResult.isValid) {
              baseClass += " border-green-300 focus:border-green-500";
            } else {
              baseClass += " border-red-300 focus:border-red-500";
            }
          }
          
          if (className) {
            baseClass += ` ${className}`;
          }
          
          return baseClass;
        };

        return (
          <FormItem className="space-y-2">
            <FormLabel className="text-base font-medium">CEP</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  value={formatCEP(cepValue) || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="00000-000"
                  disabled={disabled}
                  className={getFieldClass()}
                  maxLength={9}
                />
                <div className="absolute right-3 top-2.5">
                  {getValidationIcon()}
                </div>
              </div>
            </FormControl>
            
            {/* Mensagens de validação */}
            {validationResult && (
              <div className="space-y-1">
                {validationResult.isValid && validationResult.data && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    CEP válido - {validationResult.data.cidade}/{validationResult.data.uf}
                  </Badge>
                )}
                
                {!validationResult.isValid && validationResult.error && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validationResult.error}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Mostrar dados encontrados */}
            {validationResult?.isValid && validationResult.data && (
              <div className="text-sm text-muted-foreground bg-green-50 p-2 rounded border border-green-200">
                <div className="font-medium text-green-800 mb-1">Endereço encontrado:</div>
                <div className="space-y-1">
                  {validationResult.data.endereco && (
                    <div><strong>Logradouro:</strong> {validationResult.data.endereco}</div>
                  )}
                  {validationResult.data.bairro && (
                    <div><strong>Bairro:</strong> {validationResult.data.bairro}</div>
                  )}
                  <div><strong>Cidade:</strong> {validationResult.data.cidade}/{validationResult.data.uf}</div>
                  {validationResult.data.ddd && (
                    <div><strong>DDD:</strong> {validationResult.data.ddd}</div>
                  )}
                </div>
              </div>
            )}
            
            <FormMessage className="text-sm" />
          </FormItem>
        );
      }}
    />
  );
};

export default CEPField;
