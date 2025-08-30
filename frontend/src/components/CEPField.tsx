import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Input } from './ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Badge } from './ui/badge';
import { useCEPValidation } from '../hooks/useCEPValidation';
import { UseFormReturn } from 'react-hook-form';
import { cn } from '../lib/utils';
import { City } from '../types/location';
import { toast } from '../lib/toast';

interface CEPFieldProps {
  form: UseFormReturn<any>;
  disabled?: boolean;
  onAddressFound?: (address: {
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
  }) => void;
  onCityFound?: (city: City) => void; // Novo callback para cidade encontrada no cadastro
  className?: string;
}

// Função para formatar CEP
const formatCEP = (value: string | undefined): string => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  const cep = digits.slice(0, 8);
  return cep.replace(/(\d{5})(\d{0,3})/, (_, p1, p2) => {
    if (p2) return `${p1}-${p2}`;
    return p1;
  });
};

const CEPField = ({ 
  form, 
  disabled = false, 
  onAddressFound, 
  onCityFound,
  className
}: CEPFieldProps) => {
  const [shouldValidate, setShouldValidate] = useState(false);

  const { 
    isValidating, 
    validationResult, 
    validateCEP, 
    clearValidation
  } = useCEPValidation({
    onAddressFound: (cepData) => {
      if (onAddressFound && cepData.endereco) {
        onAddressFound({
          endereco: cepData.endereco,
          bairro: cepData.bairro,
          cidade: cepData.cidade,
          uf: cepData.uf,
        });
        
        // Toast para informar que campos foram preenchidos automaticamente
        toast.success('Campos preenchidos automaticamente a partir do CEP', {
          description: `${cepData.cidade}/${cepData.uf}`
        });
      }
    },
    onCityFound: (city) => {
      if (onCityFound) {
        onCityFound(city);
        
        // Toast para informar que cidade foi selecionada automaticamente
        toast.success('Cidade selecionada automaticamente do cadastro', {
          description: `${city.nome} - ${city.estadoNome || city.estadoId}`
        });
      }
    }
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
          let baseClass = "h-10 text-base pr-10 transition-colors duration-200";
          
          if (isValidating) {
            baseClass += " border-blue-300 focus:border-blue-500";
          } else if (validationResult) {
            if (validationResult.isValid) {
              baseClass += " border-green-300 focus:border-green-500";
            } else {
              baseClass += " border-red-300 focus:border-red-500";
            }
          }
          
          return cn(baseClass, className);
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
            
            {/* Mensagens de validação - apenas erros */}
            {validationResult && !validationResult.isValid && validationResult.error && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationResult.error}
              </Badge>
            )}
            
            <FormMessage className="text-sm" />
          </FormItem>
        );
      }}
    />
  );
};

export default CEPField;
