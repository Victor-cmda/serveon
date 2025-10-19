import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../../components/ui/form';
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
            
            <FormMessage className="text-sm" />
          </FormItem>
        );
      }}
    />
  );
};

export default CEPField;
