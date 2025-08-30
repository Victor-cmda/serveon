import { useState, useCallback } from 'react';
import { cepApi, CEPValidationResult } from '../services/cepApi';
import { City } from '../types/location';

interface UseCEPValidationOptions {
  onValidation?: (result: CEPValidationResult) => void;
  onAddressFound?: (address: {
    endereco: string;
    bairro: string;
    cidade: string;
    uf: string;
  }) => void;
  onCityFound?: (city: City) => void; // Novo callback para quando cidade é encontrada no cadastro
}

interface UseCEPValidationReturn {
  isValidating: boolean;
  validationResult: CEPValidationResult | null;
  validateCEP: (cep: string) => Promise<CEPValidationResult>;
  clearValidation: () => void;
  isValid: boolean;
  error: string | null;
}

export const useCEPValidation = (
  options: UseCEPValidationOptions = {}
): UseCEPValidationReturn => {
  const { onValidation, onAddressFound, onCityFound } = options;

  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<CEPValidationResult | null>(null);

  const validateCEP = useCallback(async (cep: string): Promise<CEPValidationResult> => {
    const cleanCEP = cep.replace(/\D/g, '');
    
    // Se CEP estiver vazio, limpa validação
    if (!cleanCEP) {
      const emptyResult: CEPValidationResult = { isValid: true };
      setValidationResult(emptyResult);
      return emptyResult;
    }

    // Se CEP não tem 8 dígitos, não faz validação por API
    if (cleanCEP.length !== 8) {
      const incompleteResult: CEPValidationResult = { 
        isValid: false, 
        error: `CEP incompleto (${cleanCEP.length}/8 dígitos)` 
      };
      setValidationResult(incompleteResult);
      return incompleteResult;
    }

    setIsValidating(true);
    
    try {
      const result = await cepApi.validateAndFetch(cleanCEP);
      setValidationResult(result);
      
      // Chama callback de validação se fornecido
      onValidation?.(result);
      
      // Se encontrou endereço válido, chama callback
      if (result.isValid && result.data) {
        onAddressFound?.({
          endereco: result.data.endereco,
          bairro: result.data.bairro,
          cidade: result.data.cidade,
          uf: result.data.uf
        });

        // Se encontrou cidade no cadastro, chama callback específico
        if (result.data.cidadeEncontrada) {
          onCityFound?.(result.data.cidadeEncontrada);
        }
      }
      
      return result;
    } catch (error) {
      const errorResult: CEPValidationResult = {
        isValid: false,
        error: 'Erro ao validar CEP'
      };
      setValidationResult(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, [onValidation, onAddressFound, onCityFound]);

  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setIsValidating(false);
  }, []);

  // Computed values
  const isValid = validationResult?.isValid ?? true;
  const error = validationResult?.error ?? null;

  return {
    isValidating,
    validationResult,
    validateCEP,
    clearValidation,
    isValid,
    error
  };
};
